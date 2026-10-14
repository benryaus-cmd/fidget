# ULTIMATE FIDGET FINGERS — assets and audio

Reviewed 2026-10-14. This file records provenance, not a claim that every third-party use is cleared.

## Original work

Toy visuals are rendered procedurally in React, CSS, SVG and Canvas. Emoji are rendered by the user’s platform font; no emoji artwork is bundled. Tactile effects in `src/audio/sound.ts` are synthesized locally with Web Audio oscillators and envelopes; no sampled recordings are bundled. Radio waveform decoration and station mood captions are original interface work. No SomaFM logo, station artwork, playlist feed or downloaded recording is included.

## Interface icons

Lucide React — https://lucide.dev / https://github.com/lucide-icons/lucide — ISC license. Copyright (c) for portions of Lucide are held by Cole Bemis 2013–2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Optional development radio — SomaFM

Source: https://somafm.com/. Listener-supported radio. Support: https://somafm.com/support/. The game includes source/support/terms links. Names identify the requested stations; no endorsement or affiliation is claimed.

| Station | Requested development endpoint | Official format/source |
| --- | --- | --- |
| PopTron | https://ice5.somafm.com/poptron-128-mp3 | MP3 128 kbps; https://somafm.com/poptron/directstreamlinks.html |
| Vaporwaves | https://ice5.somafm.com/vaporwaves-128-mp3 | MP3 128 kbps; https://somafm.com/vaporwaves/directstreamlinks.html |
| Indie Pop Rocks! | https://ice1.somafm.com/indiepop-128-mp3 | MP3 128 kbps; https://somafm.com/indiepop/directstreamlinks.html |
| Groove Salad | https://ice1.somafm.com/groovesalad-128-mp3 | MP3 128 kbps; https://somafm.com/groovesalad/directstreamlinks.html |
| Beat Blender | https://ice1.somafm.com/beatblender-128-mp3 | MP3 128 kbps; https://somafm.com/beatblender/directstreamlinks.html |

Official pages were reviewed for station/format provenance. Direct servers are changeable: the current Indie Pop Rocks page lists ice5/ice2, so the requested ice1 endpoint is not independently verified by that listing. Exact requested URLs remain in the development implementation; this does not assert that every server is live or that playback succeeds on every browser.

**Public release limitation:** https://somafm.com/contact/tos.html (updated 2026-09-04) explicitly covers games and website embedding. It says SomaFM cannot grant permission for new third-party clients/apps under its existing music agreements. Direct-link pages restrict those links to personal use and specifically exclude video games. Attribution and a donation link do not grant permission. No third-party game streaming license has been obtained. The requested streams are implemented for the user-directed development integration; public distribution must remove/replace embedding with licensed music or external personal-listening links unless applicable rights are independently secured. Do not sell access to SomaFM content; in-game Gem station entries are development UI unlocks, not a music license.

## Reference inspection

`benryaus-cmd/graf-game`, commit `5ac7f8e586259ac35010e1d86df2b53148dbcb3e`: inspected `src/game/liveRadio.ts` and `src/config/radio.ts` for lazy media creation, explicit playback, listener cleanup, rejected-play handling and station switching. That revision uses FluxFM (not SomaFM). No reference source code or FluxFM asset/stream has been copied into this project. Our controller is independently implemented.

## Verification scope

Audio-module TypeScript and media-boundary regression tests exercise no-autoplay, media-event-based playing state, rejected-play handling, loading timeout, pause, volume clamping, one shared synthesis context, capped voices and independent haptic settings. This test substitutes a media boundary and cannot verify real sound, service availability, network/CORS behavior or device haptics. Live browser playback and physical Android listening/performance must be reported separately when actually tested.

## Additional asset source assessed

`benryaus-cmd/3d-Maker`, tree commit `116266fd5dd32c866ad56d5f949431469929bbd5`, was inspected for available asset families and licenses. Its city/road/character GLB models and condensed game fonts serve a different 3D street-game style. No assets from that repository are bundled in this lightweight procedural arcade.

## Piano melody transcriptions and shared chat

Piano Rush uses independently entered opening melodies of Beethoven's **Ode to Joy**, the traditional **When the Saints Go Marching In**, and the traditional **Twinkle, Twinkle, Little Star**. These are public-domain melodies, not recordings or arrangements copied from commercial songs. Note sequences and attribution metadata live in `src/gameplay/melodies.ts`; historical sources are recorded in `docs/toy-followup.md`. Sound is synthesized by the game's shared piano engine.

Shared chat reuses the owner's `benryaus-cmd/graf-game` deployment and protocol (reference commit `5ac7f8e586259ac35010e1d86df2b53148dbcb3e`). The compact React client is implemented for this game. Existing user profile images remain third-party/user data and are not bundled artwork. See `docs/chat-integration.md` for protocol, permissions and verification boundaries.
