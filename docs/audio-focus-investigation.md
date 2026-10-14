# External music and the game — audio focus investigation

Reviewed 2026-10-14. User report: opening/playing the game in Aippy on Android stops Spotify. No physical Android device was available for reproducing the report during this investigation.

## Confirmed game-side problem and changes

The prior App cue called `unlockAudio()` before `playSound()` could reject muted/zero-volume effects. Thus even a muted navigation gesture could construct/resume a connected AudioContext. That ordering was observable in source and reproducible with the audio-boundary test. It was an unnecessary output activation; it does not alone prove the native cause of Spotify pausing.

The game now has these policies:

- Silent navigation uses a haptic-only `navigation` cue. It creates/resumes no AudioContext and starts no media element.
- Muted effects, zero effects volume and zero per-event volume do not activate output. `unlockAudio()` independently checks effects settings.
- Muting or turning effects volume to zero closes the game's existing effects context; a later real enabled effect can create a new shared context.
- Real effects still sound when enabled. Radio still plays only after explicit Play. The toy music control uses the same radio controller as Radio settings.
- Before real SFX or radio playback, the game feature-detects `navigator.audioSession` and requests `type = 'ambient'`. This is an advisory web API preference for mixable output in hosts that implement it. Absence or a rejected assignment is a safe no-op.

## Installed SDK inspection

Installed package: `@aippy/runtime` 0.4.1. Inspected `dist/audio/types.d.ts`, `dist/audio/useAudioContext.d.ts`, `dist/useSound-z_eIn0KH.js` and `dist/device/index.js`.

The audio SDK exports AudioContext patching, a hidden media-element workaround for iOS silent mode, hooks, auto-unlock and silence-detection/auto-pause options. No Android AudioManager bridge, native mixing option, audio-focus category setter or mix-with-other-apps parameter was found in these exported APIs. The effects engine uses ordinary Web Audio directly; it does not force the SDK's hidden media patch. Device vibration retains the SDK route, which calls browser vibration or the native Aippy message handler once.

A new invented bridge command would not constitute a real Android audio-focus fix. This game sends none.

## What the primary sources establish

[Android audio-focus documentation](https://developer.android.com/media/optimize/audio-focus) distinguishes the system's ability to mix concurrent audio from audio-focus policy. Audio focus is managed through native AudioManager requests; another app can pause or duck when a request changes focus. A JavaScript game cannot directly choose the host application's native focus request using the inspected SDK.

[W3C Audio Session draft](https://w3c.github.io/audio-session/) defines `ambient` as mixable with other audio and exposes it through `navigator.audioSession.type`. This is why the game requests it conditionally. The draft also leaves behavior to the user agent; this does not establish support in Aippy's Android WebView or override native host behavior.

[Chrome's Media Session guidance](https://developer.chrome.com/blog/media-session) and [current web.dev Media Session guide](https://web.dev/articles/media-session) discuss media notifications and platform playback controls. Their duration/focus discussion is not a portable promise for this host. `navigator.mediaSession.playbackState = 'none'`, omitted metadata, routing HTMLAudio through Web Audio, or setting an AudioContext latency hint are not verified native mixing controls. We do not use such hacks or claim that they prevent Spotify interruption.

## Evidence and remaining limitation

The boundary tests verify zero AudioContext construction for silent navigation/muted/zero-volume effects, shared enabled synthesis, context release on mute, preservation of haptics, mixable session preference when exposed, absence-safe behavior, and radio play-only-on-request. TypeScript and production builds are checked separately.

These checks cannot hear Spotify, measure Android AudioManager calls or establish simultaneous music playback. Explicit radio uses an HTMLAudioElement; if Aippy/its WebView requests exclusive native focus, external apps may still pause. Full radio-plus-Spotify mixing requires a verified host/native policy or supported Audio Session implementation and a physical-device test. The current game-side changes reduce unnecessary activation and request mixing where available; they do not claim the Android host issue is fully fixed.

Physical acceptance: play Spotify, launch game, enter every toy, play with SFX muted, then enabled, then start/pause/retry radio. Record whether Spotify continues, ducks, pauses or resumes, along with Aippy version, Android version, device and audio route. Host launch alone stopping Spotify while the game creates no output is an Aippy-native issue rather than a game navigation cue.
