# Pending combined pet and leaderboard update

`updates/ultimate-fidget-fingers-leaders-pet-bundle-20261015.json` is a cumulative 16-file overlay, including both pet updates, the text-only wardrobe and refined silhouette, and the leaderboard frontend. It applies after the current chat-and-awards game and supersedes the earlier pet-only overlays. Its source URL is pinned to the tested source commit.

The user is holding the build prompt until the larger bundle is ready. No import prompt is issued for this checkpoint.

One React root, the existing Aippy runtime, entry, importer, build plugins, dependency configuration, saves, settings and existing purchases remain in place. No new runtime dependency is introduced. Pet data remains inside uff-save-v2. Pending leaderboard submissions use the separate uff-leaderboards-pending-v1 key and are scoped to their original account UID.

The documented public leaderboard API currently returns the generic game-server response and browser requests fail. The frontend handles this honestly with unavailable/local-only states. Live acceptance remains blocked by the public API route; see docs/leaderboards-server-followup.md before claiming a working live connection.
