# ULTIMATE FIDGET FINGERS — FINAL GOAL V2

**Current player-facing baseline: v0.6.**
**Plan date: 15 October 2026.**
**Baseline source: `32c1e10fc375713b33a8f05d67ca3eda08103a63` on `main`.**

This is the next development vision, not a claim that these features already exist. It supersedes the priorities in `final-goal.md` while retaining its architecture, attribution and verification requirements. v0.6 names the current playable checkpoint; this document does not publish a new Aippy build or change the package version.

## 1. The promise

**A pocket-sized playground where your fingers cause wonderfully ridiculous things, your skills get sharper, and your little creature gets a world worth coming back to.**

The player should feel three things: “that felt amazing”, “I can do better”, and “I want that for Pip”. Every substantial update must improve at least one of them. Our identity is tactile mischief: luxurious little objects, surprisingly expressive physics, a mint creature taking everything far too seriously, and occasional spectacular nonsense.

The references remain useful: immediate access from Suika, touch satisfaction from Pop It, combinations and escalation from Vampire Survivors, and collection presentation from Pokémon TCG Pocket. Build our own interactions and personality around fingers, toys and Pip.

### The experience in one session

Open the game and flick a loose bubble across the welcome screen. Pip tries to catch it, misses, and lands sitting down. Enter Pop Frenzy and clear a board with a beautiful rolling sweep. Try a short Arcade Run; choose between bubbles that bounce, a magnet that bends their path, or a bigger final burst. Make a ridiculous cascade. Finish with enough Gems for the headphones you pinned earlier. Put them on Pip and see him immediately do a tiny DJ routine. Try a classic Leaderboard Challenge to beat the player just above you. Leave with a visible next goal.

This sequence is the target experience. It must remain easy to stop after any satisfying round.

## 2. What v0.6 gives us, and what it still needs

The current game has eight distinctive toys, free play, 45-second Leaderboard Challenges, daily/all-time rankings, Gems, XP, cosmetics, 54 awards, radio, shared chat and a customisable Pip. Preserve those working foundations.

The supplied 42-second Aippy recording shows the welcome screen, Pop Frenzy, Slider Sync and Piano Rush, including a guided piano challenge. It demonstrates the compact host layout and Pip's presence in actual use. It does not establish sustained frame rate, sound latency, retention or balance.

Source review identifies the next design opportunities:

- Welcome already has a tappable hero and Pip, but needs a small interaction with an evolving outcome.
- Most toys offer one repeated task. Add decisions, technique and surprising consequences within the interaction itself.
- Mastery currently counts actions at 25/100/250/500. Keep that history, then add achievements that demonstrate skill.
- XP currently advances a repeating 150-XP level meter. Give levels visible destinations.
- Many existing awards reward quantity. Add named feats, memorable unlocks and collections that change the studio.
- The shop already has inexpensive Pip options and more expensive studio themes. Connect purchases to explicit player goals and stronger previews.
- Ranked results already show daily placement. Build on that clear payoff without adding modal clutter.

## 3. The repeat-play loops

| Timescale | Player action | Payoff | Reason to repeat |
| --- | --- | --- | --- |
| Under a second | Press, drag, flick, release | Weight, sound, spring, response | The object feels good |
| 5–20 seconds | Complete a pattern or pull off a trick | A small finale and immediate next pattern | A cleaner or funnier attempt |
| 45 seconds | Play a classic challenge | Score, daily position, personal best, Gems | Beat a reachable score |
| 3–4 minutes | Build an Arcade Run | Three meaningful upgrades and a finale | Try a different combination |
| A few sessions | Work towards a pinned cosmetic or feat | Visible ownership, Pip reaction, collection entry | Finish a set or unlock a trick |
| Another day | Open a fresh daily remix | A new arrangement and optional goals | Something fresh to play |

Keep three obvious ways to play: **Free Play**, **Leaderboard Challenge**, and eventually **Arcade Run**. Do not hide relaxing play behind progression or require players to learn all three.

## 4. The first minute must sell the game

1. The welcome toy responds to the first touch without an account, explanation or sound-permission detour.
2. Dragging and releasing does something beyond the first tap: bounce, squash, catch or collide.
3. Pip notices the result. A second interaction can produce a different reaction.
4. LET'S PLAY remains obvious and usable throughout. The little game fits around the existing UI.
5. The showroom makes the eight toys legible, with descriptions in front of their images. No new large welcome heading.
6. A toy's first action teaches its feel. Its first mini-finale should usually be reachable within 20 seconds.
7. Offer one small next goal inline, such as “Clear one board for your first charm”. Never stack tutorial popups.

