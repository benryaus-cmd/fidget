# Pending combined Aippy update

The latest tested pet expansion is prepared as `updates/ultimate-fidget-fingers-pet-expanded-20261015.json`, a cumulative 12-file overlay containing both the initial pet and its expanded wardrobe, emotes and game-footer companion. Its source URL is pinned to the tested commit. It can be included in the next larger update; the user is holding the import until that bundle is ready.

This pet overlay applies after the chat-and-awards version. Older projects first apply the premium eight-toy, compact-layout and chat-and-awards overlays in that order. The original 10-file pet overlay is superseded by this cumulative version.

One React root, the existing Aippy runtime, build lifecycle, importer, dependencies and saves remain in place. No new runtime dependency is introduced. Pet state uses the existing validated uff-save-v2 save. Colours, ears, faces, hats, chosen names, treats and existing arcade progress remain intact.

The normal Vite build runs the host's existing exact-path downloader with Node. Actual Aippy import and physical Android behavior remain device verification work. No new build prompt is issued for this checkpoint.
