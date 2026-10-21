# Metrics I'd use to run this product

## North star
**Resolved-in-one-thread rate:** % of multi-intent conversations completed, by the agent alone or agent plus human, without the customer repeating information.

## Inputs and guardrails
- **Containment quality, not just containment rate:** % of AI-completed conversations that the AI *should* have completed, from a weekly audited sample.
- **Handoff precision:** % of handoffs triggered at the right moment. Too early wastes human time; too late is a compliance risk on injury and regulated intents.
- **Handoff recall on mandatory-human topics:** % of injury or regulated mentions that triggered a handoff. Target 100%; anything less is an incident.
- **Context-carry score:** QA check that every entity captured before handoff appears on the human's context card.
- **Human time-to-first-reply after handoff:** the speed metric that answers the "service is slow" review.
- **Time-to-launch:** days from signup to live agent. Target 2, against the 6-8 weeks Capterra describes today.
- **Template attach rate:** % of new mid-market accounts launched from a vertical template rather than a custom build.
- **Expansion:** conversations per account over time; Starter to Growth upgrade rate.

## What the demo shows
The demo is scripted with sample data. Its confidence scores (0.90-0.97 for routine turns, 0.61 on the injury turn) and timings are illustrative, not measured. Nothing in the artifact is presented as a real performance result; the only real numbers are quoted from cited Hubtype, G2, Capterra and Aries pages.
