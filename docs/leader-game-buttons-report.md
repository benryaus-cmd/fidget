# Leaderboard game buttons

Replaced the native leaderboard game dropdown, reported broken in the Aippy app, with a horizontal row of ordinary touch buttons. Overall and all eight games have direct buttons, a selected state and a swipe hint. The row scrolls independently and keeps the surrounding page within the mobile width. Daily/All Time controls and the selected UTC date remain available; changing game resets pagination.

Production TypeScript/Vite build passed. The focused browser test passed all nine game selections, matching API queries/selected states, Daily retaining the selected game, first/last game reachability at 320/390/430 pixels, and a real horizontal touch swipe. The full leaderboard contract browser suite passed 13/13, including pagination and current-player ranks.

A read-only production browser test loaded real API rankings for all nine game buttons and Daily Overall, with no uncaught errors. It created no identities, sessions or scores. The workspace HTTPS proxy required the same test-only Chromium CA exception described in the previous report. Physical Aippy verification remains the user's next step.

Evidence: [mobile buttons](testing/leader-game-buttons-results.json), [live API](testing/leader-game-buttons-live-results.json).

Apply the two-file `updates/ultimate-fidget-fingers-leader-buttons-20261015.json` overlay after the already imported Pip/live-leaderboard bundle. Set the importer's expected version to `ultimate-fidget-fingers-leader-buttons-20261015` when selecting this update. Existing build plugins, profile integration, saves and server scoring stay in place.
