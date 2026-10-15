# Stage 1: v0.7 gameplay depth

Status: ready for local testing. Fidget Fever is next after this test checkpoint. Aippy importer, manifest and prompt files are unchanged.

## Update locally

Stop the existing development server with Ctrl+C. In your existing `fidget` folder run:

```powershell
git pull
npm run dev
```

No additional dependencies are required.

## Try these

Open each toy in free play. Its small top-right button switches between the classic toy and the new playground.

1. **Pop Frenzy → DOMINO.** Hold a bubble and sweep across three neighbouring bubbles without lifting. A finite chain should ripple through nearby bubbles. Clear the board and let it flip. Try short zigzags and long sweeps. Only your manual pops earn action rewards; the automatic pops are extra satisfaction.
2. **Spin Lab → CATCH GAME.** Flick at least one full turn. Watch the pink nose and catch the spinner when it reaches the mint arc. A clean catch moves the target, counts the catch and gets a Pip response. Check whether the timing feels fair and the success is readable after lifting your finger.
3. **Magnet Field → ORBIT.** Hold near the crystals to pull them into an elastic orbit, then release them into the centre vortex. Bank all eight for a fresh constellation. Try moving while holding, releasing small groups and collecting a full ring. Cancelling a gesture should scatter the held crystals gently, without paying for the same capture again.
4. **Classic and challenges.** Toggle back to classic free play. Starting a Leaderboard Challenge always uses the existing classic toy and its scoring rules. Saves and purchases should remain intact.

The most useful feedback is whether the gestures feel responsive, which mode makes you want another go, and any awkward sizing or unclear instructions on your local screen. Android touch feel and performance still need actual device testing.

## Implemented and checked

Domino uses a five-column physical neighbour map at every screen size. A chain travels at most two neighbour hops and automatically pops at most eight bubbles. It never creates classic board-clear awards from an automatic chain. Pointer cancellation, capture loss and a second finger are handled explicitly; timers are disposed when leaving.

Catch practice uses a visible target arc, angular wraparound and a minimum revolution/speed requirement. Perfect and near catches add feedback, not extra challenge points. Catch feedback stays visible after a tap-and-release. Spinner motion stops on app hiding or focus loss.

Orbit has eight bounded crystals. Each direct capture earns once per wave. Cancellation preserves that earned flag; release/vortex motion earns no additional actions. Completion refreshes once. Animation pauses when hidden, and pending refresh timers are cleaned up. Reduced motion removes decorative rotation/glow while retaining the essential intentional toy movement.

Production build passed: 458 kB JavaScript / 150 kB gzip, 99 kB CSS / 23 kB gzip. All 94 named unit checks and the audio/radio scripts passed. Browser checks passed: 18 playground, 62 compact and 13 leaderboard contracts. The compact checks cover 320×520, 390×610 and 430×650 surfaces. Ranked API/profile transport in tests is a fixture; no real scores or chat messages were posted.

The initial cascade browser assertion expected eight automatic bubbles for an edge path, while the rule correctly reached six within two hops. The check now verifies the actual contract, a nonempty bounded cascade and exactly three manual reward events. Two real interaction defects were reproduced and fixed: second-finger interruption of a Domino sweep and catch feedback disappearing on release.

Evidence: [playgrounds](testing/stage-1/playgrounds.json), [compact layouts](testing/stage-1/compact.json), [leaderboard regression](testing/stage-1/leaders.json).
