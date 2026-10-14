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

Progress saves on this browser/device. No accounts, multiplayer or real-money payments are implemented. SomaFM radio embedding is a development integration with a documented public-release rights limitation in `ASSET-CREDITS.md`.

## Compact Aippy update

The game now sizes to its containing surface, with smaller navigation, eight visible showroom cards at 390×610, larger toys, explicit scoped text contrast and per-toy radio controls. See `docs/compact-playtest-report.md` for 62 compact checks plus the 44-check main suite, and `docs/audio-focus-investigation.md` for the precise external-music behavior and host limitations.
