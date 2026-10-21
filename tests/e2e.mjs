// End-to-end checks for the demo. Usage: BASE_URL=http://localhost:8080 node e2e.mjs
import { chromium, devices } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const results = [];
const record = (id, name, pass, detail) => { results.push({ id, name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' :: ' + detail : ''}`); };

const browser = await chromium.launch();

async function open(query, ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  // Flag any message rendered while the typing indicator is still on screen.
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener('DOMContentLoaded', () => {
      const chat = document.getElementById('chat');
      new MutationObserver(ms => {
        for (const m of ms) for (const n of m.addedNodes) {
          if (n.classList && n.classList.contains('msg') && chat.querySelector('.typing')) window.__violations.push(n.textContent.slice(0, 60));
        }
      }).observe(chat, { childList: true });
    });
  });
  await page.goto(BASE + '/' + query);
  return { ctx, page, errors };
}
const events = page => page.evaluate(() => window.__demo.events.filter(e => e.gen === window.__demo.events.at(-1).gen || true));
const lastGen = async page => page.evaluate(() => Math.max(...window.__demo.events.map(e => e.gen)));
async function genEvents(page) { const g = await lastGen(page); return (await events(page)).filter(e => e.gen === g); }
async function waitDone(page, timeout) { await page.waitForFunction(() => document.body.dataset.phase === 'done', null, { timeout }); }

// Click through interactive mode: answer each prompt with the given label (or first option), accept handoff when it appears.
async function drive(page, answers, timeout = 120000) {
  const deadline = Date.now() + timeout;
  let idx = 0;
  while (Date.now() < deadline) {
    const phase = await page.evaluate(() => document.body.dataset.phase);
    if (phase === 'done') return true;
    const btns = page.locator('#quick button:not([disabled])');
    if (await btns.count()) {
      const want = answers[idx];
      const target = want ? page.locator('#quick button:not([disabled])', { hasText: want }) : btns.first();
      if (await target.count()) { await target.first().click(); idx++; }
    }
    const acc = page.locator('#acceptBtn:not([disabled])');
    if (await acc.count()) await acc.click();
    await page.waitForTimeout(120);
  }
  return false;
}
function dupCheck(evs) {
  const msgs = evs.filter(e => e.type === 'msg').map(e => e.side + '|' + e.text);
  const dups = msgs.filter((m, i) => msgs.indexOf(m) !== i && !/^out\|(Confirm|Not now)$/.test(m));
  return dups;
}

// 1. Autoplay, real speed
{
  const { ctx, page, errors } = await open('?autoplay=1');
  const t0 = Date.now();
  let ok = true, detail = '';
  try { await waitDone(page, 150000); } catch { ok = false; detail = 'did not reach done'; }
  const evs = await genEvents(page);
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  const choices = evs.filter(e => e.type === 'choice').map(e => e.label);
  const dups = dupCheck(evs);
  const handoffs = evs.filter(e => e.type === 'handoff').length;
  const accepts = evs.filter(e => e.type === 'accept').length;
  const viol = await page.evaluate(() => window.__violations);
  const tl = await page.$$eval('#tlRows .row', rs => rs.map(r => r.textContent));
  const tlDup = tl.filter((r, i) => tl.indexOf(r) !== i);
  const outcome = await page.evaluate(() => window.__demo.state.outcome);
  ok = ok && outcome === 'handoff' && choices.length === 4 && dups.length === 0 && handoffs === 1 && accepts === 1 && viol.length === 0 && tlDup.length === 0;
  record('T1', 'Autoplay plays the full journey once, no double-fires', ok,
    `${secs}s · outcome=${outcome} · choices=${JSON.stringify(choices)} · msgs=${evs.filter(e => e.type === 'msg').length} · dup msgs=${dups.length} · handoffs=${handoffs} · accepts=${accepts} · msg-during-typing=${viol.length} · timeline rows=${tl.length} (dups ${tlDup.length})`);
  // Context card sections
  const heads = await page.$$eval('#handoffCard h4', hs => hs.map(h => h.textContent));
  const need = ['Customer', 'Intents', 'Entities captured', 'Actions taken by AI', 'Sentiment', 'Escalation reason'];
  const missing = need.filter(n => !heads.includes(n));
  const cardText = await page.textContent('#handoffCard');
  const entOk = ['HT-48210', 'LD22 XZK', 'A206', 'Third party admitted fault', 'Added from 1 Nov', 'Neck pain'].every(s => cardText.includes(s));
  record('T6', 'Context card: customer, policy, intents, entities, actions, sentiment, reason', missing.length === 0 && entOk, `sections=${heads.join(' / ')}${missing.length ? ' · missing ' + missing : ''} · entities present=${entOk}`);
  const humanMsgs = evs.filter(e => e.type === 'msg' && e.who.startsWith('Marta')).length;
  const status = await page.textContent('#waStatus');
  const pill = await page.textContent('#wsPill');
  record('T7', 'Accept flips workspace to in-conversation and human persona continues', humanMsgs >= 2 && /Marta/.test(pill) && /Marta/.test(status), `pill="${pill}" · status="${status}" · Marta messages=${humanMsgs}`);
  await page.screenshot({ path: 'screenshots/desktop-autoplay-end.png' });
  record('T11a', 'No console errors (autoplay)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 2. Interactive default path, real speed, plus typing race check and double-click guard
{
  const { ctx, page, errors } = await open('#demo');
  await page.waitForSelector('#quick button');
  // double-click the first quick reply fast
  const first = await page.locator('#quick button').first().elementHandle();
  await first.dblclick();
  await page.waitForTimeout(400);
  // a third tap on the same, now-used button must do nothing
  await first.click({ force: true, timeout: 1000 }).catch(() => {});
  // the double-click above already answered the first prompt
  const done = await drive(page, ['Confirm', "My neck's started hurting", 'Yes, I drove it home']);
  const evs = await genEvents(page);
  const choices = evs.filter(e => e.type === 'choice').map(e => e.label);
  const viol = await page.evaluate(() => window.__violations);
  // options must never be shown while a bot message is still being typed
  const optEvents = evs.filter(e => e.type === 'options');
  const dups = dupCheck(evs);
  const ok = done && choices.length === 4 && viol.length === 0 && dups.length === 0;
  record('T2', 'Interactive mode advances on taps; no message lands mid-typing; double-tap ignored', ok,
    `done=${done} · choices=${JSON.stringify(choices)} · option prompts=${optEvents.length} · msg-during-typing=${viol.length} · dup msgs=${dups.length}`);
  // handoff timing
  const order = evs.filter(e => ['msg', 'handoff', 'signal'].includes(e.type));
  const hIdx = order.findIndex(e => e.type === 'handoff');
  const neckIdx = order.findIndex(e => e.type === 'msg' && /neck/i.test(e.text) && e.side === 'out');
  const preSignals = order.slice(0, hIdx).filter(e => e.type === 'signal' && !/Injury/.test(e.intent));
  const minPre = Math.min(...preSignals.map(e => e.conf));
  record('T5', 'Handoff fires only after the injury message', hIdx > neckIdx && neckIdx > 0 && evs.filter(e => e.type === 'handoff').length === 1 && minPre >= 0.75,
    `neck msg at #${neckIdx}, handoff at #${hIdx}, lowest pre-injury confidence ${minPre.toFixed(2)}`);
  const claimIds = (await page.textContent('#chat')).match(/HT-\d+/g);
  record('T3', 'Multi-intent state: one claim ID carried across the thread', new Set(claimIds).size === 1, `${claimIds.length} references, unique: ${[...new Set(claimIds)]}`);
  const vn = await page.locator('.voicenote').count();
  const tr = await page.locator('.transcript.show').textContent();
  record('T4', 'Voice note shows waveform, duration and transcription chip', vn === 1 && /LD22 XZK/.test(tr) && /Transcribed/.test(tr), tr.replace(/\s+/g, ' ').trim());
  await page.screenshot({ path: 'screenshots/desktop-interactive-end.png' });
  record('T11b', 'No console errors (interactive)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 3. Branch: "Not now"
{
  const { ctx, page, errors } = await open('?speed=4#demo');
  const done = await drive(page, [null, 'Not now', "My neck's started hurting", 'No, it needed towing']);
  const chatText = await page.textContent('#chat');
  const card = await page.textContent('#handoffCard');
  const bad = /Breakdown cover starts|new breakdown cover|cover added/i.test(chatText) || /Added from 1 Nov/.test(card);
  record('T13', '"Not now" leaves policy unchanged everywhere', done && !bad && /Offered, declined/.test(card) && /haven't changed anything/.test(chatText), `done=${done} · card says declined=${/Offered, declined/.test(card)} · any "added" wording=${bad}`);
  record('T11c', 'No console errors (Not now branch)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 4. Branch: "Yes / not sure" to the injury question
{
  const { ctx, page, errors } = await open('?speed=4#demo');
  const done = await drive(page, ['Yes / not sure']);
  const evs = await genEvents(page);
  const chatText = await page.textContent('#chat');
  const reason = await page.textContent('#handoffCard .reason');
  const continuedScript = /Let's get your claim started|breakdown cover/i.test(chatText);
  const outcome = await page.evaluate(() => window.__demo.state.outcome);
  record('T14', '"Yes / not sure" escalates immediately instead of continuing the no-injury script', done && !continuedScript && outcome === 'handoff-early' && evs.filter(e => e.type === 'handoff').length === 1 && /first contact/.test(reason),
    `outcome=${outcome} · continued no-injury script=${continuedScript}`);
  record('T11d', 'No console errors (injury-at-start branch)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 5. Branch: no injury at all -> no handoff
{
  const { ctx, page, errors } = await open('?speed=4#demo');
  const done = await drive(page, [null, 'Confirm', "Thanks, that's all"]);
  const evs = await genEvents(page);
  const handoffs = evs.filter(e => e.type === 'handoff').length;
  const card = await page.locator('#handoffCard').count();
  const pill = await page.textContent('#wsPill');
  record('T15', 'No injury mentioned → no handoff, conversation contained by AI', done && handoffs === 0 && card === 0, `handoffs=${handoffs} · pill="${pill}"`);
  record('T11e', 'No console errors (contained branch)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 6. Restart mid-journey leaves no stale messages
{
  const { ctx, page, errors } = await open('?speed=2#demo');
  await page.waitForSelector('#quick button');
  await page.locator('#quick button').first().click();
  await page.waitForTimeout(2500);
  await page.click('#restartBtn');
  await page.waitForTimeout(300);
  await page.click('#restartBtn');
  const done = await drive(page, [null, 'Confirm', "My neck's started hurting", null]);
  const evs = await genEvents(page);
  const allMsgs = await page.$$eval('#chat .msg', ms => ms.map(m => m.textContent));
  const firstCount = allMsgs.filter(t => t.includes('car accident on the A206')).length;
  record('T16', 'Restart mid-journey: clean replay, no stale or duplicated messages', done && firstCount === 1 && dupCheck(evs).length === 0, `opening message count=${firstCount} · dup msgs=${dupCheck(evs).length}`);
  record('T11f', 'No console errors (restart)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 7. Mobile
for (const [name, dev] of [['iPhone 13', devices['iPhone 13']], ['Pixel 7', devices['Pixel 7']]]) {
  const { ctx, page, errors } = await open('?speed=3', { ...dev });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: `screenshots/mobile-${name.replace(/\s/g, '')}-hero.png` });
  await page.locator('.phone').scrollIntoViewIfNeeded();
  const phone = await page.locator('.phone').boundingBox();
  const vw = page.viewportSize().width;
  const done = await drive(page, [null, 'Confirm', "My neck's started hurting", null]);
  const overflowEnd = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.locator('#handoffCard').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `screenshots/mobile-${name.replace(/\s/g, '')}-handoff.png` });
  await page.locator('.phone').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `screenshots/mobile-${name.replace(/\s/g, '')}-phone.png` });
  const ok = overflow <= 0 && overflowEnd <= 0 && phone.x >= 0 && phone.x + phone.width <= vw + 1 && done && errors.length === 0;
  record('T9', `Mobile layout (${name}, ${vw}px): stacks, no horizontal scroll, journey completes`, ok, `overflow start/end=${overflow}/${overflowEnd}px · phone ${Math.round(phone.width)}px wide at x=${Math.round(phone.x)} · done=${done} · console errors=${errors.length}`);
  await ctx.close();
}

// 8. Static page checks
{
  const { ctx, page, errors } = await open('');
  const logo = await page.$eval('header img.logo', i => ({ w: i.naturalWidth, src: i.getAttribute('src'), x: i.getBoundingClientRect().x, y: i.getBoundingClientRect().y, wrapX: i.closest('.wrap').getBoundingClientRect().x + parseFloat(getComputedStyle(i.closest('.wrap')).paddingLeft), first: i.closest('.wrap').firstElementChild.contains(i) }));
  record('T10', 'Hubtype logo loads top-left; brand colours applied', logo.w > 0 && logo.first && Math.abs(logo.x - logo.wrapX) < 1 && logo.y < 40 &&
    (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) === 'rgb(248, 248, 250)' &&
    (await page.evaluate(() => getComputedStyle(document.querySelector('.hero')).backgroundImage)).includes('rgb(32, 0, 102)'),
    `logo ${logo.src} loaded, first header item at container left edge (${Math.round(logo.x)},${Math.round(logo.y)}) · body bg #F8F8FA · hero #200066`);
  const body = await page.evaluate(() => document.body.innerText);
  const sampleCount = (body.match(/sample data/gi) || []).length;
  record('T12', 'Sample-data line appears exactly once', sampleCount === 1, `occurrences=${sampleCount}`);
  const footer = (await page.textContent('footer')).trim();
  record('T17', 'Footer credits Ayo Ahmed alone', /^Unofficial concept by Ayo Ahmed\./.test(footer), footer);
  const links = await page.$$eval('#evidence a[href^="http"]', as => [...new Set(as.map(a => a.href))]);
  const expect = {
    'aws.amazon.com': ['more complex issues might still require human intervention', 'services provided are a little slow'],
    'www.capterra.co.uk': ['6-8 weeks'],
    'www.aries.global': ['vertical-specific solutions', 'voice and multimodal', 'revamped its go-to-market engine'],
    'www.hubtype.com': ["automated 85% of our WhatsApp interactions"]
  };
  const linkRes = [];
  const sp = await (await browser.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' })).newPage();
  for (const l of links) {
    const host = new URL(l).hostname;
    let status = 'ERR', found = 0;
    try {
      const r = await sp.goto(l, { timeout: 40000 });
      status = r.status();
      await sp.waitForTimeout(6000);
      const txt = (await sp.evaluate(() => document.body.innerText)).replace(/[\u2018\u2019]/g, "'");
      found = (expect[host] || []).filter(q => txt.includes(q)).length;
    } catch (e) { status = 'ERR ' + e.message.slice(0, 40); }
    linkRes.push({ host, status, ok: status === 200 && found === (expect[host] || []).length, detail: `${host}=${status}, quotes found ${found}/${(expect[host] || []).length}` });
  }
  record('T18', 'Every evidence link opens and contains the quoted text', links.length >= 4 && linkRes.every(r => r.ok), linkRes.map(r => r.detail).join(' · '));
  await page.screenshot({ path: 'screenshots/desktop-full.png', fullPage: true });
  record('T11g', 'No console errors (static load)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
import('fs').then(fs => fs.writeFileSync('results.json', JSON.stringify(results, null, 2)));
process.exitCode = failed.length ? 1 : 0;
