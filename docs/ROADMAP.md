# Roadmap v2

How I'd take this from concept to product, in order. Each step has an exit criterion so it's clear when to move on.

## v2.0 · Real transcripts, real boundary (weeks 1-4)
- Pull 200 real insurance threads from a design partner (with consent) and tag where they break: stacked intents, lost entities, late or missing handoff.
- Re-script the FNOL template against what customers actually say.
- **Exit:** top three breakpoints ranked by volume, and the template covers them.

## v2.1 · Live agent loop (weeks 4-8)
- Replace the script with a model-driven loop using tool calls (policy lookup, claim creation, cover quote) on Hubtype's platform, same UI.
- Confidence from calibrated model uncertainty plus a deterministic policy layer (injury, regulated phrases, vulnerability, sentiment).
- **Exit:** handoff recall on injury mentions is 100% on the test set; handoff precision tracked weekly.

## v2.2 · Voice in, voice out (weeks 6-10)
- Real voice-note transcription with entity extraction (plates, addresses, dates) and a confidence chip the human can see.
- Optional voice replies for accessibility. Spanish and Portuguese first, for LatAm.
- **Exit:** extraction accuracy on plates and addresses measured on real notes.

## v2.3 · Second vertical (weeks 8-12)
- Airline disruption (rebook, refund or voucher, bag tracing) on the same state-and-handoff core, to prove the layer generalises.
- **Exit:** second template built in under two weeks, reusing at least 70% of the core.

## v2.4 · Workspace depth (weeks 10-14)
- Accept and reject with SLA timers, supervisor view of handoff precision, AI as copilot after the human takes over.
- **Exit:** human time-to-first-reply after handoff measured and improving.

## v2.5 · Packaging validation (weeks 12-16)
- Test the three tiers with ten mid-market ops leads; landing-page test on price points; card checkout for Starter.
- Measure signup-to-live time against the 48-hour promise.
- **Exit:** a price point with real willingness-to-pay evidence, and five self-serve accounts live.
