# PRD: Hubtype Vertical Agent Kit (unofficial concept)

Author: Ayo Ahmed. Status: concept demo. Audience: Aries group and Hubtype product leadership.

## Problem
I verified these from public sources (each is linked on the demo site's evidence section):
1. **Complex journeys fall over.** A G2 review on Hubtype's AWS Marketplace listing (Dec 2024): "While it excels at automating simple queries, more complex issues might still require human intervention, limiting its full potential for comprehensive customer support."
2. **Speed.** A G2 review on the same listing (Sep 2024): "Sometimes the services provided are a little slow and that is the main concern."
3. **Enterprise-only go-to-market.** Capterra UK: "You can launch your conversational strategy in just 6-8 weeks, backed by a highly skilled team", with enterprise businesses as the stated buyer. I found no published price on hubtype.com.

Aries' stated plan for Hubtype ([announcement](https://www.aries.global/newsroom/aries-acquires-hubtype-conversational-ai)): vertical-specific solutions; voice and multimodal integrations; markets across Latin America and North America; a revamped go-to-market engine; strategic verticals including insurance, retail, travel and the public sector.

## Solution
I'm proposing a two-part product:
1. **Vertical agent with cross-intent state and confidence-scored handoff.** One thread holds several intents (claim, policy change, evidence capture). Entities persist across intents. Every turn gets a confidence score; a policy layer adds mandatory-human rules (injury, regulated topics). When either fires, the agent workspace gets a structured context card with customer, policy, intents, entities, actions taken, sentiment and escalation reason. A human accepts and continues in the same thread.
2. **Mid-market self-serve kit.** Four vertical templates (Insurance FNOL, Airline disruption, Retail recovery, Utilities outage), published tiers (Starter £490/mo, Growth £1,900/mo, Enterprise custom) and a 48-hour launch path.

## Why these choices
- **Insurance FNOL as the demo journey.** Insurance is an Aries-named vertical. FNOL naturally stacks intents and has a hard, explainable automation boundary (injury), so it shows both containment and handoff.
- **Handoff on a policy rule, not just low confidence.** Injury claims need a licensed human regardless of how confident the model is. I show both signals so a buyer sees why it escalated.
- **Context card over transcript.** The human shouldn't have to read 20 messages. The card is what speeds up the human side, which answers the "slow" complaint.
- **Prices in the open.** Mid-market buyers want a number before a call. The tiers are my hypothesis and the page says so.

## Scope of this artifact
- Static front-end demo: WhatsApp phone frame, scripted FNOL journey with four branch points, live agent-workspace handoff, packaging and evidence sections.
- Deterministic sample data, no live model calls. The point is the product thinking and journey design.
- Autoplay mode (`?autoplay=1`) for recording; interactive mode with tappable quick replies; mobile-responsive.
- PM documentation (this folder) and an automated end-to-end test suite (`tests/`).

## Non-goals
- Integration with Hubtype's platform (I don't have access).
- Real claims logic, telephony or transcription.
- Any claim of affiliation with Hubtype or Aries, or any performance number presented as a real result.

## User stories covered by the demo
- As a claimant, I report an accident in my own words and get a claim opened in a couple of minutes.
- As a claimant, I add a second request mid-thread without restarting, and "not now" really means nothing changed.
- As a claimant, I send a voice note and see its content land as structured claim data.
- As a claimant, if I say I might be hurt, at the start or later, a specialist joins already knowing everything.
- As a claimant with no injury, the AI finishes the job and nobody is pulled in.
- As a claims handler, I get one card with the full story and one button to accept.
- As a mid-market ops lead, I can see prices and pick a template without talking to sales.

## Success criteria for the artifact
- Opens for anyone with the link, no sign-in.
- Plays the full journey hands-free and step by step, with no double-fires, races or console errors.
- Handoff fires only on the injury intent.
- Looks like Hubtype made it: literal logo, #200066, #F8F8FA, Inter.
- Every claim is either sourced or labelled as sample data or hypothesis.