**Welcome prototype: Pip's Bubble Playground.** Spawn three squishy bubbles around the title without covering controls. Drag one to stretch it; release to bounce it off safe boundaries. Matching bubbles can merge into a bigger wobble. Pip chases a nearby bubble and occasionally rides it. A large merge bursts into tiny stars and resets the playfield. Cap the number of objects; all menu taps remain reliable. This is an immediately playable delight, not a currency farm or a compulsory tutorial.

First prototype test: hand someone the phone with no explanation. They should discover the interaction, enjoy a second action and find the toy picker within a minute.

## 5. Make the eight toys worth mastering

Every toy needs a recognisable physical sensation, a learnable technique, a small climax, and at least one “did you see that?” moment. Upgrade the strongest three first; expand only after playtesting proves the improvement.

| Toy | Signature technique and tactile upgrade | Free-play / Arcade surprise | Skill feat candidate |
| --- | --- | --- | --- |
| Pop Frenzy | Sweep bubbles with pressure-like deformation, staggered pops and a travelling board-clear ripple | Domino bubbles trigger a controlled cascade; a rare bubble blows a tiny raspberry | Clear a board in one continuous sweep |
| Spin Lab | A tangential flick, convincing coast, bearing rumble and a deliberate brake | A fast spinner lifts slightly; a silly wobble settles when caught | Hold a speed band, then brake inside a target |
| Switch Circuit | Weighted rockers, distinct click on each side, visible current travelling between switches | Complete circuits light a tiny machine that does something absurd | Solve three patterns without an incorrect toggle |
| Piano Rush | Clear phrase anticipation, precise key response, overlapping note releases and a musical phrase ending | Call-and-response with Pip; optional harmony after a clean phrase | Complete a whole melody without a wrong note |
| Slider Sync | Resistance near detents, magnetic snap and a convincing release | Three aligned faders bring a little machine into tune | Land all three faders precisely without a correction |
| Detent Dial | Crisp detents, slight overshoot, directional resistance and a satisfying lock | Dial a playful combination to open a tiny surprise compartment | Hit alternating targets without passing them |
| Marble Drop | Readable launch trajectory, controllable release and distinct collision materials | Bumpers, loops and a final pocket create a tiny trick-shot course | Land consecutive shots in different named cups |
| Magnet Field | Clear attraction radius, mass, orbit and a useful release gesture | Sling orbiting crystals into a vortex for a spectacular final swirl | Gather and release a clean orbit without scattering it |

These are candidate mechanics to prototype, not permission to silently change ranked scoring. New feats need real gameplay events and clear definitions, including handling cancelled touches, resets and backgrounding.

### Priority vertical slice: Pop, Spinner, Magnet

- **Pop:** most immediate satisfaction; prove a cascade is more enjoyable than faster tapping.
- **Spinner:** strongest physical skill opportunity; prove braking and catching feel intentional.
- **Magnet:** strongest potential for emergent movement; prove orbiting and releasing are readable on a small screen.

Piano gets its own musical pass: phrase progression should feel like performing a tune, rather than following unrelated lights. Add a licensed or public-domain songbook, short previews and meaningful difficulty choices. Familiar contemporary songs require a suitable rights path; do not assume an arrangement makes a song available to ship.

### Feedback language

A normal action gets a small response. A precise action gets a brighter, tighter response. A completed pattern gets a brief wave, musical resolution and Pip reaction. A personal best gets the largest celebration. Reserve spectacle so it still means something.

Keep the touch target visible through effects. Use material-specific sound variation, motion direction and controlled squash instead of filling every surface with particles. Effects intensity and reduced motion remain respected everywhere.

## 6. The flagship addition: Arcade Run

**Working title: Fidget Fever.** A short, unranked run where familiar toys acquire wonderfully excessive physical abilities. The appeal is discovering combinations, then getting to use them immediately.

### First playable format

- Start with Pop Frenzy only. One excellent toy with six upgrades is the first experiment.
- Four 35-second stages, three upgrade choices between them, then a short finale. Aim for a complete session of 3–4 minutes including choices.
- Each stage offers a clear target. Meeting it earns a stage star and a stronger finale; missing it still advances the first prototype. No abrupt failure before players understand the loop.
- After each of the first three stages, offer three large, direct-touch upgrade cards. No native dropdowns. Choices must visibly change the next stage.
- Upgrade previews take one sentence and a tiny demonstration. Pick immediately; no inventory management during play.
- End with a satisfying mechanical finale, a bounded reward and a clear replay with a different build.
- Keep run powers temporary. Permanent progression unlocks alternative choices and cosmetics, not superior ranked stats.

