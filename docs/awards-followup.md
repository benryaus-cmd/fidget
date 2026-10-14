# Rotating awards

The catalog now contains 54 permanent, one-time awards. The seven existing award IDs and their Gem prizes remain unchanged. New awards measure meaningful lifetime actions, per-toy actions, genuinely completed challenges, completed Pop boards and guided piano songs. XP totals, wallet balances, screen visits and idle time do not unlock new awards.

## UI contract

- `availableAwards(save): Award[]` returns at most five unclaimed awards. Eligible awards come first in catalog order; unfinished awards follow in descending completion ratio, with catalog order breaking ties. Claiming an award removes it and immediately fills its slot from the remaining catalog.
- `claimableAwards(save): Award[]` returns all eligible, unclaimed awards for header/nav badge counts. It includes awards outside the five visible slots.
- `newlyClaimableAwards(before, after): Award[]` returns threshold crossings that remain unclaimed. Compare a real progression update's prior and next save to queue popups. Repeating the same comparison is pure; the UI owns notification delivery and deduplication.
- `claimAward(save, id)` still checks eligibility and ownership of the claim atomically. Repeated claims leave the save unchanged.

## Completion events and storage

`Save.rounds` records completed challenges by toy. Only valid, unique `completeRound()` calls increment it. Total lifetime challenges use `completedRounds.length`, so historical saved challenge IDs count toward total awards. Historical per-toy rounds cannot be recovered from arbitrary old IDs; their counters start at zero.

`Save.milestones` records actual completion events. Gameplay calls `recordMilestone(save, kind)` once per genuine event, using `pop-board-clear`, `piano-song-complete`, or `piano-perfect-song`. A perfect song should report both the song-complete and perfect-song events. Opening/resetting a board or starting a song must not report completion. Event calls do not directly award XP or Gems. Board/song events are not inferred from move counts. The gameplay caller owns once-per-completion reporting.

The v2 schema tolerates saves without the two new records and validates counters. Existing v1 migration and claimed IDs remain supported. Fresh saves and malformed/missing radio preferences use volume `0.03`; valid explicit saved volumes remain intact.

## Verification

Economy unit tests cover five-slot replacement, ready-first ordering, completion ratios, threshold-crossing notifications, existing award prize preservation, genuine milestone counters, unique round counts, schema migration and radio volume preservation. Run `node --test tests/economy.test.ts` and `npx tsc --noEmit`.
