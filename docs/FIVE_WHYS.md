# 5 Whys: why do complex conversations still fall over to humans?

Starting point (G2 review on AWS Marketplace): "more complex issues might still require human intervention."

1. **Why do complex issues fall over to humans?** My hypothesis: the bot handles one intent at a time and loses the thread when a customer stacks requests (claim, then policy change, then a voice note).
2. **Why does it lose the thread?** Journeys tend to be built as single-purpose flows, so state captured in flow A isn't available to flow B.
3. **Why doesn't state carry?** Each client's journeys are built during a team-led launch (Capterra: 6-8 weeks, "backed by a highly skilled team"), so there's no shared, reusable journey layer per vertical.
4. **Why is there no shared layer?** The business sells enterprise projects rather than productised verticals, so each client is a new build.
5. **Why projects, not products?** The go-to-market targets enterprise buyers only. With no self-serve packaging or published pricing, the mid-market never became a segment worth building reusable product for.

**Root cause I'm designing for:** a services-led go-to-market produced bespoke flows instead of a productised vertical layer.

**What I'd do:** fix both ends at once. A vertical template with cross-intent state and confidence-scored handoff, sold self-serve at published prices. Steps 1-2 are hypotheses from the outside; the first thing I'd do in the seat is check them against real Hubtype transcripts.
