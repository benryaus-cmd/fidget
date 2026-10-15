# Pip sizing and live leaderboard integration

## Changes

Pip is 2.25 times larger on the welcome screen and showroom. The game companion grows from 49 to 114 CSS pixels, overlaps the lower-left UI visually, and hops, leans, squashes and dances between gameplay reactions. Its entire game overlay remains pointer-transparent, so it cannot steal a board gesture or the challenge button. Wardrobe and result previews are larger too. Platform bounds account for the enlarged canvas; reduced motion suppresses travel and dancing.

Mint Mochi is now free and the default. Untouched legacy Vanilla defaults migrate to mint; paid colour selections and explicit future colour choices survive. The body is exactly 30% taller, with its width retained. Eyes/mouth sit in the upper part of the body and paws attach low down. Existing names, care, owned cosmetics, wallet, XP and saves are retained.

LEADERS uses the custom DigitalOcean API, independently of Aippy's leaderboard service. The existing Aippy profile hook provides identity independently of chat. Overall accepted totals and each toy's best round have All Time/Daily boards, UTC dates, pagination and a current-player rank. Challenges capture actual positive scoring events and their elapsed timestamps. Server-issued sessions, durable original-payload retries, local-only fallback and acceptance-only RANKED status are preserved. Server acceptance never awards Gems or XP again.

## Problems found and fixed

- A Vite 6 production transform broke `@aippy/runtime@0.4.1`'s dynamic-import namespace unwrap. Development builds could acquire native profiles while the production build silently returned an empty profile. The narrow `build/aippy-user-compat.ts` pre-transform retains the SDK's namespace unwrap and native/iframe logic. Production profile and leaderboard browser tests pass after the fix. Merge this helper into the existing Aippy host plugins; do not replace the host build config. See [import requirements](../AIPPY-IMPORT.md).
- Real Magnet Field input collected two crystals only 33 ms apart. The server correctly rejected that trace under its rate rule. Actual collection now pulses at least 120 ms apart, retaining every crystal and its real score/timestamp rather than changing the submitted trace.
- Public requests measured around 5–6 seconds through the workspace proxy, exceeding the earlier 4.5-second client timeout. Requests now allow 12 seconds and retain the existing playable fallback and retry states.
- Pet reaction effects now follow both the reaction counter and selected emote, keeping spontaneous idle dancing from masking a new gameplay reaction.

## Verified checks

- Production TypeScript/Vite build: 431.72 kB JavaScript (141.75 kB gzip), 92.45 kB CSS (21.03 kB gzip).
- Full unit command: 69 named tests plus sound/radio scripts passed.
- Production leaderboard contract suite: 13/13 passed, including out-of-top-25 current-player rank, pagination controls, historical dates, eight toy filters, delayed-start cancellation, reload retry and 320/390/430-pixel bounds. Its transport is explicitly mocked.
- Pet: 20/20; expanded companion: 12/12, including actual dancing, pixel checks, all costume renders, real board-clear emotes, purchases and persistence.
- Compact layouts: 62/62 at 320×520, 390×610 and 430×650 embedded sizes.
- Main gameplay: 44/44 on the development server, including genuine input for all eight toys, a 45-second challenge, saves, awards, purchases and shared audio behavior.
- Production smoke: actual touch pop, atomic purchase, reload persistence and one React root passed.

## Live API verification

The final production live suite passed 15/15 checks, with zero uncaught browser errors. A complete real 45-second Pop challenge was accepted. Each of the eight toys then produced an accepted score from genuine target taps, switch matching, piano melody input, angular drags, fader drag/release, marble landing or magnet sweeps. The corrected magnet trace was accepted.

Real Daily and All Time queries returned the QA player's positive score/rank on all 18 boards (Overall plus eight toys). Live API pagination used limit 1/offset 1 against actual players and retained the current-player rank outside that page. The production LEADERS screen displayed the real player, piano daily board and server UTC day. The fixed page-size-25 UI pagination and out-of-top-25 rank were separately exercised by the explicit contract fixture.

A duplicate POST returned idempotent=true and retained the same overall total. An injected submission outage preserved the original issued credentials/payload through reload; retry reached the real API and did not pay local rewards again. An injected start outage kept the game playable as LOCAL ONLY. Outage routes abort the connection; they do not fabricate server acceptance or rankings.

[Final live evidence, including scoring traces](testing/leaders-live-production-results.json) · [Production contract checks](testing/leaders-production-browser-results.json) · [Pip motion and purchases](testing/pip-large-browser-results.json) · [Main gameplay](testing/pip-gameplay-results.json) · [Compact layouts](testing/pip-compact-results.json). Round secrets are excluded from the evidence.

## Test boundaries

Live tests use the real HTTPS API and actual browser gameplay, with a clearly labelled `uff-frontend-integration-qa` profile injected through a native-bridge fixture. This is not proof of actual Aippy account admission. Tests reuse one QA identity; its accepted QA scores remain on the server and can be removed administratively by the owner.

This workspace routes public HTTPS through its proxy. Chromium does not trust that proxy's CA, so the live browser harness uses a test-only certificate exception; game code does not disable HTTPS checks. curl verified HTTPS through the workspace's trusted CA. One exploratory browser metadata fetch failed transiently; it was rerun against the same service without substituting mock data.

The first live pass exposed the magnet rate mismatch. A subsequent production pass exposed an over-fast keyboard automation sequence that ended a slider round with zero score; the final harness uses an actual drag and release. A costume pixel test initially counted the newly mint body as ear colour; its ear-isolation render now uses Vanilla. Animation bounds are measured separately from the untransformed CSS size. Source-importing test cases run on the development server; production is covered separately.

Actual Aippy host loading, physical Android gestures/performance, native haptics and mixing with Spotify remain device checks. The user is holding the combined build/import prompt. No host import or deployment is claimed here.

Run `UFF_LIVE_TEST=1 CHROMIUM_PATH=/path/to/chromium TEST_URL=http://127.0.0.1:PORT node tests/leaders-live-browser.mjs` against a running production preview to repeat the opt-in live suite. It posts labelled QA scores; it is deliberately excluded from the default unit command.
