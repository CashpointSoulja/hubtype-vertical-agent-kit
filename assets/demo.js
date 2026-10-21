(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const chat = $('chat'), quick = $('quick'), waStatus = $('waStatus'), wsPill = $('wsPill');
  const sigList = $('sigList'), wsIdle = $('wsIdle'), handoffSlot = $('handoffSlot');
  const timeline = $('timeline'), tlRows = $('tlRows');

  const params = new URLSearchParams(location.search);
  const AUTO = params.get('autoplay') === '1';
  const SPEED = Math.min(20, Math.max(0.25, parseFloat(params.get('speed')) || 1));
  const NARROW = () => window.matchMedia('(max-width: 980px)').matches;

  const AI = 'Auralia AI';
  const HUMAN = 'Marta · Claims specialist';

  class Cancelled extends Error {}
  let gen = 0;
  let cancelers = [];
  let S;
  const events = [];
  window.__demo = { events, get state() { return S; }, get auto() { return AUTO; } };

  function freshState() {
    return {
      claim: null, location: null, incidentTime: null, photos: 0, cover: null,
      plate: null, fault: false, injury: null, sentiment: [], actions: [], intents: [],
      handoff: null, outcome: null
    };
  }
  function emit(type, data) { events.push(Object.assign({ type, gen, at: Math.round(performance.now()) }, data || {})); }
  function setPhase(p) { document.body.dataset.phase = p; emit('phase', { phase: p }); }

  function guard(g) { if (g !== gen) throw new Cancelled(); }
  function wait(g, ms) {
    guard(g);
    return new Promise((resolve, reject) => {
      const c = { cancel: () => { clearTimeout(id); reject(new Cancelled()); } };
      const id = setTimeout(() => {
        cancelers = cancelers.filter(x => x !== c);
        g === gen ? resolve() : reject(new Cancelled());
      }, ms / SPEED);
      cancelers.push(c);
    });
  }
  function readTime(html) {
    const len = html.replace(/<[^>]+>/g, '').length;
    return Math.min(2600, Math.max(900, 500 + len * 16));
  }

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }
  function scrollChat() { chat.scrollTop = chat.scrollHeight; }
  function addMsg(side, html, time, who) {
    const whoHtml = who ? `<span class="who">${who}</span>` : '';
    const m = el(`<div class="msg ${side}">${whoHtml}<div class="body">${html}</div><span class="time">${time}</span></div>`);
    chat.appendChild(m);
    requestAnimationFrame(() => m.classList.add('show'));
    scrollChat();
    emit('msg', { side, who: who || (side === 'out' ? 'customer' : ''), text: m.querySelector('.body').textContent });
    return m;
  }
  function sysLine(text, cls) { chat.appendChild(el(`<div class="${cls || 'sysline'}">${text}</div>`)); scrollChat(); }

  async function bot(g, html, time, typingMs, who) {
    guard(g);
    const t = el('<div class="typing" aria-label="typing"><span></span><span></span><span></span></div>');
    chat.appendChild(t); scrollChat();
    const prev = waStatus.textContent;
    waStatus.textContent = 'typing…';
    try { await wait(g, typingMs || 1300); }
    finally { t.remove(); waStatus.textContent = prev; }
    const m = addMsg('in', html, time, who || AI);
    await wait(g, readTime(html));
    return m;
  }
  async function cust(g, html, time, before) {
    await wait(g, before == null ? 900 : before);
    const m = addMsg('out', html, time);
    await wait(g, 650);
    return m;
  }

  function choose(g, options, defIdx) {
    guard(g);
    return new Promise((resolve, reject) => {
      let done = false, autoTimer = null;
      quick.innerHTML = '';
      const pick = (label, btn) => {
        if (done || g !== gen) return;
        done = true;
        clearTimeout(autoTimer);
        cancelers = cancelers.filter(x => x !== c);
        quick.querySelectorAll('button').forEach(b => { b.disabled = true; });
        btn.classList.add('pressed');
        emit('choice', { label });
        setTimeout(() => { if (g === gen) quick.innerHTML = ''; resolve(label); }, 220);
      };
      const c = { cancel: () => { done = true; clearTimeout(autoTimer); quick.innerHTML = ''; reject(new Cancelled()); } };
      cancelers.push(c);
      options.forEach(o => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = o;
        b.addEventListener('click', () => pick(o, b));
        quick.appendChild(b);
      });
      scrollChat();
      emit('options', { options });
      if (AUTO) {
        const b = quick.querySelectorAll('button')[defIdx || 0];
        autoTimer = setTimeout(() => pick(options[defIdx || 0], b), 1700 / SPEED);
      }
    });
  }

  function sig(time, intent, note, conf, low) {
    wsIdle.hidden = true;
    const pct = Math.round(conf * 100);
    sigList.appendChild(el(`<div class="sig${low ? ' low' : ''}"><span class="tm">${time}</span>
      <span class="what"><b>${intent}</b><small>${note}</small></span>
      <span><span class="bar"><i style="width:${pct}%"></i></span><div class="conf-num">${conf.toFixed(2)}${low ? ' · below' : ''}</div></span></div>`));
    emit('signal', { intent, conf });
  }
  function act(time, text) { S.actions.push({ time, text }); }
  function intent(name, status) {
    const ex = S.intents.find(i => i.name === name);
    if (ex) ex.status = status; else S.intents.push({ name, status });
  }

  const waveHtml = () => { let s = ''; for (let i = 0; i < 30; i++) s += `<i style="height:${5 + Math.round(Math.abs(Math.sin(i * 1.7) * Math.cos(i * .4)) * 19)}px"></i>`; return s; };
  const LOC = '<div class="loc-pin"><div class="loc-map">📍</div><div><b>A206, near Charlton</b><br><span style="font-size:11.5px;color:#667781">Location · London SE7</span></div></div>';
  const PHOTOS = '<div class="photos"><div class="photo"></div><div class="photo b"></div></div>';
  const VOICE = `<div class="voicenote"><div class="vn-play">▶</div><div class="vn-wave">${waveHtml()}</div><span class="vn-dur">0:19</span></div>
    <div class="transcript"><span class="chip">✓ Transcribed</span><br>"The other driver's plate was LD22 XZK. He said sorry, he admitted it was his fault."</div>`;

  /* ---------- workspace ---------- */
  function setPill(text, cls) { wsPill.textContent = text; wsPill.className = 'pill' + (cls ? ' ' + cls : ''); }

  function renderCard(h) {
    const kv = rows => rows.filter(r => r[1]).map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('');
    const intents = S.intents.map(i => {
      const st = { resolved: ['resolved', ''], declined: ['declined', 'dec'], open: ['needs human', 'open'] }[i.status];
      return `<div class="intent"><span class="st ${st[1]}">${st[0]}</span>${i.name}</div>`;
    }).join('');
    const ent = kv([
      ['Claim', S.claim],
      ['Location', S.location],
      ['Incident time', S.incidentTime],
      ['Damage photos', S.photos ? `${S.photos} attached` : null],
      ['Third-party plate', S.plate ? `${S.plate}<span class="src-tag">voice note</span>` : null],
      ['Liability', S.fault ? 'Third party admitted fault<span class="src-tag">voice note</span>' : null],
      ['Breakdown cover', S.cover === 'added' ? 'Added from 1 Nov, £6.40/mo' : S.cover === 'declined' ? 'Offered, declined' : null],
      ['Injury', S.injury]
    ]);
    const acts = S.actions.map(a => `<li><b style="color:var(--purple)">${a.time}</b> ${a.text}</li>`).join('') || '<li class="no">None yet: handed over at first contact</li>';
    const sent = S.sentiment.map((s, i) => `<span class="s${i === S.sentiment.length - 1 ? ' now' : ''}">${s}</span>`).join('<span>→</span>');
    const card = el(`<div class="handoff-card" id="handoffCard">
      <div class="hc-head"><span class="dot"></span><span class="t" id="hcTitle">Handoff requested · Sofia Leblanc</span>
        <span class="conf">confidence ${h.conf.toFixed(2)} · ${h.intent}</span></div>
      <div class="hc-body">
        <div class="hc-block"><h4>Customer</h4><dl class="kv">${kv([
          ['Name', 'Sofia Leblanc'], ['Channel', 'WhatsApp · +44 7700 900418'], ['Policy', 'AU-2291 · Comprehensive motor'], ['Renewal', '14 Jan'], ['Vehicle', '2021 VW Golf · LK21 RTB']
        ])}</dl></div>
        <div class="hc-block"><h4>Intents</h4>${intents}</div>
        <div class="hc-block"><h4>Entities captured</h4><dl class="kv">${ent}</dl></div>
        <div class="hc-block"><h4>Actions taken by AI</h4><ul>${acts}</ul></div>
        <div class="hc-block full"><h4>Sentiment</h4><div class="sent">${sent}<span style="color:var(--muted)">· ${h.sentimentNote}</span></div></div>
        <div class="hc-block full"><h4>Escalation reason</h4><div class="reason"><b>Policy rule: injury → licensed claims handler.</b> ${h.reason} Model confidence ${h.conf.toFixed(2)}, below the 0.75 threshold.<br><span style="color:var(--muted)">Suggested next step: ${h.next}</span></div></div>
        <div class="hc-actions"><button type="button" id="acceptBtn">Accept conversation</button><span class="sla" id="slaNote">Routed to: Motor injury team · pick up within 2 min</span></div>
      </div></div>`);
    handoffSlot.innerHTML = '';
    handoffSlot.appendChild(card);
    return card;
  }

  function renderTimeline(extra) {
    tlRows.innerHTML = '';
    S.actions.concat(extra || []).forEach(a => tlRows.appendChild(el(`<div class="row"><b>${a.time}</b><span>${a.text}</span></div>`)));
    timeline.hidden = false;
  }

  function waitAccept(g) {
    guard(g);
    const btn = $('acceptBtn');
    return new Promise((resolve, reject) => {
      let done = false, autoTimer = null;
      const c = { cancel: () => { done = true; clearTimeout(autoTimer); reject(new Cancelled()); } };
      cancelers.push(c);
      const go = () => {
        if (done || g !== gen) return;
        done = true; clearTimeout(autoTimer);
        cancelers = cancelers.filter(x => x !== c);
        btn.disabled = true; btn.classList.add('pressed'); btn.textContent = 'Accepted';
        emit('accept');
        resolve();
      };
      btn.addEventListener('click', go);
      if (AUTO) autoTimer = setTimeout(go, 3200 / SPEED);
    });
  }

  async function handoff(g, h) {
    S.handoff = h;
    setPhase('handoff');
    emit('handoff', { intent: h.intent, conf: h.conf });
    setPill('Handoff pending', 'pending');
    waStatus.textContent = 'connecting you to a specialist…';
    sysLine('Auralia AI is bringing in a claims specialist');
    const card = renderCard(h);
    if (NARROW() && !AUTO) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await waitAccept(g);
    setPhase('human');
    setPill('In conversation · Marta R.', 'live');
    card.querySelector('.dot').classList.add('ok');
    $('hcTitle').textContent = 'Accepted · Marta R. (Motor injury team)';
    $('slaNote').textContent = 'Picked up with full context. The AI stays on as copilot.';
    renderTimeline([{ time: h.time, text: 'Handoff accepted by Marta R. with full context' }]);
    waStatus.textContent = 'Marta · Claims specialist';
    if (NARROW() && !AUTO) document.querySelector('.phone').scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(g, 700);
    sysLine('Marta (Claims specialist) joined the chat');
  }

  function finish(outcome) {
    S.outcome = outcome;
    setPhase('done');
    emit('end', { outcome });
  }

  /* ---------- the journey ---------- */
  async function journey(g) {
    setPhase('ai');
    sysLine('Today', 'day');
    sysLine('This business uses a secure service to manage this chat. Tap to learn more.', 'e2e');
    await cust(g, "Hi, I've just been in a car accident on the A206. What do I do?", '14:01', 700);
    S.sentiment.push('shaken');
    S.incidentTime = 'Today, ~13:55';
    intent('Report accident (FNOL)', 'open');
    sig('14:01', 'FNOL · report accident', 'new claim journey · sentiment: shaken', 0.96);
    await bot(g, "I'm sorry, Sofia, that sounds stressful. First things first: are you or anyone else hurt?", '14:01');
    const a = await choose(g, ["No, everyone's fine", 'Yes / not sure'], 0);
    await cust(g, a, '14:01', 250);
    if (a !== "No, everyone's fine") return injuryAtStart(g);

    sig('14:01', 'FNOL · injury check', 'customer reports no injuries', 0.94);
    await bot(g, "Good. Let's get your claim started now. Can you share your location?", '14:01', 1100);
    await cust(g, LOC, '14:02');
    S.location = 'A206, near Charlton, London SE7';
    S.claim = 'HT-48210';
    act('14:02', 'Claim HT-48210 opened (FNOL)');
    act('14:02', 'Incident location logged: A206, near Charlton');
    sig('14:02', 'FNOL · claim opened', 'entities: location, incident time', 0.95);
    await bot(g, 'Thanks. Claim <b>HT-48210</b> is open and the location is logged. Can you send a couple of photos of the damage?', '14:02', 1400);
    await cust(g, PHOTOS, '14:03', 1100);
    S.photos = 2;
    act('14:03', '2 damage photos attached to HT-48210');
    intent('Report accident (FNOL)', 'resolved');
    sig('14:03', 'FNOL · evidence', '2 photos attached', 0.95);

    await cust(g, "Also, while I'm here, can I add breakdown cover to my policy?", '14:04', 1300);
    sig('14:04', 'Policy change · breakdown cover', 'second intent · claim context kept', 0.93);
    await bot(g, 'Yes, I can do both in this chat. Your policy <b>AU-2291</b> is eligible for breakdown cover at <b>£6.40/month</b>. Shall I add it from 1 November?', '14:04', 1600);
    const b = await choose(g, ['Confirm', 'Not now'], 0);
    await cust(g, b, '14:04', 250);
    if (b === 'Confirm') {
      S.cover = 'added';
      intent('Add breakdown cover', 'resolved');
      act('14:04', 'Breakdown cover added to AU-2291 from 1 Nov (£6.40/mo)');
      sig('14:04', 'Policy change · confirmed', 'cover added · back to FNOL', 0.97);
      await bot(g, 'Done. Breakdown cover starts on 1 November at £6.40/month. Your claim <b>HT-48210</b> stays open with me.', '14:04', 1200);
    } else {
      S.cover = 'declined';
      intent('Add breakdown cover', 'declined');
      act('14:04', 'Breakdown cover offered; customer declined, policy unchanged');
      sig('14:04', 'Policy change · declined', 'no change made · back to FNOL', 0.96);
      await bot(g, "No problem, I haven't changed anything on your policy. Just ask here if you want it later. Back to your claim:", '14:04', 1200);
    }
    S.sentiment.push('calmer');
    await bot(g, "Did you get the other driver's details? A voice note is fine if that's easier.", '14:04', 1000);
    intent('Capture third-party details', 'open');
    const vn = await cust(g, VOICE, '14:05', 1500);
    await wait(g, 900);
    vn.querySelector('.transcript').classList.add('show');
    scrollChat();
    S.plate = 'LD22 XZK';
    S.fault = true;
    act('14:05', 'Voice note (0:19) transcribed: plate LD22 XZK, fault admitted');
    sig('14:05', 'Evidence · voice note', 'transcribed · plate LD22 XZK · fault admitted', 0.9);
    await wait(g, 900);
    await bot(g, "Got it. I've added plate <b>LD22 XZK</b> and the other driver's admission of fault to claim <b>HT-48210</b>. An assessor will be in touch within 24 hours.", '14:05', 1700);
    act('14:05', 'Third-party plate and fault statement added to HT-48210');
    intent('Capture third-party details', 'resolved');

    await wait(g, 600);
    sysLine('36 minutes later', 'timejump');
    const c = await choose(g, ["My neck's started hurting", "Thanks, that's all"], 0);
    if (c === "Thanks, that's all") {
      await cust(g, "Thanks, that's all for now", '14:41', 250);
      sig('14:41', 'Close · thanks', 'no policy trigger · contained', 0.97);
      await bot(g, "You're welcome, Sofia. Take care, and message here any time about <b>HT-48210</b>.", '14:41', 1000);
      setPill('Resolved by AI · no handoff', 'closed');
      wsIdle.hidden = false;
      wsIdle.textContent = 'Resolved by the AI agent. No handoff needed: no injury or other policy trigger came up.';
      renderTimeline();
      return finish('contained');
    }
    await cust(g, "Actually, my neck's started hurting a bit. Is that normal?", '14:41', 250);
    S.injury = 'Neck pain, onset ~40 min after collision';
    S.sentiment.push('anxious');
    intent('Possible injury (neck pain)', 'open');
    sig('14:41', 'Injury · possible whiplash', 'policy rule: injury → licensed handler', 0.61, true);
    await bot(g, "Thanks for telling me, Sofia. Anything involving an injury needs a specialist claims handler, so I'm bringing one in now. They can see everything above, so you won't need to repeat a thing. If the pain gets worse, call 111, or 999 in an emergency.", '14:41', 1800);
    await handoff(g, {
      intent: 'injury intent', conf: 0.61, time: '14:42',
      reason: 'Customer reported neck pain about 40 minutes after the collision.',
      sentimentNote: 'anxious but cooperative',
      next: 'check she is getting medical advice, confirm whether the car is driveable, book an injury call.'
    });
    await bot(g, `Hi Sofia, Marta here from the claims team. I can see everything: claim HT-48210, your photos, plate LD22 XZK${S.cover === 'added' ? ' and your new breakdown cover' : ''}. Neck pain after a collision is common, but please get it checked today. Was the car driveable afterwards?`, '14:42', 2000, HUMAN);
    const d = await choose(g, ['Yes, I drove it home', 'No, it needed towing'], 0);
    await cust(g, d, '14:43', 250);
    if (d.startsWith('Yes')) {
      act('14:43', 'Marta: vehicle driveable; injury call booked for tomorrow 10:00');
      await bot(g, "Good. I've noted it's driveable and logged the neck pain as a possible injury on HT-48210. I'll call you tomorrow at 10:00 to take the details properly. Nothing you've told us needs repeating.", '14:43', 1700, HUMAN);
    } else {
      act('14:43', 'Marta: recovery arranged to approved repairer; injury call booked for tomorrow 10:00');
      await bot(g, "Okay. I've arranged recovery to an approved repairer under your claim, and logged the neck pain as a possible injury on HT-48210. I'll call you tomorrow at 10:00 to take the details properly.", '14:43', 1700, HUMAN);
    }
    renderTimeline([{ time: '14:42', text: 'Handoff accepted by Marta R. with full context' }]);
    finish('handoff');
  }

  async function injuryAtStart(g) {
    S.injury = 'Possible injury reported at first contact';
    intent('Possible injury', 'open');
    sig('14:01', 'Injury · reported at first contact', 'policy rule: injury → licensed handler', 0.58, true);
    await bot(g, "Thank you for telling me. If anyone is seriously hurt, call 999 now. Because someone may be injured, I'm bringing in a specialist claims handler straight away. They'll see this whole chat, so you won't need to repeat anything.", '14:01', 1600);
    await handoff(g, {
      intent: 'injury intent', conf: 0.58, time: '14:02',
      reason: 'Customer answered "Yes / not sure" to the injury check at first contact. No claim opened yet.',
      sentimentNote: 'shaken',
      next: 'confirm nobody needs emergency help, then open the claim and capture location.'
    });
    await bot(g, "Hi Sofia, Marta here from the claims team. I'll take it from here and open the claim for you. Is anyone hurt badly enough to need an ambulance?", '14:02', 1600, HUMAN);
    const a = await choose(g, ["No ambulance, my neck's just sore", "I'm not sure"], 0);
    await cust(g, a, '14:02', 250);
    S.claim = 'HT-48210';
    act('14:03', 'Marta: claim HT-48210 opened with possible injury flagged');
    await bot(g, "Thanks. I've opened claim <b>HT-48210</b> and logged a possible neck injury. If it gets worse, call 111, or 999 in an emergency. When you're ready, share your location and I'll guide you through the rest here.", '14:03', 1700, HUMAN);
    renderTimeline([{ time: '14:02', text: 'Handoff accepted by Marta R. with full context' }]);
    finish('handoff-early');
  }

  /* ---------- lifecycle ---------- */
  function reset() {
    gen++;
    cancelers.splice(0).forEach(c => c.cancel());
    S = freshState();
    chat.innerHTML = ''; quick.innerHTML = '';
    sigList.innerHTML = ''; handoffSlot.innerHTML = ''; tlRows.innerHTML = '';
    timeline.hidden = true;
    wsIdle.hidden = false;
    wsIdle.textContent = 'The AI agent is handling this conversation. The workspace scores every turn and only asks for a human when confidence drops or a policy rule fires.';
    setPill('AI handling · monitoring');
    waStatus.textContent = 'AI assistant · online';
    emit('reset');
  }
  function start() {
    reset();
    const g = gen;
    journey(g).catch(e => { if (!(e instanceof Cancelled)) { console.error(e); } });
  }

  $('restartBtn').addEventListener('click', start);
  if (AUTO) {
    $('modeLabel').textContent = 'Autoplay · hands-free walkthrough';
    $('modeSwitch').textContent = 'Switch to interactive';
    $('modeSwitch').href = location.pathname + '#demo';
    document.querySelector('.controls .hint').hidden = true;
  }

  let started = false;
  const kick = () => { if (!started) { started = true; start(); } };
  if (AUTO) {
    S = freshState();
    window.addEventListener('load', () => {
      document.querySelector('.controls').scrollIntoView({ behavior: 'instant', block: 'start' });
      setTimeout(kick, 800);
    });
  } else if ('IntersectionObserver' in window) {
    S = freshState();
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); kick(); } }, { threshold: 0.2 });
    io.observe(document.querySelector('.phone'));
  } else {
    kick();
  }
})();
