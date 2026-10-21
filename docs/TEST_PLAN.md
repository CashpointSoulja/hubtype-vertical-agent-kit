# Test plan and results

Automated end-to-end suite: `tests/e2e.mjs` (Playwright, headless Chromium). It drives the real page, served as static files, and asserts on the DOM and on the demo's event log (`window.__demo.events`). A MutationObserver installed before page load flags any chat message that appears while a typing indicator is showing.

Run: `cd tests && npm install && npx playwright install chromium && BASE_URL=http://localhost:8080 npm test`

## Results: 21 Oct 2026, local static server, Chromium. 24/24 passed

| # | Test | How it's checked | Result | Observed |
|---|------|------------------|--------|----------|
| T1 | Autoplay plays the full journey once, no double-fires | `?autoplay=1` at real speed, wait for `phase=done`, count events | PASS | 65s · 4 choices · 19 messages · 0 duplicate messages · 1 handoff · 1 accept · 0 messages during typing · 8 timeline rows, 0 duplicates |
| T2 | Interactive mode advances on taps; double-tap ignored; no message lands mid-typing | Double-click the first reply, tap the used button again, then tap through at real speed | PASS | 4 choices recorded, 4 option prompts, 0 duplicates, 0 messages during typing |
| T3 | Multi-intent state: one claim ID across the thread | Collect `HT-\d+` from the chat | PASS | 5 references, all HT-48210 |
| T4 | Voice note shows waveform, duration and transcription chip | DOM check | PASS | Chip "Transcribed" with plate LD22 XZK |
| T5 | Handoff fires only after the injury message | Event order: injury message index vs handoff index; confidence of earlier turns | PASS | Injury message #21, handoff #24, lowest pre-injury confidence 0.90 (threshold 0.75) |
| T6 | Context card is complete | Section headings and entity values | PASS | Customer · Intents · Entities captured · Actions taken by AI · Sentiment · Escalation reason; policy, plate, location and cover present |
| T7 | Accept flips workspace and human persona continues | Click Accept | PASS | Pill "In conversation · Marta R.", chat header "Marta · Claims specialist", 2 Marta messages |
| T8 | No tool, model or builder attribution in page, repo, docs or git history | `grep` over working tree and `git log --all` | PASS | No matches (only CSS `cursor:` and the product word "copilot" in the workspace copy) |
| T9a | Mobile layout, iPhone 13 (390px) | Device emulation, full journey | PASS | 0px horizontal overflow at start and end · phone 358px wide · journey completes · 0 console errors |
| T9b | Mobile layout, Pixel 7 (412px) | Device emulation, full journey | PASS | 0px overflow · phone 380px wide · journey completes · 0 console errors |
| T10 | Literal Hubtype logo top-left; brand colours | Image load, position in header, computed styles | PASS | `assets/hubtype-logo.svg` loaded, first header item at the container's left edge; body #F8F8FA; hero #200066 |
| T11 | No console errors | Console and page-error listeners on every scenario (a-g) | PASS | 0 errors across autoplay, interactive, three branches, restart and static load |
| T12 | Sample-data line appears exactly once | Text count | PASS | 1 occurrence |
| T13 | "Not now" leaves the policy unchanged everywhere | Branch run; scan chat and card for "added" wording | PASS | Card says declined; no "added" wording anywhere |
| T14 | "Yes / not sure" at the first injury question escalates immediately | Branch run | PASS | Outcome `handoff-early`; no-injury script not continued |
| T15 | No injury mentioned means no handoff | "Thanks, that's all" branch | PASS | 0 handoffs; pill "Resolved by AI · no handoff" |
| T16 | Restart mid-journey replays cleanly | Restart during the journey, check for stale or duplicate messages | PASS | Opening message once, 0 duplicates |
| T17 | Footer credits Ayo Ahmed alone | Footer text | PASS | "Unofficial concept by Ayo Ahmed. Not affiliated with or endorsed by Hubtype or Aries." |
| T18 | Every evidence link opens and contains the quoted text | Open each source in the browser and search the rendered page for the quote | PASS | AWS Marketplace 2/2 quotes · Capterra UK 1/1 · Aries newsroom 3/3 · hubtype.com 1/1 |

Screenshots from the run are saved in `tests/screenshots/`.

## Issues found while testing, and fixes
- **First run, 21/24.** Three failures, all in the test suite rather than the page:
  - T2: the test's third tap used a locator that re-resolved to the *next* prompt's first button, so it answered "Confirm" by itself and the script stalled. I fixed it to hold the original element, which proves the used button is inert.
  - T10: the test required the logo at x < 80px, but the header is centred at 1440px wide. I changed it to check the logo is the first item at the header container's left edge.
  - T18: Capterra returns HTTP 403 to non-browser requests. I changed it to open each source in the browser and check the quoted text is present.
- **Visual check of screenshots:** the confidence bars in the workspace rendered at zero width (inline element). I fixed it in CSS and re-ran.
- **Final run: 24/24.**

## Known limits
- Desktop and mobile Chromium only; I didn't run Safari or Firefox.
- T18 depends on third-party pages staying online and unchanged.
- The journey is scripted. These tests check the demo's behaviour, not a live model.
