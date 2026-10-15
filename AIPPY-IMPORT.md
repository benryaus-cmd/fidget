# Pending combined pet and leaderboard update

`updates/ultimate-fidget-fingers-leaders-pet-bundle-20261015.json` is the cumulative overlay after the current chat-and-awards game. It supersedes the earlier pet-only overlays and includes Pip's larger Mint Mochi design, text-only wardrobe, the leaderboard frontend, magnet collection timing and the build compatibility helper. The source URL is pinned to a tested source commit.

The user is holding the build prompt until the larger bundle is ready. No import prompt is issued for this checkpoint.

## Required host build merge

Keep the host's functioning Aippy importer, entry, `@aippy/vite-plugins`, single-file bundling and other configuration. Do not replace its Vite config with this repository's minimal standalone config.

Add `import {aippyUserCompat} from './build/aippy-user-compat'` to the host Vite config and include `aippyUserCompat()` in its existing plugins array. The overlay includes this helper, but deliberately does not overwrite the host config. The future combined build/import instruction must include this merge step.

The helper fixes a reproduced Vite 6 production optimization bug with `@aippy/runtime@0.4.1`: the SDK's dynamic-import namespace unwrap was discarded, leaving `useUserInfo` unable to read native profiles in production despite working in development. It narrowly parenthesizes the SDK's awaited expression before compilation, retaining the SDK's own native/iframe identity logic. The standalone production bundle and profile fixture were verified after this fix. It introduces no runtime dependency.

## Saves and verification

Maintain one React root. Pet data stays in `uff-save-v2`; untouched legacy defaults migrate to Mint Mochi, while purchased colours, names, care and wallet/XP persist. Pending leaderboard submissions use the separate account-scoped `uff-leaderboards-pending-v1` key.

Public routing is now working. Actual challenge submissions and live rankings are covered by the latest development report, `docs/pip-live-leaderboards-report.md`. Previous reports describing the routing failure are historical. Actual Aippy loading and physical Android performance/audio still require host/device verification; standalone browser tests do not establish those.
