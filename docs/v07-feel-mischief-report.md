# v0.7 Feel & Mischief: first implementation batch

## Delivered

Slider Sync uses metal-handle dragging instead of a native range track. Pressing the track leaves the value alone. A grab preserves the finger's offset; release evaluates the same existing precision score. Pointer cancellation, lost capture, window blur and app hiding abandon a drag without rewards. Keyboard adjustments remain available. Challenge handles lock individually, and three perfect releases still score 90 points.

The welcome screen now has three physical bubbles before LET'S PLAY. Grab, flick and merge matching bubbles into bigger wobbles; a second merge bursts and refreshes them. The playground is bounded to three objects, pauses motion when hidden, supports reduced motion and never earns Gems or XP. Pip reacts to merges and bursts. Bubble controls take input priority over Pip's roaming touch area.

Pop bubbles spring on release and a completed board sends a staggered ripple before the existing automatic flip. Spin Lab shows held/coasting feedback, a speed-sensitive bearing glow and a brake sound when caught. Magnet Field celebrates a completed wave with a fading ring and a resolving sound. Classic ranked event types, point values, limits, timing and server submission handling are unchanged.

Pip has six new poses: catch, squish, bow, float, dizzy brakes and ready-to-spin focus. Important celebrations get priority over routine input and idle dancing. His existing size, body proportions, mint default and purchased appearances are preserved.

Studio and Pip cosmetic previews can be pinned as the next goal. The showroom shows the item's name and remaining Gem cost in place of the usual next-award strip, keeping the layout compact. A pinned Pip goal reopens on its wardrobe category and preview. Pins survive reload, clear when purchased, and cannot create rewards or deduct money. Older saves receive an empty optional goal without losing progress.

## Actual verification

- Production TypeScript/Vite build passed: approximately 445 kB JavaScript / 146 kB gzip and 98 kB CSS / 22 kB gzip.
- 89 named unit checks and the existing audio/radio scripts passed.
- 20 production browser checks passed, including real pointer and touchscreen drags, offset preservation, cancellation, three-fader challenge scoring, welcome motion/merges/burst, goal purchases/reload, spinner braking, and physical magnet collection. The magnet test reads the rendered crystal pixels to aim at survivors after a broad sweep; it does not inject collection or score events.
- 62 compact checks passed across 320×520, 390×610 and 430×650 embedded layouts.
- 44 broader gameplay checks passed, including a full 45-second challenge, rewards, saves, shop, radio failure handling and reduced motion.
- 26 social/chat, 12 Pip and 13 leaderboard-contract browser checks passed. Their profiles/network transports are fixtures; no QA scores or messages were posted to live services.
- Independent code review was completed. Production screenshots were inspected.

Evidence is in [docs/testing/v07](testing/v07). Browser interaction tests are browser evidence, not measurements of physical Android latency or frame rate.

## Failures found and resolved

The original Slider Sync regression reproduced a track press moving the value from 20 to 76. It now stays at 20. Initial welcome integration collapsed inside the existing centered grid, so the new playground explicitly fills its available width. Pip's overlay initially intercepted the first bubble, especially with reduced motion; stacking and pointer routing now let bubbles receive their gestures. Reduced-motion bursts initially stayed visible because the global CSS disables animation; a cleaned-up timer now removes the cue.

The older social test suite imports development source modules. Running it against static production preview caused fixture import failures; it passed against the development server. The new v0.7 suite and compact/leaderboard checks ran against the production bundle.

## Remaining v0.7 gates

This is the first implementation batch from final-goal-v2.md, not completion of every checkpoint. Check touch feel and sustained performance in the actual Android Aippy host, including Spotify coexistence, which has not been established here. Observe a new player finding the welcome interaction and a returning player trying the improved toys. Use that feedback before extending physics or starting Fidget Fever. This batch does not add automatic ranked cascades, a run mode, new collections or a backend migration.
