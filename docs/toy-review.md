# Toy curation and gameplay review

The source collection supplied in `src.zip` has 26 distinct component files. The rebuilt studio selects eight strong interactions and gives each a clear scoring rule, premium custom rendering, free play and a timed challenge through the shared shell. No original remote image or audio asset is required by these toys.

## Decisions across all 26 originals

| Original | Decision | Reason / new behavior |
| --- | --- | --- |
| BubbleWrapToy | Rebuild → Pop Frenzy | Real 25-bubble silicone board; captured multi-pointer taps, sweep support, unique pops and a challenge target. Flip is enabled only after clearing. |
| FidgetSpinnerToy | Rebuild → Spin Lab | Actual pointer angle, measured angular velocity, decaying inertia, full-turn scoring and an eight-turn budget for each flick. |
| SwitchToggleToy | Rebuild → Switch Circuit | Four three-dimensional rockers, visible target pattern, complete-pattern challenge scoring. |
| PianoToy | Rebuild → Piano Rush | Seven responsive colored keys, simultaneous pointer input, keyboard support, four-note phrases, distinct completed-melody rewards. |
| SlidersToy | Rebuild → Slider Sync | Three faders with visible numerical targets, accuracy points on release, locked challenge lanes and new target sets. |
| SpinningDialToy | Rebuild → Detent Dial | Pointer movement follows real angles; release snaps to twelve detents, target detent matching scores. |
| MarbleRunToy | Rebuild → Marble Drop | Aim-and-release launcher, gravity, reflecting pegs, five receiving cups; each dropped marble scores exactly once on landing. |
| MagnetToy | Rebuild → Magnet Field | Eight visible collectibles attracted by a moving magnet, finite scored waves and explicit release to recharge. No sprite dependency. |
| LightSwitchToy | Consolidate into Switch Circuit | A single light toggle overlaps the stronger multi-rocker interaction. |
| GearTurnToy | Consolidate into angular toys | Original gears move and tick when idle; retaining such ticks as rewards would create idle farming. Real manual angular interaction is retained in Spinner and Dial. |
| GravityBallsToy | Consolidate into Marble Drop | Original Matter.js pile is another ball physics sandbox; the directed launcher offers a clearer challenge without adding dependencies. |
| VacuumToy | Consolidate into Magnet Field | Sweeping and collecting is retained, but crystals have physical attraction, a visible count and finite waves. |
| KineticDotsToy | Consolidate into Pop Frenzy | Original proximity wobble overlaps a tactile bubble surface; the rebuilt board provides explicit completion. |
| FluffySurfaceToy | Cut from first collection | Surface stroking has a weak discrete scoring boundary and overlaps other sweep toys. |
| VelvetTouchToy | Consolidate into cosmetic trails | Colored ribbons become an equipped visual treatment rather than another duplicate interaction. |
| WaterRippleToy | Consolidate into interaction effects | Ripples are decorative feedback; tapping alone adds little challenge differentiation. |
| DrawingPadToy | Cut from first collection | A drawing tool needs saving/export and a creative workflow to become a substantial toy; scoring brush motion is not meaningful. |
| KineticSandToy | Cut from first collection | Painted sand mounds offer no reliable completed action or challenge in the supplied implementation. |
| SandRakeToy | Cut from first collection | Persistent painted grooves repeat the drawing interaction. |
| SlimeScreenToy | Cut from first collection | Deforming a spring blob overlaps the squishy and stress balls; a stronger standalone mechanic would be needed. |
| SquishyBallToy | Cut from first collection | Dragging a soft ellipse repeats the spring-ball family. |
| StressBallToy | Cut from first collection | Holding to squeeze is pleasant but not a sufficient repeated challenge or fair action reward. |
| StretchFaceToy | Cut from first collection | Face deformation repeats the same drag-and-return family. |
| CatToy | Defer | Its articulated character has charm, but preserving it requires a separate character/pet design and verified purr audio provenance. |
| WindowMistToy | Defer | Hidden-picture reveal could become a good extra, but original remote image provenance and a full reset/reveal loop need attention. |
| ZipperToy | Defer | Nice linear interaction; the stronger slider challenge fills this space in the first eight. |

## Scoring boundaries

- Pop: one reward per previously unpopped bubble; challenge accepts only the selected bubble. A board must be cleared before resetting it.
- Spinner: one reward per complete revolution accumulated during a user gesture and its remaining momentum. Each gesture can score at most eight turns. Rendering alone does not award points.
- Switch: free play rewards a completed toggle with a 70 ms guard; challenge rewards matching all four switches. Unmatched flips emit a zero-point click event. New patterns are guaranteed to differ from the solved pattern.
- Piano: free play rewards a note press with a 100 ms per-key guard; challenge accepts the current melody note, awards phrase completion and resets phrase progress on wrong notes. Wrong notes produce a zero-point sound event.
- Sliders: reward only on release/keyboard completion after at least two units of actual movement, with a 400 ms guard per fader. Alignment tolerance is eight units; closer matches pay more. Matched lanes lock in challenge mode.
- Dial: manual angular movement must exceed 0.12 radians, followed by release to a detent. Challenge scores only the selected number.
- Marble: capped at six live marbles, drops at least 250 ms apart; drop release emits a zero-point sound event; score at the receiving cup and immediately remove the scored marble.
- Magnet: reward each crystal once; holding a stationary magnet cannot spawn new waves. Collection is finite until all eight are collected and the pointer is released.

## Implementation contract

`catalog.ts` exports `ToyId` and `TOYS` with `id`, `name`, `tag`, `accent`, `instruction`, `challenge`. `ToyStage.tsx` exports default `ToyStage` and the props type. Props: `toy`, `challenge`, `roundKey`, `onAction`, `reducedMotion`, `intensity`, `material`, `trail`. Changing toy, mode or round key remounts the toy and clears its temporary state. Points flow solely through `onAction({points, kind, pitch?})`; the shell owns durations, rewards, save data and sound/haptics.

Physical motion uses refs and direct DOM/canvas updates. Spin RAF stops once momentum rests and is cancelled on unmount. Canvas RAF, ResizeObserver and visibility listener are cleaned on unmount; hidden-page physics pause. Canvas DPR is capped at two, particles at 48, canvas pointer traces at 28, CSS pointer traces at 22 and CSS action bursts at six. Reduced motion removes decorative animation and trails while preserving essential physics and pointer feedback.

Soft/default, chrome and glass treatments cover all eight toys, including angular bearings and canvas materials. Sparkle, neon and confetti cosmetics create actual capped pointer trails on every toy. Size-container layouts reserve status/control height before fitting the board; portrait and landscape have dedicated contained layouts. No new dependencies. Canvas and CSS visuals are original rendering, with no imported third-party artwork.

## Verification performed by gameplay worker

- Wrote five scoring/physics assertions before implementation and observed all five fail for the missing behavior.
- Implemented helpers and observed five passing tests.
- QA noticed centered marble drops taking too long. Added a full peg-board regression asserting a centered drop lands in under four simulated seconds, observed failure, then tuned gravity and restitution and observed all six tests pass.
- `node --test src/gameplay/physics.test.mjs`: six passing tests, zero failures.
- `npx tsc --noEmit`: passed after the eight-toy integration.

Browser interaction and responsive acceptance are recorded by the separate QA worker. Physical Android frame timing and device haptics are not claimed here.
