# Browser playtest report

QA uses headless Chromium 138 with Playwright on the local Vite application. Viewport emulation is a layout and interaction check; it does not establish physical Android performance, audible output, or hardware vibration.

## Before the upgrade

The automated baseline actually ran on 2026-10-14. Starting the arcade passed. Three acceptance checks failed:

- Only six toys were offered; Marble Drop and Magnet were absent.
- Ending an empty challenge immediately added one XP.
- The result did not offer a direct return to free play.

Evidence: `docs/testing/baseline-results.json`. The baseline showroom screenshot is generated locally under `tests/artifacts/`.

## Reproduction

With Vite available at `http://127.0.0.1:5173`, run `node tests/browser.mjs`. If Playwright's browser is not installed, set `CHROMIUM_PATH` to an available Chromium executable. `TEST_URL` overrides the URL. Baseline mode is `--baseline`.

## Upgraded application

The final stable integration ran on 2026-10-14 at 12:41 UTC: **44 of 44 checks passed**, with no uncaught browser errors. Machine-readable evidence is `docs/testing/browser-results.json`.

| Coverage | Actual result |
| --- | --- |
| Welcome and showroom | Direct Play tap opens all eight toys |
| Responsive shell | PLAY, SHOP, AWARDS and SETTINGS have no horizontal overflow at 320×700, 390×844, 430×932, 844×390 and 1280×800 |
| Toy fit | All eight toy controls fit inside the clipping field at 320×700 and 844×390 |
| Meaningful free play | All eight toys earn actions and XP; Pop, switch and piano use taps, sliders use a pointer drag, spinner/dial use circular pointer gestures, marble uses a real simulated landing, magnet uses a held pointer sweep |
| Audio | A touch creates one reusable Web Audio context and oscillators; this verifies browser synthesis, not audible device quality |
| Immediate tactile feedback | An unmatched challenge switch sounds without earning actions; releasing a marble sounds before its landing, and the drop alone earns no action |
| Challenges | A real 45-second Pop round scores ten glowing target hits, stores a best of 120 or more, grants Gems and returns directly to free play |
| Early end/results | Empty early end grants no Gems or XP; keyboard input behind a piano result does not earn actions |
| Durable progress | Actions survive reload; a synthetic hidden visibility transition flushes the latest action immediately; purchases commit before the debounce delay |
| Shop | Preview spends nothing; an 80-Gem station purchase deducts once, equips, updates the global radio controller and survives reload |
| Awards | First Touch pays 20 Gems once and remains disabled after reload |
| Radio | Settings do not autoplay; locked stations do not equip; an intercepted offline stream shows unavailable instead of falsely claiming playback |
| Reduced motion | Setting survives reload and prevents decorative toy particles |

Issues found and corrected during integration included clipped canvas cups and a clipped landscape Pop flip button, delayed marble landings, a radio failure being overwritten by an asynchronous pause event, result-screen piano keyboard farming, delayed purchase saves, and a missing visibility save flush. Earlier exploratory runs during source hot reload are not the final acceptance result.

Selected durable screenshots are `docs/testing/showroom.png`, `docs/testing/spinner.png`, `docs/testing/marble-320.png`, and `docs/testing/pop-landscape.png`. The browser script also generates welcome, shop, all eight toy, narrow/landscape, challenge, award, preview, and radio screenshots locally under `tests/artifacts/`. Welcome 320, shop 390, Marble 320 and landscape, and the spinner screen were visually inspected.

Physical Android frame rate, audible sound quality, vibration, and live third-party stream playback were not measured. A genuine stream success is not claimed. Browser radio failure testing deliberately intercepted the media request as offline.
