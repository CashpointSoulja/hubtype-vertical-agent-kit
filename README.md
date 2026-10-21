# Hubtype Vertical Agent Kit (unofficial concept)

A product concept for Hubtype, inside the Aries group: a vertical WhatsApp agent that holds a complex, multi-intent insurance journey in one thread and hands over to a human with full context when it should, packaged as self-serve templates for the mid-market.

**Live demo:** https://hubtype-vertical-agent-kit.pages.dev/
**Autoplay (for recording):** https://hubtype-vertical-agent-kit.pages.dev/?autoplay=1

## What's in the demo
- **Pitch:** three cards. Where Hubtype's issues are (sourced), how I've solved this before, how I'd solve it for Hubtype.
- **Working journey:** a WhatsApp phone frame runs an insurance first-notice-of-loss (FNOL) conversation. The customer reports an accident, adds breakdown cover mid-claim, sends a voice note with the other driver's plate (with a transcription chip), then mentions neck pain. Only the injury triggers a confidence- and policy-scored handoff into an agent workspace with a full context card: customer, policy, intents, entities, actions taken, sentiment and escalation reason. Accepting it lets a human claims specialist carry on in the same thread.
- **Branches:** "Not now" on the cover, "Yes / not sure" on the injury check and "Thanks, that's all" (no handoff) each play out differently.
- **Mid-market kit:** four vertical templates, three proposed price tiers, the 48-hour launch path, and an evidence section that links every design decision to a public source.

## Run it locally
It's a static site with no build step:

```bash
python3 -m http.server 8080
# open http://localhost:8080  (interactive)
# open http://localhost:8080/?autoplay=1  (hands-free)
```

`?speed=N` (0.25-20) speeds up the script timings. The test suite uses it.

## Tests
```bash
cd tests && npm install && npx playwright install chromium
BASE_URL=http://localhost:8080 npm test
```
Results from the latest run are in [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md).

## Deploy
```bash
npx wrangler pages deploy dist --project-name hubtype-vertical-agent-kit --branch main
```
where `dist/` holds `index.html` and `assets/`.

## Docs
- [`PRD.md`](docs/PRD.md): problem, solution, scope, stories
- [`ELI5.md`](docs/ELI5.md): the plain-English version
- [`FIVE_WHYS.md`](docs/FIVE_WHYS.md): root cause
- [`JTBD.md`](docs/JTBD.md): jobs to be done
- [`METRICS.md`](docs/METRICS.md): north star and guardrails
- [`TEST_PLAN.md`](docs/TEST_PLAN.md): tests and actual results
- [`VIABILITY.md`](docs/VIABILITY.md): why this maps to the seat
- [`ROADMAP.md`](docs/ROADMAP.md): roadmap v2
- [`DESIGN_SCRAPE.md`](docs/DESIGN_SCRAPE.md): brand scrape and visual guide
- [`EXPLAIN_IT.md`](docs/EXPLAIN_IT.md): the 3-line version
- [`CHANGES.md`](docs/CHANGES.md): what changed from the first version

## Sources
- G2 reviews on Hubtype's AWS Marketplace listing: https://aws.amazon.com/marketplace/pp/prodview-77s4gnfi467io
- Capterra UK listing: https://www.capterra.co.uk/software/165133/hubtype
- Aries acquisition announcement: https://www.aries.global/newsroom/aries-acquires-hubtype-conversational-ai
- hubtype.com (Austral case study, logo, brand colours, Inter typeface): https://www.hubtype.com/

All customer, policy and staff data in the demo is sample data. Prices are my hypothesis, not Hubtype pricing.

Unofficial concept by Ayo Ahmed. Not affiliated with or endorsed by Hubtype or Aries.
