# Hubtype design scrape (21 Oct 2026, hubtype.com live site)

Source: hubtype.com homepage and platform page, fetched 21 Oct 2026.

## Brand assets
- Logo (literal, black on light): `assets/hubtype-logo.svg` pulled from their CDN (cdn.prod.website-files.com/.../67d1e549fd69d8792eb8424a_hubtype-logo-black.svg). White variant made by CSS filter `brightness(0) invert(1)` on dark surfaces.
- Primary purple: #200066 (dominant brand colour, used 26 times in homepage CSS).
- Page background: #F8F8FA.
- Accent green: #27D045 (used sparingly; WhatsApp adjacency).
- Typography: clean geometric sans (Inter / Segoe UI stack as stand-in).

## Product surface observed
- Homepage hero: "AI Agents for WhatsApp & Business Messaging" - design, launch, manage AI agents, enterprise-grade security.
- Platform pillars shown: visual journey editor, agent workspace ("manage every interaction"), analytics ("spot where customers get stuck").
- Proof: 80-85% automated interactions (Austral, unnamed contact centre), 107% Trustpilot lift; logos: Securitas Direct, Allianz, Decathlon, Mango, Levi's, Michael Kors, Volkswagen, Zurich, Wizz Air, easyJet, Air Europa, JetSmart, TMB.
- Security posture: ISO 27001, end-to-end encryption, SSL webhooks.
- Claims: "80% bot compliance", "2X CSAT", integrations with Contentful, Salesforce, Zendesk.

## Visual guide (applied in the demo)
- Logo owns top-left, literal mark.
- Purple #200066 for headers, workspace chrome, key CTAs.
- Light #F8F8FA page background, white cards, 14-18px radius, soft purple-tinted shadows.
- WhatsApp phone frame kept true to WhatsApp UI (#075e54 header, #d9fdd3 outgoing, #e5ddd2 chat bg) because the demo's subject is the WhatsApp experience itself.
- Workspace panel mirrors Hubtype's "clean, visual, easy-to-use workspace" claim: handoff context card, intent chips, confidence pill, one primary action.