### Initial Pop upgrade pool

| Upgrade | Actual interaction change | Combination payoff |
| --- | --- | --- |
| Domino Skin | Clearing a short adjacent sequence sends a pop wave through connected bubbles | Works with clustered boards; cannot repeatedly trigger itself |
| Bounce Back | A popped bubble ejects one soft pellet that can hit another bubble | Aim releases to make a second contact |
| Sticky Fingers | A short drag links up to three bubbles; release pops the chain | Combines with Domino for planned sweeps |
| Big Finish | Completing a board charges a visibly larger final bubble | A deliberate release creates the stage finale |
| Polarity | Every few meaningful pops briefly attracts loose pellets | Curves Bounce Back pellets into a different route |
| Echo Pop | A precisely timed follow-up touch replays a small local pulse | Adds rhythm and skill instead of automatic damage |

Prototype upgrade numbers and triggers in data. Explicitly cap propagation depth, active pellets and repeated hits. A chain reaction must terminate and remain smooth on Android.

Only expand to Spinner and Magnet stages after the single-toy version is fun on repeat. Later combinations can carry a shared property between toys: a magnet bends Pop pellets; spinner speed charges the next stage's release. Do not build eight shallow upgrade trees at once.

### Run rewards

One completion grant, a small explicit stage-star bonus, and separate one-time discovery feats. No Gems per chained particle. Persist a run identifier and its claimed state. If the app closes, resume a local run where practical or bank completed stages once. Never submit modified run points to the current classic leaderboard.

## 7. Progression with things to want

### A. Pin a want

Let players pin one visible cosmetic from its preview. A compact progress chip shows the item, current Gems and price. After a round, show “20 Gems to Little DJ” rather than a vague invitation to shop. The chip opens the preview without changing the current toy.

### B. A studio that remembers play

Add a small collection shelf inside the existing shop/Pip experience. Earn toy charms, miniature trophies and Pip props through specific feats. Equipped pieces appear in the welcome playground or showroom margins, so collections have a home.

First collection: **Pocket Mischief**, eight toy charms plus a completion display stand. Each charm requires one accessible feat for its toy. A harder version can add a different finish later. Collection progress is understandable and deterministic.

### C. Levels become destinations

Keep all existing XP and level history. Add a visible roadmap of upcoming unlocks: an emote, a studio prop, a cosmetic trial, a run-upgrade option. At least the first ten future milestones need named rewards before implementing the roadmap. Do not retrospectively remove purchases or require existing owners to earn their items again.

### D. Skill badges beside existing mastery

Keep action-count mastery as familiarity. Add Bronze/Silver/Gold skill badges based on toy-specific feats: accuracy, control, clean phrases, release timing and distinct successful patterns. Badge requirements must not compare raw scores between toys with different scoring scales.

### E. Better award variety

Retain the five visible award slots and ready-to-claim notification. Add feats and discoveries before adding more “make N moves” tiers. Allow a claim-all action for completed awards; animate the total once. Keep one active goal visible during play only when space permits. All completions remain idempotent.

### Economy targets to measure

The v0.6 baseline starts at 90 Gems; Pip cosmetics cost roughly 20–80, studio themes 180–650, and a completed challenge can grant up to 65. Those are existing values, not a balanced model for the new modes.

- Give a new player a clearly visible cosmetic choice during the first session.
- Target a small new purchase after roughly 2–4 ordinary rounds once introductory awards are exhausted.
- Target a more substantial studio goal over several sessions, with exact progress visible.
- Price new props provisionally in three bands: small 40–80, distinctive 150–250, showcase 400–650. Adjust using measured earnings, not intuition alone.
- Simulate first-session award bursts, low-skill play, expert play and long-term repeat play. Check reward rates per minute for every toy and Arcade Run.
- Separate one-time unlocks from repeatable income. Bound repeatable grants; never mint rewards from passive animation, menu play, idle time or server retries.
- Use existing Gems and XP. Avoid another universal currency, random duplicate compensation system or a reset of the existing wallet.

## 8. Pip should become the reason people remember us

Keep his mint default, taller body, high face, low arms and readable size. Preserve players' chosen names and outfits. Pip should be a character with tiny ambitions, not a permanent notification.

