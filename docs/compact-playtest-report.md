# Compact embedded-surface playtest

This check uses Chromium 138, with a 390×844 browser viewport containing a smaller, clipped application surface. It exercises 320×520, 390×610 and 430×650 inner surfaces, and injects host rules that turn generic headings and buttons black after the game's styles load.

The first baseline run reproduced the reported defects: the game stayed 844px tall, menu navigation created an AudioContext, host styles made headings and toy names black, and toy screens had no opt-in music control. The attempted automatic scroll exposed negative toy-screen coordinates inside the clipped host. Evidence is `docs/testing/compact-baseline-results.json` and the corresponding baseline screenshots.

`tests/compact-browser.mjs` checks visible welcome controls, embedded app and toy geometry, readable scoped typography, eight complete showroom cards at 390×610, quiet/muted navigation, individual music controls that do not overlap the board, shared radio failure state, a genuine slider release and bubble duplicate protection. The showroom baseline comparison was strengthened after its first run to require navigation and cards to fit the host as well as each other.

The final compact integration ran on 2026-10-14 at 20:54 UTC: **62 of 62 checks passed**, with no uncaught browser errors. The machine report is `docs/testing/compact-browser-results.json`. The existing full browser suite also passed **44 of 44 checks**, including a real 45-second challenge, after the compact update.

| Check | Observed result |
| --- | --- |
| Embedded sizing | Welcome, navigation and eight toy screens fit their 320×520, 390×610 and 430×650 parent surfaces while the outer browser stays 844px high |
| Interactive bounds | All toy buttons, ranges, canvas boards and angular surfaces fit inside the visible clipping field at all three sizes |
| Host typography | Injected generic black heading/button styles do not make tested game text black |
| Showroom | All eight complete cards are visible above navigation at 390×610 |
| Quiet entry | Menu navigation creates no AudioContext and starts no media request at all three sizes |
| Muting | Muting through Settings, reloading and tapping a Pop bubble creates no AudioContext |
| Toy music | All eight toys offer a visible opt-in music button at each size without overlapping the primary board; an intercepted blocked stream exposes Retry and the same failure appears in Settings |
| Genuine input | A slider pointer release earns exactly one action; a double click on an already popped bubble cannot earn a second action |

Selected surface screenshots are `docs/testing/compact-showroom.png`, `docs/testing/compact-spinner.png`, `docs/testing/compact-marble.png`, and `docs/testing/compact-welcome.png`. The script also generates the full three-size set under `tests/compact-artifacts/`; `surface-*.png` files crop to the embedded game, while raw screenshots retain the outer host area beneath it. Showroom, Pop and Marble at 390×610 were visually inspected.

The stronger showroom check found a three-pixel last-row overlap with navigation. The gallery height was reduced and the final eight-card check passed.

The first muted exploratory check seeded storage directly, which the application's correct page-hide persistence replaced with its current settings. The corrected check uses the real Settings control and passed. This was a test setup issue.

Physical playback coexistence with Spotify, actual phone haptics and physical frame rate cannot be established by this browser emulator. No live third-party stream success is claimed; radio testing deliberately intercepted the media request as offline.
