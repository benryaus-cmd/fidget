# Automatic Pop boards and recognizable Piano songs

## Pop Frenzy

The board now celebrates automatically on its final unique pop and turns to a fresh, recolored side after 750 ms. Both free play and challenge use the same transition. A `BOARD CLEAR!` banner stays visible during the pause; the manual flip button has been replaced by an automatic-flip status.

- Each bubble is still scored once, using the synchronous `done` set guard.
- The final pop emits exactly one zero-point `board-clear` milestone event. The reset emits no action, points, XP or Gems.
- The timer helper refuses a second pending reset, invalidates stale callbacks after completing, and cancels/reset-invalidates callbacks on unmount or a new round.
- Active sweep pointers are cleared before the new side appears, so a held finger cannot automatically score the next board. A new pointerdown is needed.
- Reduced motion retains the visible banner and automatic refresh but removes the board-turn and celebration animations.

## Piano Rush

The challenge now follows three recognizable melodies instead of arbitrary four-note patterns. All retain the existing seven C–B keys and A S D F G H J shortcuts. Each tune progresses continuously through chunks of at most four notes; shorter final chunks are retained. The current title, composer and phrase count are visible. A song selector lets the player choose a classic.

| Song | Played excerpt | Chunks | Historical reference |
| --- | --- | --- | --- |
| Ode to Joy | Complete familiar 30-note opening theme, transposed to C major | 8 | [Beethoven Symphony No. 9, Op.125](https://imslp.org/wiki/Symphony_No.9,_Op.125_(Beethoven,_Ludwig_van)) |
| When the Saints Go Marching In | Familiar 34-note chorus melody in C major | 9 | [Library of Congress traditional-song catalog](https://www.loc.gov/item/afc9999005.3748/) |
| Twinkle, Twinkle, Little Star | Complete 42-note familiar tune in C major | 11 | [Historical Ah! vous dirai-je, maman theme](https://imslp.org/wiki/12_Variations_on_%27Ah,_vous_dirai-je_maman%27,_K.265/300e_(Mozart,_Wolfgang_Amadeus)) |

These are independently written simplified, single-line transcriptions of a public-domain composition and traditional melodies. No recording, scanned score, downloaded note file or modern arrangement is included. Mozart is a reference to the historical theme used in his variations; the Twinkle tune is credited as traditional, not as Mozart's composition. `MELODIES` stores title, composer, provenance, source URL, timed notes and phrases.

Listen previews the current phrase at 300 ms per beat through the existing synthesized piano. It emits only zero-point `piano-preview` events, leaves the score and phrase untouched, and blocks scored key presses during playback. Stop, changing songs, leaving the toy and starting a new round cancel all queued previews and invalidate stale callbacks.

Correct notes score 8; the final note of an intermediate phrase scores 30; the final note of a song scores 60 with event kind `song-complete`. A whole song with no wrong notes additionally emits zero-point `perfect-song`. Wrong notes reset the current phrase and invalidate perfection. Song changes reset progress; they never emit completion. Successful song completion advances to the next classic.

Keyboard shortcuts ignore text inputs, textareas, selects, contenteditable elements, textbox/dialog/chat ancestors and modifier shortcuts, so typing into the assistant cannot play notes.

## Verification and integration

`node --test src/gameplay/*.test.mjs` passed all 12 tests. The new melody/transition suite covers playable melody range, named sources, retained note order, continuous phrase progression, short final chunks, wrong-note rejection, exact 750 ms delay, duplicate timer starts, unmount cancellation and inert duplicate callbacks. New timing and progression assertions were observed failing before implementation; the wrong-note test also guards the established rejection behavior.

`npx tsc --noEmit` passed after implementation. Browser checks are delegated to QA; this document does not claim device performance or audible physical-device verification.

QA selectors: `.bubble.target`, `[data-bubble]`, `.board-clear-banner[data-board-clear=true]`, `.pop-auto-footer`; `select[aria-label="Choose a song"]`, `.song-progress`, `.melody-strip [data-note]`, `.melody-strip .current`, note buttons `C note`–`B note`, and buttons `Listen to current phrase` / `Stop phrase preview`.
