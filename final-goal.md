# ULTIMATE FIDGET FINGERS — FINAL GOAL

## North star
An original premium, addictive, tactile mobile arcade collection: the immediate accessibility of Suika Game, tactile gratification of Pop It, satisfying progression of Vampire Survivors and beautiful collection/shop feel of Pokémon TCG Pocket. These are quality references, not templates to copy. The player should discover a pleasurable interaction in seconds, win a reward within a minute, and genuinely want one more run.

## Gameplay
- Keep free-play fidgets available indefinitely, but add high-score 30–90 second challenge rounds to the best six or more toys.
- Earn Gems and XP from genuine actions, challenges and one-time achievements; prevent idle and screen-opening farming.
- Spend Gems on studio backgrounds, palettes, visual trails, material styles and optional additional radio stations. Equip purchases, preview before buying, save locally.
- Add awards, milestones, daily objectives, bests, progress celebrations and a collection book. No guilt-driven daily penalties.
- Cut weak games or dramatically rebuild them; 8 amazing toys beat 26 nearly identical demos.
- Signature candidates: POP FRENZY, SPIN LAB, SLIDER SYNC, PIANO RUSH, MARBLE DROP, MAGNET CHAOS.

## Visual standard
- Brand every screen ULTIMATE FIDGET FINGERS. Studio-dark neon, bold readable white text, punchy gradients, studio-lit toys, coherent physical materials, polished glass, sparing high-value particles.
- Stunning but skippable animated entrance. Clear PLAY. Premium showroom thumbnails. Full-screen immersive toy. One-thumb reachable controls.
- Safe area support, 320–430px portrait coverage, responsive landscape, touch-safe scrolling and no cramped text.
- Juice: spring motion, anticipation, squash/stretch, haptics, granular SFX, glints, particle bursts, combo streak feedback, score punches and satisfying progress fills. Tunable effect intensity and reduced motion.
- Aim 60fps on mainstream Android, throttled state writes, capped particles and no unnecessary off-screen animations.

## Economy and rewards
Versioned durable local save: wallet, level, XP, unlocked cosmetics, equipped items, achievements, best scores, settings and daily progress. Atomic Gem spends and idempotent award claims. Distinct audible/visual effects for purchase, reward and milestone. Clear explanation of why Gems were earned. Optional time-based goals should not make players feel punished.

## Sound/radio/assets
- Responsive low-latency fidget SFX, separately controlled effects, haptics and optional radio.
- Inspect benryaus-cmd/graf-game for verified streams and working integration patterns. Radio only starts following direct touch and gracefully handles offline/blocked streams.
- Inspect benryaus-cmd/3d-Maker for high-quality suitable assets, keep actual licenses and attributions in ASSET-CREDITS.md and an in-game About screen.
- No third-party asset is included without source and applicable credit.

## Screens
1. Welcome: premium branded splash and PLAY.
2. Showroom: playable collection with progress and compact wallet.
3. Toy: immersive full-size toy and optional challenge HUD.
4. Results: score, best, Gems, replay.
5. Shop: previews, price, purchased/equipped states.
6. Awards: meaningful progress and earned trophies.
7. Settings/Radio/About: small, readable, fully functional.

## Technical source of truth
The new game is sourced from the user-provided src.zip, not the unrelated c5 project. Its files belong at repository root/src, with exactly one React entry src/main.tsx -> src/App.tsx. Use a standard Vite/React/Aippy configuration based on the working reference scaffold. Keep build-time Aippy GitHub import exact-path and build-driven. No iframe, second app tree or fake import success.

## Milestones
M0: Restore tree, working dependency scaffold, clean build and import manifest.
M1: Premium welcome/showroom and responsive in-game nav, wallet and high-contrast typography.
M2: Shared interaction feedback and real events from toys to progression.
M3: Local XP, Gems, achievements, shop purchases, equip and persistence.
M4: At least six genuine score-based mini-game challenges with bests/results.
M5: Opt-in radio streams, usable audio/haptics controls, licensed artwork and About credits.
M6: Playtest 320/390/430px portrait, desktop and landscape; verify audio on touch, persistence, no overlap, scores, purchases and failsafe streams. Physical Android performance must be measured before claiming it.

## Parallel roles
UI worker owns branded shell/screens; gameplay worker owns tactile toys and challenge rounds; economy worker owns pure state/persistence and tests; sound worker owns audio/radio and licensing; QA worker owns actual builds, interaction/playtests and fixes. Integrate through small defined modules to avoid overwriting each other's files.

## Continuous acceptance
Build -> actually interact -> identify the highest-impact defect -> fix -> build -> play -> check this document. Log only tests actually performed. Release when the first minute is immediately enjoyable and the user can explain how to earn, spend, and enjoy Gems.