### Event-driven personality

- Near miss: leans in, holds his breath, then gives a tiny sympathetic flop.
- Clean streak: begins a restrained dance that develops with the streak.
- Board clear: attempts to catch a falling sparkle and gets gently flattened by it.
- New best: a one-off victory routine using an equipped hat or prop.
- Long free-play session: settles into a calm idle instead of endlessly demanding attention.
- Repeated taps: a shuffled sequence of reactions, then a playful “okay, okay” gesture. Prevent the same rare gag from repeating immediately.

Reactions have priority, cooldowns and interruption rules. A result celebration can interrupt idle; an idle cannot interrupt a board-clear reaction. During play his moving body stays within a reserved bottom-left area and never captures gestures intended for the toy.

### Things to earn for him

Unlock animations as well as clothes: moonwalk, tiny cartwheel, dramatic bow, bubble ride, sleepy burrito and failed magic trick. Let players equip a favourite victory routine. A hat can add a small matching behaviour, such as headphones producing a brief DJ dance.

Treats can unlock shared moments and trick progress, but absence never makes him sick, removes items or lowers performance. Pip can remember a favourite toy from genuine recent play and use its idle prop on the menu. This is optional flavour, not another daily obligation.

First Pip content batch: six reactions, three unlockable routines, three props and one hat-specific gag. Make the existing options expressive before adding dozens more colours.

## 9. Daily play and friendly competition

### Keep classic challenges trustworthy

The existing 45-second challenges remain the competitive baseline. Preserve toy IDs, scoring version, event kinds, point caps, server-issued sessions and exact-once submissions. Daily stays the default. Best single rounds stay bests; overall remains the sum of accepted classic rounds.

Add a compact next-rival target when a valid ranking is available: “18 points to #12”. Fetch outside the gesture path. At the end, show actual accepted daily placement in the existing status area. Distinguish a retained better daily score from this round's result.

### Daily Remix

A fresh arrangement or modifier makes an existing toy feel different. It is playable offline with a local result. A shared competitive daily seed, modifier validation or separate Remix leaderboard requires an explicit backend extension before it is advertised as ranked.

Start with three optional daily objectives: one familiar toy, one skill feat and one discovery. Completing any two should be enough for the main daily reward. No loss for missing a day. Show a preview of the reward before asking for effort.

### Social features that fit

Use existing chat and profile pictures. Consider an optional one-tap result card or equipped Pip portrait only after the core modes are strong. Sharing into chat must require an explicit player action; never auto-post scores or spam the shared room.

Defer live multiplayer races, trading, gifting and global tournaments until their server costs, moderation needs and gameplay value are justified. A good score chase already gives us competition.

## 10. Compact interface, bigger play

- Keep the current small header controls for music, Pip, chat and wallet. Preserve room for Aippy's surrounding UI.
- Keep bottom navigation stable. Surface Arcade Run inside PLAY; collection and Pip spaces can live within current destinations.
- Show toy art, readable foreground labels and a small relevant progress marker in the existing showroom cards.
- Put the next useful action near the player's thumb. Results should prioritise replay, reward and placement.
- Avoid stacking level, daily task, collection, award, streak and event panels above the toys. Show one pinned goal and contextual notices.
- Retain direct-touch tabs/chips instead of native dropdowns, which have failed in Aippy.
- Chat remains an optional translucent overlay or full room. Keyboard entry stays anchored to the latest message and composer.
- Radio stays opt-in with its saved volume, defaulting to 3% for new saves. SFX, haptics and Pip reactions work independently of radio/network availability.

## 11. Delivery order and stop/go gates

| Checkpoint | Deliverable | Gate before expanding |
| --- | --- | --- |
| **v0.6 baseline** | Preserve current working game and record known limitations | Current saves and accepted scores remain intact |
| **v0.7: Feel & Mischief** | Welcome playground; tactile passes on Pop/Spinner/Magnet; first six Pip reactions; pinned cosmetic | Unprompted first-minute test succeeds; three toys feel better in real touch play |
| **v0.8: Fidget Fever** | Single-toy four-stage run; six upgrades; three choices; finale; bounded rewards and resume handling | Players understand choices and voluntarily try a different build; at least three combinations feel meaningfully different |
| **v0.9: My Little Studio** | Pocket Mischief collection; visible props; skill badges; named level rewards; measured economy | Earn → buy/unlock → equip → enjoy is clear; no grind wall or reward duplication |
| **v1.0 candidate: Return & Refine** | Best-performing run expansion; Daily Remix; rival targets; device polish and release QA | Sustained physical Android play, repeat-session feedback and all regression gates pass |

