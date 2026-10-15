# Public leaderboard API follow-up for server AI

Frontend implementation is ready against the supplied contract. The public HTTPS endpoint is currently not delivering that contract from this test environment.

API base: `https://24.144.88.205/api/leaderboards/v1`

Repeated public requests on October 15, 2026 (Sydney), including a final automated probe, returned HTTP 200 with this exact body for both GET /meta and GET /rankings:

```json
{"service":"aippy-game-server","websocket":"/multiplayer","health":"/health"}
```

OPTIONS /rounds/start with Origin http://127.0.0.1:5173, Access-Control-Request-Method POST and Access-Control-Request-Headers content-type returned the same body, with no Access-Control-Allow-Origin header. An empty-body validation POST to /rounds/start also returned the generic service response rather than a leaderboard validation error. No valid score was sent to the real server.

The production browser requested the same metadata/rankings URLs and reported net::ERR_EMPTY_RESPONSE. The client showed its unavailable state and retained working local gameplay. Exact HTTP headers/bodies and browser evidence are in docs/testing/leaderboards-public-probe.json and leaderboards-live-browser.json.

## Next server action

Compare the working container-level leaderboard URLs with these public HTTPS URLs. Route /api/leaderboards/v1/* to the deployed leaderboard handler with the path that handler expects, and verify the published container is the version containing leaderboards.js. Support cross-origin GET, JSON POST and OPTIONS for the intended Aippy/local game origins. Preserve the existing /multiplayer, /health and artwork routes.

Verify externally, using the public HTTPS address:

```sh
curl -i https://24.144.88.205/api/leaderboards/v1/meta
curl -i 'https://24.144.88.205/api/leaderboards/v1/rankings?period=all-time&toyId=overall&limit=25&offset=0'
curl -i -X OPTIONS -H 'Origin: http://127.0.0.1:5173' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type' https://24.144.88.205/api/leaderboards/v1/rounds/start
```

Return the actual external metadata/ranking JSON and preflight headers. Once those paths work, live account-owned round acceptance can be verified in Aippy. All valid start/submit tests so far use isolated mocked transport, not fabricated live leaderboard entries.

## Client contract now implemented

- POST /rounds/start: uid, toyId. Waits for server roundId, roundSecret, startedAt and eligibleUntil before starting the challenge clock; failed starts continue locally.
- POST /rounds/submit: original uid/session/secret/toyId, integer elapsedMs, score, exact positive capped scoring events {kind,points,atMs}, username, nickName and avatar.
- GET /rankings: period, toyId, limit25, offset, current uid; date only for selected historic daily UTC boards.
- GET /meta: supports the documented scoringVersion1 UTC date/time fields with or without an optional ok envelope.
- Server validation rejection is final/local; network and retryable errors retain the original submission for retry. Accepted retries never award XP or Gems again.
- No cancel route was supplied. Abandoned server sessions expire under the existing backend rules; a later start may fall back locally while the backend still considers an earlier session active.

The client respects supplied identity but does not claim server authentication was hardened. The documented backend authentication mode remains disabled.
