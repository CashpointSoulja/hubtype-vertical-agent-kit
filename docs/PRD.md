# PRD: Hubtype Vertical Agent Kit (unofficial concept)

Author: Ayo Ahmed. Status: concept demo. Audience: Aries group / Hubtype product leadership.

## Problem
Verified from public sources (see evidence section of the demo site):
1. G2 reviewers: Hubtype "excels at automating simple queries, more complex issues might still require human intervention."
2. Service speed complaints in reviews.
3. Enterprise-only go-to-market: no published pricing; Capterra describes a 6-8 week launch "backed by a highly skilled team."
Meanwhile Aries' stated roadmap for Hubtype (https://www.aries.global/newsroom/aries-acquires-hubtype-conversational-ai) is vertical-specific solutions, voice + multimodal, LatAm/NA expansion, and a revamped GTM engine.

## Solution
Two-part product concept:
1. **Vertical agent with cross-intent state and confidence-scored handoff.** One conversation thread holds multiple intents (claim + policy change + evidence capture). Entity state persists across intents. A confidence policy (injury, regulated topics, sentiment) triggers handoff; the agent workspace receives a structured context card: customer, policy, intents resolved, entities, actions taken, sentiment, escalation reason.
2. **Mid-market self-serve kit.** Four vertical templates (Insurance FNOL, Airline disruption, Retail recovery, Utilities outage), published tiers (£490 / £1,900 / custom), 48-hour launch promise.

## Scope of this artifact
- Working front-end demo: WhatsApp phone frame playing a scripted insurance FNOL journey end-to-end, live agent-workspace handoff, packaging page, evidence page.
- Scripted, deterministic demo data (no live LLM calls); the point is the product thinking and the journey design.
- Full PM documentation set (this repo) and a narrated walkthrough video.

## Non-goals
- Production integration with Hubtype's platform (no access).
- Real claims logic, real telephony/voice infrastructure.
- Any claim of affiliation with Hubtype or Aries.

## User stories (demo-covered)
- As a claimant, I report an accident in my own words and get a claim opened in under two minutes.
- As a claimant, I add a second request mid-thread without restarting.
- As a claimant, I send a voice note and see its content land as structured claim data.
- As a claimant, when I mention an injury, a specialist joins already knowing everything.
- As a claims handler, I receive one card with the full story and one button to accept.
- As a mid-market ops lead, I can see pricing and pick a template without talking to sales.

## Success criteria for the artifact itself
- Opens for anyone with the link, no sign-in.
- Plays the full journey with no interaction (autoplay) for the video, and step-by-step interactively for exploration.
- Looks like Hubtype built it: literal logo, brand colours, their typography feel.
