# v0.7 Feel & Mischief Implementation Plan

**Goal:** Implement the first v0.7 batch from final-goal-v2.md, including handle-only Slider Sync input.
**Spec:** `final-goal-v2.md`, v0.7 checkpoint.
**Architecture:** Isolate the slider gesture control and welcome physics in focused modules; reuse existing event, sound, pet and economy pathways. Classic challenge rules remain unchanged.
**Execution:** Inline implementation, then independent review and integrated verification. The user has approved working towards v0.7.

## Constraints and review focus

Preserve saves, stable ranked scoring and Aippy import integration. Input cancellations never pay rewards. Welcome interactions never earn currency. Motion settings apply to new effects. Short embedded screens retain all navigation and toy controls. Pins must survive reload and clear when purchased.

## Tasks

- [x] Slider: regression reproduces track jumping; replace native range with a handle-only pointer-captured control with grab offset, keyboard support, cancellation and locked state; verify drag/release scores once.
- [x] Welcome: bounded bubble physics and accessible tap/drag controls, merges/bursts, no economy side effects; Pip reacts through existing events. Pause while hidden and remove RAF on unmount.
- [x] Toy/Pip feedback: Pop ripple, spinner drag/coast readout and brake cue, magnet wave finale; six distinct event reactions with priority and cooldown. Preserve ranked event kinds/points.
- [x] Pinned goal: optional validated save field, compact showroom goal, shop preview pin action and automatic clearing on purchase; test old saves, persistence and wallet invariants.
- [x] Verify production gestures and layouts at 320/390/430 pixels, run unit/build/regressions, inspect screenshots, review, publish source plus exact-file Aippy manifest and evidence report.

## Deliberate scope

This batch improves feedback without adding ranked mechanics or automatic scoring cascades. Fidget Fever and collections remain later checkpoints. Physical Android feel/performance and new-player enjoyment need on-device follow-up.

## Verification ledger

Production gestures: 20/20. Compact: 62/62. Gameplay: 44/44. Social: 26/26. Pip: 12/12. Leaderboard contracts: 13/13. Unit checks: 89 plus audio/radio scripts. Production build passed.

Independent review found collapsed welcome width, Pip intercepting bubble gestures, and reduced-motion burst cleanup. All three were corrected and covered by the production drag/merge/burst check.

Scope decision: deliver the first v0.7 feedback batch with classic scoring intact. Physical Android measurement and unprompted new-player tests remain open, so this is progress towards v0.7 rather than a claim all checkpoint gates are met.
