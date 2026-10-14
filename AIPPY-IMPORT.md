# Aippy update — chat, music and rotating awards

Apply `updates/ultimate-fidget-fingers-chat-awards-20261015.json` on top of the current compact game. This is an 18-file exact-path overlay pinned to the tested source commit. It preserves the existing Aippy scaffold, importer and saves.

## Copy-paste prompt

Use Node during the normal Vite build to import:

https://raw.githubusercontent.com/benryaus-cmd/fidget/main/updates/ultimate-fidget-fingers-chat-awards-20261015.json

Download all 18 listed files using manifest.baseUrl + source, then replace their exact target paths.

Preserve saves, purchases, settings, the existing React entry, Aippy runtime integration, Vite plugins, dependencies, README and importer.

Build and load ULTIMATE FIDGET FINGERS. Verify the shared music/chat header, ninth chatroom tile, foreground captions, automatic Pop board flip, piano melody challenges and five-slot awards shelf. Check actual Aippy profile admission, owner controls and keyboard resizing on a phone.

## Prerequisites and runtime

For a project without the premium eight-toy version, first apply `updates/ultimate-fidget-fingers-premium-20261014.json` (12 files), then `updates/ultimate-fidget-fingers-compact-20261015.json` (8 files), then this overlay. These preserve the functioning Aippy host scaffold. The initial manifest is an archived standalone snapshot containing build configuration.

One React root remains. No new runtime dependency is introduced. Chat uses the installed `@aippy/runtime` user-info integration and existing HubSide WebSocket server. Outside an identified Aippy session, chat is read-only. Node runs only during import/build/test operations.

The original source ZIP did not include the functioning host importer configuration. Preserve that host's normal Vite lifecycle and packaging. Browser tests do not prove an actual Aippy import or physical Android behavior; see the development and chat reports for tested boundaries.
