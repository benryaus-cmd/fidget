# ULTIMATE FIDGET FINGERS

Portrait-first tactile arcade, built with React and Vite for Aippy and standalone browsers. One React root: `src/main.tsx` → `src/App.tsx`.

Eight rebuilt toys: Pop Frenzy, Spin Lab, Switch Circuit, Piano Rush, Slider Sync, Detent Dial, Marble Drop and Magnet Field. Unlimited free play, toy-specific 45-second challenges, local mastery/XP/Gems, awards, daily objectives, materials, trails and studio backgrounds.

## Run and verify

```sh
npm ci
npm run dev
npm run build
npm test
```

Build includes TypeScript verification. Unit scripts use Node 24 in the verified environment. For browser tests, install the test tool with `npm install --no-save playwright` and `npx playwright install chromium`. Browser tests require Playwright and its Chromium installation; run a Vite server on port 5173 and `TEST_URL=http://127.0.0.1:5173 npm run test:browser`. Optional `CHROMIUM_PATH` selects an installed browser. Playwright is a test tool, not shipped in the game.

## Modules

- `src/gameplay`: curated tactile toys, physics, capped effects and responsive toy layouts.
- `src/economy.ts`: validated v2 save, v1 migration, transactions and bounded rewards.
- `src/audio`: shared sound context, Aippy/native haptics and optional radio lifecycle.
- `src/App.tsx`, `src/style.css`: arcade, challenges, collection, shop, awards and settings.

Read `docs/development-report.md` for actual validation and remaining gaps, `docs/toy-review.md` for the review of all 26 original components, and `final-goal.md` for the full quality target. See `AIPPY-IMPORT.md` for the gameplay-only update that preserves the Aippy host scaffold.

Progress saves on this browser/device. Shared HubSide chat uses the existing Aippy profile and server protocol. No real-money payments are implemented. SomaFM radio embedding is a development integration with a documented public-release rights limitation in `ASSET-CREDITS.md`.

## Compact Aippy update

The game now sizes to its containing surface, with smaller navigation, eight visible showroom cards at 390×610, larger toys, explicit scoped text contrast and global header radio controls. See `docs/compact-playtest-report.md` for 62 compact checks plus the 44-check main suite, and `docs/audio-focus-investigation.md` for the precise external-music behavior and host limitations.

## Chat, melodies and rotating awards

The shared header now contains music and chat controls on every page. The ninth showroom tile opens the full chatroom; the header opens a compact translucent overlay. The redundant showroom heading is removed and toy captions sit above their artwork.

Pop boards celebrate and automatically flip. Piano challenges play public-domain melodies in four-note phrases, with a Listen preview. A catalogue of 54 claimable awards rotates through five unclaimed slots, with completion popups and a claim badge. New radio preferences start at 3%; saved choices are retained.

Run `npm run test:social` against a running Vite server for the SDK-profile and mocked-chat browser suite. Read `docs/social-development-report.md`, `docs/social-playtest-report.md` and `docs/chat-integration.md` for evidence and server/device limitations.

## Milo pocket pet

A small procedural pet hops around the welcome screen and between showroom cards. Tap him for a happy reaction; use the header paw button to feed, rename and customise him. Four palettes, four ear styles, three faces and four hat options use the existing Gem balance. Five treats are included, and a five-treat refill costs 15 Gems. No streaks, penalties or changes to challenge scoring are introduced.

Pet care and cosmetics migrate into the existing `uff-save-v2` save. Roaming stops behind chat and dialogs and respects reduced motion. Run `npm run test:pet` against a running Vite server; see `docs/pet-playtest-report.md` and `docs/pet-development-report.md` for actual verification.
