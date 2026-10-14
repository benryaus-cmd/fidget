# Aippy update — ULTIMATE FIDGET FINGERS

Use `updates/ultimate-fidget-fingers-premium-20261014.json` for this upgrade. It lists the complete runtime gameplay overlay and credits, using exact paths. It intentionally preserves the host entry, package/config files, Aippy plugins, index, README and existing importer. This is the source configuration supported by the supplied original src archive.

The earlier initial manifest is an archived standalone snapshot and includes build configuration. The new overlay is the appropriate update for an already functioning Aippy host.

## Copy-paste prompt

Use Node during the normal Vite build to import ULTIMATE FIDGET FINGERS:

https://raw.githubusercontent.com/benryaus-cmd/fidget/main/updates/ultimate-fidget-fingers-premium-20261014.json

Download all 12 listed files using manifest.baseUrl + source, then replace their exact target paths. Keep the existing Aippy entry, runtime integration, Vite plugins, dependencies, README and working GitHub importer. The existing single React entry mounts src/App.tsx; the new App imports its own stylesheet.

Build and load ULTIMATE FIDGET FINGERS. Verify the actual game displays eight toys, Pop bubbles respond to touch, a 45-second target challenge works, and material/radio purchases persist after reload. Report actual downloads, replacements and build results.

## Integration boundaries

Runtime dependencies are React, Lucide and `@aippy/runtime/device`; these were present in the original Aippy source. The gameplay uses no remote artwork and creates no second React root. Native haptics use the Aippy SDK; browser fallback is supported. Normal gameplay runs in the browser; Node is needed only for build/import/test operations.

The host's Vite/importer configuration was not included in src.zip. If it lacks a working importer, add the exact-path downloader to that existing host's normal Vite build lifecycle and run the build. The repository's standalone vite.config.ts is not a substitute for an established Aippy configuration.

This checkpoint was compiled and loaded from a local production build. Actual Aippy deployment and physical Android validation are not claimed.
