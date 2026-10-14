# Aippy update — compact ULTIMATE FIDGET FINGERS

Apply `updates/ultimate-fidget-fingers-compact-20261015.json` to the current ULTIMATE FIDGET FINGERS game. It updates eight exact runtime files on top of the already imported premium version. The original host entry, Vite plugins, dependency configuration, README, importer and player saves remain in place.

## Copy-paste prompt

Use Node during the normal Vite build to import this update:

https://raw.githubusercontent.com/benryaus-cmd/fidget/main/updates/ultimate-fidget-fingers-compact-20261015.json

Download all 8 listed files using manifest.baseUrl + source, then replace their exact target paths in the current ULTIMATE FIDGET FINGERS game.

Preserve saves, purchases, settings, the existing React entry, Aippy runtime integration, Vite plugins, dependencies, README and importer.

Build and load ULTIMATE FIDGET FINGERS. Verify the compact layout fills the Aippy play area, all eight showroom cards fit at 390×610, text stays readable, and each toy has a working music play/pause control.

## Changes

The game sizes to its parent surface instead of the outer phone viewport. Smaller chrome and a slimmer HUD leave more room for toys. Explicit game text colors prevent Aippy's generic dark text rules from leaking in. Radio controls share the existing controller and saved station/volume.

Menu navigation is silent and muted effects never construct or resume an audio context. Enabled effects and explicit radio request a mixable ambient session where the host exposes that API. Actual coexistence with Spotify on Android still needs a phone test; the inspected SDK has no native Android audio-focus setting.

## Previous complete overlay

For a project that has not received the premium eight-toy version, first apply `updates/ultimate-fidget-fingers-premium-20261014.json` (12 files), then this compact overlay (8 files). Both preserve the functioning Aippy host scaffold. The earlier initial manifest is an archived standalone snapshot that includes build configuration.

## Runtime boundaries

One React root, `src/main.tsx` → `src/App.tsx`; App imports its own stylesheet. React, Lucide and `@aippy/runtime/device` were already used by the original source. No remote artwork or new runtime dependency is required. Node runs only during build/import/test operations.

The original src.zip did not include the functioning host Vite/importer configuration. If a host lacks a working importer, add the exact-path downloader to that host's normal Vite lifecycle, then build. The standalone Vite config is not a substitute for Aippy's existing packaging configuration.
