# Social, music and progression playtest

The browser checks use Chromium 138 with a 390×610 game surface inside a 390×844 outer viewport. Chat tests replace WebSocket completely and feed the installed Aippy SDK a local native-bridge profile fixture. Every chat frame remains inside the browser fixture; no test sends messages or moderation actions to the real shared server.

The baseline run recorded the missing shared music/chat header on all five screens, missing ninth chatroom card, obsolete showroom heading, and 54 displayed award cards instead of five. The 54-item catalogue and fresh 3% radio preference already passed. Evidence: `tests/social-artifacts/baseline-results.json`.

The final focused test ran on 2026-10-14 at 22:10 UTC: **26 of 26 checks passed**, with no uncaught browser errors. Machine evidence: `docs/testing/social-results.json` (generated source: `tests/social-artifacts/social-results.json`).

| Coverage | Actual result |
| --- | --- |
| Header and showroom | Shared music and chat on all five pages; all eight toys remain, plus the ninth chatroom card; obsolete showroom heading removed; nine cards fit above navigation |
| Pop | All 25 genuine taps clear the board, display the banner, record the milestone and automatically reveal a fresh board after the 750ms transition |
| Piano | Phrase preview leaves actions, XP, Gems and phrase unchanged; playing the complete Ode to Joy excerpt advances to the next song and records completed/perfect-song milestones |
| Awards | Catalogue contains 54 unique achievements; five unclaimed slots rotate after a claim; first earned award raises the red navigation badge and claiming removes its queued alert |
| Daily goal | A completed daily widget disappears from the showroom |
| Radio | Fresh save uses 3%; an existing 17% preference survives reload |
| Shared chat | Installed SDK bridge returns the local profile fixture; mock server echoes messages with its username; overlay and room share the same conversation; unread square appears and clears on opening |
| Profiles and roles | Regular player sees a read-only server profile; mock owner permissions expose five controls; each sends the exact supported mute/unmute/kick/ban/unban frame only into the mock transport; demotion removes controls |
| Admission order | Mock owner permissions arriving before the validated snapshot remain available after admission |
| Keyboard | At a simulated 300px visual viewport, both overlay and room keep the composer visible and log scrolled to the latest message; typing into chat does not play piano |
| Continuing gameplay | A marble dropped before opening chat still records its landing action and mastery |
| Missing identity | Without an SDK identity, composer and Send remain disabled and no shared-chat socket is attempted |

The compact suite passed **62/62**, including 320×520, 390×610 and 430×650 embedded geometry, before the final offline-history-only chat patch. The existing full suite passed **44/44**, including the real 45-second round. The focused 26-check social suite then passed after that final patch. Four additional Pop/Piano challenge geometry probes passed at 320×520 and 844×390; their evidence is `docs/testing/challenge-layout-results.json`.

Screenshots under `tests/social-artifacts/` include cropped `surface-showroom-header.png`, `surface-chat-overlay.png`, `surface-chat-keyboard.png`, `surface-owner-controls-mocked.png`, `surface-pop-clear.png`, and `surface-piano-song-complete.png`. Showroom, translucent overlay, keyboard geometry and mocked owner controls were visually inspected. Chat screenshots contain explicitly named QA fixtures, not real conversations.

Exploratory failures caused by the SDK's native-app version guard, a numeric unread-badge assumption and source hot reload were corrected in the harness; final checks use the actual square badge and stable source. No production identity was invented.

Real server connectivity and physical phone keyboard/audio behavior are not established by a mocked browser test. No test message or moderation action reached the real shared server.
