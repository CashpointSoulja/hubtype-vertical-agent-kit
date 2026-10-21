# Hubtype design scrape

Source: hubtype.com homepage and its Webflow stylesheet, fetched 21 Oct 2026.

## Brand assets (verified)
- **Logo:** `assets/hubtype-logo.svg` is a byte-identical copy of the logo on Hubtype's CDN (`cdn.prod.website-files.com/67d188e7beaa8de43bd46fc0/67d1e549fd69d8792eb8424a_hubtype-logo-black.svg`; MD5 matched). On dark surfaces I invert it with CSS `filter: brightness(0) invert(1)`.
- **Primary purple:** #200066.
- **Page background:** #F8F8FA.
- **Typeface:** Inter. Hubtype's stylesheet sets both `--_typography---heading` and `--_typography---body` to `Inter, Arial, sans-serif`. The demo loads Inter from Google Fonts with the same fallback.
- **Accent green:** #27D045, used sparingly.

## Product surface observed on hubtype.com
- Positioning: AI agents for WhatsApp and business messaging; design, launch and manage AI agents with enterprise-grade security.
- Platform pillars: visual journey editor, agent workspace, analytics.
- Proof points on the page: Austral case study ("we've automated 85% of our WhatsApp interactions"), "80% bot compliance" from industry-specific interactive elements.
- Customer logos include Allianz, Decathlon and Volkswagen, among others.
- No public pricing page found.

## Visual guide applied in the demo
- Literal logo owns the top-left of the header.
- #200066 for hero, workspace chrome, headings and primary buttons; #F8F8FA page background; white cards with 14-18px radius and soft purple-tinted shadows.
- The phone frame stays true to WhatsApp (#075e54 header, #d9fdd3 outgoing bubbles, beige chat background) because the subject is the WhatsApp experience itself. The customer's own messages are on the right in green, the business on the left, as on Sofia's phone.
- The workspace panel follows Hubtype's "agent workspace" pillar: live turn signals with a visible 0.75 threshold, then one context card with a single primary action.
