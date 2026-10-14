# Aippy update — Milo pocket pet

Apply `updates/ultimate-fidget-fingers-pet-20261015.json` on top of the current chat-and-awards version. This 10-file exact-path overlay is pinned to the tested source commit and preserves the Aippy host scaffold and saves.

## Copy-paste prompt

Use Node during the normal Vite build to import:

https://raw.githubusercontent.com/benryaus-cmd/fidget/main/updates/ultimate-fidget-fingers-pet-20261015.json

Download all 10 listed files using manifest.baseUrl + source, then replace their exact target paths.

Preserve saves, purchases, settings, the existing React entry, Aippy runtime integration, Vite plugins, dependencies, README and importer.

Build and load ULTIMATE FIDGET FINGERS.

## Prerequisites

For an older imported version, apply these overlays in order: `ultimate-fidget-fingers-premium-20261014.json`, `ultimate-fidget-fingers-compact-20261015.json`, `ultimate-fidget-fingers-chat-awards-20261015.json`, then this pet overlay. A project already running the chat-and-awards version needs only the pet overlay.

## Runtime

One React root remains. No new runtime dependency is introduced. Pet drawing is procedural canvas and local care/cosmetics are stored inside the existing validated save. Existing players receive the free original pet and five treats; prior Gems, XP, purchases and settings remain intact.

Node runs during normal build/import operations. Preserve the functioning Aippy importer and packaging. Browser tests do not establish actual Aippy import or physical Android performance.
