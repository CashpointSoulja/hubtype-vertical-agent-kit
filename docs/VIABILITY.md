# Viability memo: why this maps to the forward-deployed product seat

## The seat
From my conversations with Aries' talent team and one of its forward-deployed engineers (Oct 2026): Aries isn't advertising product roles. The way in is to pick a portfolio company and show the product changes I'd make. They're looking for forward-deployed product, growth and applied-AI people across group companies.

## Why Hubtype
- **It's the closest match to work I've shipped.** I founded a cleaning startup and ran its customer operations on WhatsApp: quotes, bookings, reschedules, complaints. Same channel, same failure modes, at the small-business end Hubtype can't serve today.
- **The roadmap is a product and go-to-market job.** Aries' stated Hubtype plan ([announcement](https://www.aries.global/newsroom/aries-acquires-hubtype-conversational-ai)) covers vertical-specific solutions, voice and multimodal, LatAm and North America, and a revamped go-to-market engine. This concept is that roadmap compressed into one vertical.
- **The pain is public at both ends.** On product, G2 reviews on [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-77s4gnfi467io) describe complex issues still needing humans, and slow service. On distribution, [Capterra](https://www.capterra.co.uk/software/165133/hubtype) describes a 6-8 week team-led launch for enterprise buyers, and I found no published pricing.

## Why this artifact
- It shows the three things the seat needs in one object: product judgment (which journey, and where the automation boundary sits), technical fluency (voice note to structured data, confidence- and policy-scored routing, a state machine that doesn't race) and go-to-market thinking (packaging and prices that open a new segment).
- Every claim in it is either sourced and linked, labelled as sample data, or labelled as my hypothesis.

## What I'd do in my first 30 days
1. Shadow live Hubtype deployments to find the top three broken journeys per vertical, and replace my script with their transcripts.
2. Ship one vertical template with one mid-market insurer or MGA as design partner; measure resolved-in-one-thread rate and handoff precision.
3. Price the self-serve tiers against Intercom and Zendesk messaging suites, and validate willingness to pay with ten mid-market ops leads.

## Risks I'd watch
- **Cannibalisation:** self-serve tiers undercutting enterprise deals. Mitigation: cap Starter and Growth by conversations and channels, and keep custom journeys and dedicated support in Enterprise.
- **Compliance:** insurance handoff rules vary by market. The policy layer has to be configurable per client and auditable.
- **Template fit:** if real transcripts don't match the template, a 48-hour launch becomes a 48-hour false start. That's why step 1 comes first.
