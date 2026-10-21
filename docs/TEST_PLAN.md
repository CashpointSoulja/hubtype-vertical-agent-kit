# Test plan and results

All tests run against the built demo (static site, no backend). Date: 21 Oct 2026.

| # | Test | Method | Result |
|---|------|--------|--------|
| 1 | Full journey plays start to finish in autoplay | Load ?autoplay=1, watch to completion | PASS |
| 2 | Interactive mode advances on quick-reply taps | Click each quick reply | PASS |
| 3 | Multi-intent state: claim ID consistent across messages | Inspect HT-48210 references | PASS |
| 4 | Voice note shows waveform, duration, and transcription chip | Visual check | PASS |
| 5 | Handoff triggers only on injury mention, not before | Step through script | PASS |
| 6 | Workspace idle until handoff; context card complete (customer, policy, intents, entities, reason) | Visual check | PASS |
| 7 | Accept button flips workspace to "in conversation" and resumes chat with agent persona | Click | PASS |
| 8 | No tool or model attribution anywhere in page, repo, or docs | grep | PASS |
| 9 | Mobile layout stacks cleanly (980px breakpoint) | Resize / device emulation | PASS |
| 10 | Logo literal and top-left; brand colours match scrape | Compare to hubtype.com | PASS |
| 11 | Site loads with no console errors | DevTools console | PASS |
| 12 | Sample-data disclaimer appears exactly once, no repeated "demo numbers" narration | Visual check | PASS |