Version labels describe product checkpoints, not dates or promises. Move or cut a feature if the preceding prototype is weak. Do not solve a weak toy by adding more menus, currencies or notifications.

### First implementation batch after this plan

1. Capture baseline gestures, layout and input/performance measurements on an actual Android device.
2. Prototype Pop's clear ripple and one controlled cascade, plus two event-driven Pip reactions.
3. Test welcome bubbles around the current layout at the smallest host height.
4. Playtest these with a new player and a returning player; retain the changes that improve actual play.
5. Add the pinned goal and the minimum run prototype only after that first feedback pass.

The first batch deliberately proves touch satisfaction and personality before committing to a large progression expansion.

## 12. Engineering and integration boundaries

- Keep one React root and the functioning Aippy build/import path. Preserve the production user-profile compatibility transform and existing host plugins.
- Isolate future run rules, upgrade definitions and collection progression into small modules rather than continuing to grow `src/App.tsx` and `ToyStage.tsx` indefinitely.
- Start from `src/gameplay/`, `src/pet/` and `src/economy.ts`. Add a typed gameplay-event layer for feats/reactions so presentation never manufactures score events.
- Keep runtime animation state outside persistent progression where possible. Coalesce save writes and cap particles, collision objects and pending effects.
- Extend saves with migration tests from actual v0.6 fixtures. Preserve `uff-save-v2`, owned items, names, colours, settings, claimed awards and local bests unless a separately tested migration is necessary.
- Each round/run/reward has a stable identity. Restore, retry, double-tap, remount and server acceptance must not repeat Gems or XP.
- Existing leaderboard requests are separate from local play. Chat outages, radio failures and ranking latency must never block input.
- New competitive modes need a server handover specifying mode IDs, scoring version, eligible durations, event schemas, caps, daily seed rules and leaderboard partitions. Modified Arcade Run points cannot use the current classic endpoint contract.
- Account ownership is not currently authenticated by the leaderboard backend. Coordinate verified identity before promoting rewards or events that depend on trustworthy competitive ownership.
- Maintain source/license credits in repository records and concise readable credits in the game. Do not put build notes or Markdown filenames into the player UI.

## 13. Prove it is fun, then prove it works

### Playtest questions

Observe before asking. Can a new player find something enjoyable without instruction? Do they change technique rather than just tap faster? Can they explain why an upgrade changed the run? Do they notice Pip without losing the target? Do they choose a next goal? Do they replay voluntarily after the reward animation ends?

Run first-touch tests and three-session tests. Separate a new player's discovery from a returning player's mastery. Record concrete misses, confusing moments and voluntary replays; five enthusiastic testers are useful feedback, not proof of retention.

### Minimum verification per substantial batch

- Production build, relevant pure-state tests and real gesture-driven browser checks.
- Portrait widths 320, 390 and 430 CSS pixels; include short embedded heights such as 520/610/650 and keyboard-open chat.
- Physical Android checks for touch cancellation, multitouch where supported, orientation, back/resume, audio unlock and long sessions. Record device and conditions.
- Aim for 60 fps and under 50 ms visible input response on the target phone; measure before claiming either. Investigate sustained frame drops and long tasks during finales.
- Maximum supported effects, reduced motion, muted audio and low volume. Verify Spotify coexistence in the real Aippy host; do not promise a browser-only change controls native audio focus.
- Existing-save migration, atomic purchases, duplicate claims, interrupted runs and queued leaderboard retries.
- Actual accepted classic scores and ranking reads when leaderboard code changes; use agreed QA identities and clean-up arrangements to avoid polluting player competition.
- Offline play, slow server, unavailable radio and dropped chat. Local progress remains available and status remains honest.

Use test evidence to protect the working game. Use playtest evidence to decide what deserves more development. Browser fixtures, recorded footage and measured device performance are different forms of evidence and must be reported separately.

## 14. Definition of the finished experience

We are ready when the first touch is fun, every toy has a technique worth learning, an Arcade Run can produce a surprising combination, Pip has moments players want to show someone, and rewards visibly transform a personal little studio.

A player can enjoy thirty seconds, chase a score for a minute, or build a ridiculous run for a few minutes. They always know what happened, what they earned and what they might try next. The game earns another round through feel, skill, surprise and affection.
