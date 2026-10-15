# Current incremental update

Apply `updates/ultimate-fidget-fingers-community-daily-20261015.json` after the already imported Pip/live-leaderboard bundle and leaderboard game-button update. This is an 11-file overlay for the existing main game.

Set the existing importer's expected version to `ultimate-fidget-fingers-community-daily-20261015` when selecting this manifest. Download its exact files during the normal build using its pinned baseUrl. Existing Aippy build plugins, the `aippyUserCompat()` helper, single-file bundling, importer, entry and dependency configuration remain in place. This update introduces no dependency or additional React root.

It includes cleaned credits/radio attribution, 15-message chat history, background reconnection, viewer-inclusive presence, remote profile photo fallback through existing leaderboard data, Daily default and the compact daily placement result for Leaderboard Challenge.

Keep saves, Gems, XP, purchases, settings and the existing server integration. There is no server patch. Test evidence and photo-source limits are in `docs/community-refresh-report.md`.
