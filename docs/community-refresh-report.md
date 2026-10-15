# Community, credits and daily challenge results

## Player-facing changes

About now uses plain SomaFM attribution, Pip's Kenney/Mohammad credit and Lucide/ISC credit. The earlier 26-toy origin paragraph, Milo wording, repository Markdown reference, hyperlinks and release-permission copy are removed from the game UI. The radio panel uses the same plain attribution. Source attribution records remain in the repository.

Chat keeps the latest 15 messages from the server/cache, regardless of age, rather than filtering to the past hour. Live history, cache and unread counts remain bounded to those 15 messages. It still joins automatically when the Aippy profile arrives. Transport failures, connection timeouts and temporary maintenance retry after five seconds; network return/app visibility resume retries a dropped connection immediately. The retry decision is a typed local status, rather than matching human-readable error strings. Kicks, bans, denied permissions and incompatible protocols remain effective. Presence includes the viewer once whether the server directory includes or omits self. Gameplay and progression continue during chat outages.

Other players' chat pictures use the shared message/directory photo first, then the matching username's photo from the existing public leaderboard. The background lookup is paginated, cached for five minutes and shared between callers. Missing/unavailable/broken pictures retain the initial fallback. Players absent from both photo sources cannot acquire a remote picture through this frontend-only change. No backend endpoint or chat join protocol is changed.

Daily is the initial leaderboard period. The game button is now Leaderboard Challenge, with the 45-second duration retained in a small second line. After server acceptance, the existing result status box requests the current player's daily rank for that individual toy with limit 1. It uses the same top-three rank glyphs as the leaderboard, or a numeric place. A lower round shows the stored higher daily best as kept; no result overwrites that best. Placement lookup is read-only and separate from submission/reward handling. A failed rank lookup leaves the score accepted and does not enqueue or repay it.

## Verification

Production TypeScript/Vite build and all 81 named unit checks plus audio/radio scripts passed. New unit coverage checks age-independent 15-message history, bounded unread/cache state, viewer counting, five-second retries, admission timeout, maintenance, terminal kick/ban/update handling, paginated/cached photos and accepted-result daily placement. Higher-best retention and placement-query failure are covered.

The focused production browser suite passed 8 checks. It exercised automatic chat admission before opening chat, clean credits, actual Pop input/persistence during a drop, a real five-second reconnect, 15 messages from two days earlier, remote and own rendered profile images, presence with/without self, immediate network-return recovery, Daily default and All Time selection. Two actual eligible gameplay rounds scored 24 then 12 points; the existing result bubble showed daily place 2 while retaining the 24-point best.

The full social suite passed 26/26, including keyboard-safe bottom scrolling, profiles, owner moderation frames, awards, background marble landing and persistence. The leaderboard contract suite passed 13/13 and compact layout suite passed 62/62 at 320/390/430-pixel widths, including the renamed challenge control. Chat/score browser transports and native profiles in these suites are isolated fixtures; they do not post to the real shared room or leaderboard.

Read-only HTTPS requests to the real API verified all eight individual daily queries with limit 1/current-player identity, including actual daily ranks returned outside the displayed first player. No new QA scores, sessions or messages were created. An exploratory Chromium live-ranking probe timed out through the workspace proxy; the read-only HTTPS probe succeeded. Actual Aippy/Android verification of this update follows import.

Evidence: [production browser](testing/community-refresh-browser.json), [social regression](testing/community-social-results.json), [leaderboard regression](testing/community-leaders-results.json), [compact layout](testing/community-compact-results.json), [live read-only daily ranks](testing/community-daily-live-read.json).
