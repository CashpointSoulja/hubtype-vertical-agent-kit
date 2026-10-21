# What changed from the first version

The first version of this demo had the right shape. This version fixes what was broken, fills the gaps and backs every claim.

## Demo engine
- **Rebuilt the script runner** (`assets/demo.js`) as an awaited, cancellable sequence. Before, autoplay could click leftover quick-reply buttons again, which duplicated messages and log rows. Now each set of quick replies resolves once, is disabled on first tap and is removed before the next step. Restart cancels every pending timer.
- **Fixed the typing race.** A message can't appear while the typing indicator is showing. Each bot message waits for its typing animation, then for a reading pause sized to its length.
- **Fixed branches.** "Not now" leaves the policy unchanged: the chat, intent chips, action log and context card all say it was declined. "Yes / not sure" on the first injury question escalates straight to a specialist. "Thanks, that's all" finishes the claim with no handoff.
- **Handoff only on injury.** It fires on a policy rule (injury goes to a licensed handler) with confidence shown at 0.61 against a 0.75 threshold. It doesn't fire on any other turn or branch.
- **Accept is real.** In interactive mode Marta only joins when you press Accept; autoplay presses it for you.

## Workspace and context card
- **Live turn signals:** each turn shows intent, confidence bar and routing decision against the threshold.
- **Context card** now has explicit Customer, Policy, Intents, Entities captured, Actions taken by AI, Sentiment (its own field, with a trajectory) and Escalation reason.
- One claim ID (HT-48210) is used across the chat, card and timeline.

## Pitch, packaging and evidence
- Three pitch cards: where Hubtype's issues are (sourced), how I've solved this before, how I'd solve it for Hubtype.
- Evidence cards link to their sources: G2 reviews on AWS Marketplace (complex issues, slowness), Capterra UK (6-8 week team-led launch), Aries newsroom (roadmap), hubtype.com (Austral's 85% case study).
- Removed the unsourced "80-85%" stat and replaced it with Hubtype's own quoted, linked Austral case study.
- Removed the "Most likely to convert" badge (no evidence for it). Pricing is labelled as my hypothesis, not Hubtype pricing.
- Added an evidence map table from each design decision to its sourced pain and the Aries roadmap item.
- One sample-data line; no repeated disclaimers.

## Design
- Moved styles into `assets/styles.css`; loaded Inter (verified as Hubtype's typeface); kept the literal Hubtype logo, #200066 and #F8F8FA.
- Responsive layout checked at 390px and 412px with no horizontal scroll.
- Autoplay scrolls the demo into frame for recording.

## Repo and docs
- Added a root README.
- Added an automated end-to-end suite (`tests/e2e.mjs`, Playwright) and recorded its actual results in `TEST_PLAN.md`, replacing the earlier unverified PASS marks.
- Rewrote the PRD, ELI5, 5 Whys, JTBD, metrics, viability memo, roadmap v2, design scrape and explain-it card in first person, with sources linked and sample data labelled.
