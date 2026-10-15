import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const output = await build({ entryPoints: ['src/chat/store.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { SharedChatStore, SHARED_CHAT_URL } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
const parsers = await build({ entryPoints: ['src/chat/protocol.ts'], bundle: true, write: false, format:'esm', platform:'node' });
const { mergeHistory, readChatMessage, countParticipants } = await import('data:text/javascript;base64,' + Buffer.from(parsers.outputFiles[0].text).toString('base64'));
const identity = { uid:'sdk-account-123', username:'actual_member', nickName:'Nickname', avatar:'https://example.invalid/avatar.png' };
const caches = new Map();
globalThis.localStorage = { getItem: key => caches.get(key) ?? null, setItem:(key,value) => caches.set(key,value) };
function fixture() {
  let socket;const sockets=[];
  const frames = [];
  const store = new SharedChatStore(url => {
    assert.equal(url, SHARED_CHAT_URL);
    socket = { readyState:1,bufferedAmount:0,onopen:null,onmessage:null,onerror:null,onclose:null,send:data => frames.push(JSON.parse(data)),close() {} };
    sockets.push(socket);return socket;
  });
  const receive = message => socket.onmessage?.({data:JSON.stringify(message)});
  const join = (profile=identity) => {
    store.identify(profile);
    receive({type:'hello',protocol:2,playerId:'p1',minimumNetworkRevision:6,requiredClientCapabilities:['spatial_interest_v1','spatial_world_delta_v1','player_directory_v1'],capabilities:['spatial_interest_v1','chat','player_directory_v1']});
  };
  const snapshot = (chatHistory=[],playerDirectory=[]) => receive({type:'world_snapshot',playerId:'p1',roomId:'morning-quarter-v1',worldId:'map2-v1',serverTime:Date.now(),strokes:[],players:[],playerDirectory,chatHistory});
  const end = () => store.identify(null);
  return {store,frames,join,receive,snapshot,end,sockets};
}
const message = (id='m1', timestamp=Date.now()) => ({ id, playerId:'other',username:'other_user',nickName:'Other nickname',displayName:'Other nickname',text:'Shared hello',timestamp });
test('no fabricated guest or duplicate socket; exact deployed join protocol', () => {
  const f=fixture();
  f.store.identify(null); assert.equal(f.frames.length,0);
  f.join(); f.store.identify({...identity});
  assert.deepEqual(f.frames,[{type:'join',protocol:2,roomId:'morning-quarter-v1',displayName:'Nickname',worldId:'map2-v1',networkRevision:6,capabilities:['spatial_interest_v1','spatial_world_delta_v1','player_directory_v1','basketball_court_v1'],spatialInterest:true,position:[0,0,0],username:'actual_member',nickName:'Nickname'}]);
  f.end();
});
test('server snapshot admission required; chat only sends on explicit user action', () => {
  const f=fixture();f.join();assert.equal(f.store.send('before admission'),false);
  f.receive({type:'world_snapshot',playerId:'wrong',roomId:'morning-quarter-v1',worldId:'map2-v1',strokes:[]});
  assert.equal(f.store.getSnapshot().status,'connecting');f.snapshot();
  assert.equal(f.frames.length,1);assert.equal(f.store.send('  hello  '),true);
  assert.deepEqual(f.frames.at(-1),{type:'chat_message',text:'hello'});
  assert.equal(f.store.send('flood'),false);f.end();
});
test('server permissions control owner actions; nickname cannot grant authority', () => {
  const f=fixture();f.join({...identity,username:'moodytag_4g3b',nickName:'OWNER'});f.snapshot();
  assert.equal(f.store.getSnapshot().isOwner,false);assert.equal(f.store.moderate('kick','other_user'),false);
  f.receive({type:'permissions',role:'player',permissions:['*']});assert.equal(f.store.getSnapshot().isOwner,false);
  f.receive({type:'permissions',role:'owner',permissions:['*']});assert.equal(f.store.getSnapshot().isOwner,true);
  assert.equal(f.store.moderate('mute','@other_user',{durationMinutes:10}),true);
  assert.deepEqual(f.frames.at(-1),{type:'admin_mute',targetUsername:'other_user',durationMinutes:10});
  assert.equal(f.store.moderate('ban','other_user',{durationSeconds:600}),true);
  assert.deepEqual(f.frames.at(-1),{type:'admin_ban',targetUsername:'other_user',durationSeconds:600});
  assert.equal(f.store.moderate('mute','other_user',{durationMinutes:0}),false);
  f.receive({type:'admin_ban_complete',targetUsername:'other_user'});assert.match(f.store.getSnapshot().moderationResult,/Server confirmed/);
  f.receive({type:'permissions',role:'owner',permissions:'invalid'});assert.equal(f.store.getSnapshot().isOwner,false);
  f.receive({type:'kicked',reason:'test'});assert.equal(f.store.getSnapshot().isOwner,false);f.end();
});
test('server mute blocks send; unknown duration remains server checked; ping response exact', () => {
  const f=fixture();f.join();f.snapshot();
  f.receive({type:'chat_mute_state',muted:true,remainingMs:600000,reason:'server moderation'});
  assert.equal(f.store.send('muted'),false);assert.equal(f.frames.length,1);
  f.receive({type:'chat_mute_state',muted:false});assert.equal(f.store.send('unmuted'),true);
  f.receive({type:'ping',timestamp:123});assert.deepEqual(f.frames.at(-1),{type:'pong',timestamp:123});f.end();
});
test('recent history dedupes, sorts, merges snapshot/cache and rejects malformed data', () => {
  const now=Date.now();assert.equal(readChatMessage({...message(),playerId:''}),null);
  assert.equal(readChatMessage({...message(),timestamp:NaN}),null);
  assert.deepEqual(mergeHistory([message('cached',now-1000),message('old',now-3600001)],[message('fresh',now),message('cached',now-1000),{}],now).map(m=>m.id),['old','cached','fresh']);
  const f=fixture();f.join();f.snapshot([message('snapshot')]);
  assert.equal(f.store.getSnapshot().unread,0);
  f.receive({type:'chat_message',message:message('live')});assert.equal(f.store.getSnapshot().unread,1);
  f.receive({type:'chat_message',message:message('live')});assert.equal(f.store.getSnapshot().unread,1);
  const hide=f.store.show();assert.equal(f.store.getSnapshot().unread,0);
  f.receive({type:'chat_message',message:message('visible')});assert.equal(f.store.getSnapshot().unread,0);hide();
  const ids=f.store.getSnapshot().messages.map(m=>m.id);f.end();f.join();f.snapshot([message('new-snapshot')]);
  for (const id of ids) assert.ok(f.store.getSnapshot().messages.some(m=>m.id===id));f.end();
});

test('legacy bodies enrich only from matching actual server directory player IDs', () => {
  const f=fixture();f.join();
  const legacy = id => ({id,playerId:'legacy-player',displayName:'OLD DISPLAY',text:'legacy body',timestamp:Date.now()});
  const directory = [{playerId:'legacy-player',username:'verified_directory_name',nickName:'Directory nickname',avatar:'https://example.invalid/directory-avatar.png',role:'player'}];
  f.snapshot([legacy('legacy-snapshot'),{...legacy('unknown-history'),playerId:'departed-unknown'}],directory);
  let body=f.store.getSnapshot().messages.find(m=>m.id==='legacy-snapshot');
  assert.equal(body.username,'verified_directory_name');assert.equal(body.nickName,'Directory nickname');assert.equal(body.avatar,directory[0].avatar);
  assert.equal(f.store.getSnapshot().messages.find(m=>m.id==='unknown-history').username,'');
  f.receive({type:'chat_message',message:legacy('legacy-live')});
  assert.equal(f.store.getSnapshot().messages.find(m=>m.id==='legacy-live').username,'verified_directory_name');
  f.receive({type:'player_directory_left',playerId:'legacy-player'});
  f.receive({type:'chat_message',message:legacy('after-departure')});
  assert.equal(f.store.getSnapshot().messages.find(m=>m.id==='after-departure').username,'');
  f.receive({type:'player_directory_joined',player:{playerId:'unrelated-player',username:'unrelated',nickName:'Other'}});
  assert.equal(f.store.getSnapshot().messages.find(m=>m.id==='after-departure').username,'');
  f.receive({type:'chat_message',message:{...legacy('fields-present'),username:'explicit_body_name',nickName:'Explicit nickname'}});
  f.receive({type:'player_directory_joined',player:directory[0]});
  assert.equal(f.store.getSnapshot().messages.find(m=>m.id==='after-departure').username,'verified_directory_name');
  assert.equal(f.store.getSnapshot().messages.find(m=>m.id==='fields-present').username,'explicit_body_name');
  f.receive({type:'permissions',role:'owner',permissions:['*']});assert.equal(f.store.moderate('kick',body.username),true);
  assert.deepEqual(f.frames.at(-1),{type:'admin_kick',targetUsername:'verified_directory_name'});f.end();
});
test('pre-admission owner permissions and mute queue until valid matching snapshot', () => {
  const f=fixture();f.join();
  f.receive({type:'permissions',role:'owner',permissions:['*']});
  f.receive({type:'chat_mute_state',muted:true,remainingMs:60000});
  assert.equal(f.store.getSnapshot().isOwner,false);assert.equal(f.store.getSnapshot().mute,null);
  f.receive({type:'world_snapshot',playerId:'p1',roomId:'wrong-room',worldId:'map2-v1',strokes:[]});
  assert.equal(f.store.getSnapshot().isOwner,false);
  f.snapshot();assert.equal(f.store.getSnapshot().isOwner,true);assert.equal(f.store.getSnapshot().mute.muted,true);
  f.end();f.join();f.snapshot();assert.equal(f.store.getSnapshot().isOwner,false);assert.equal(f.store.getSnapshot().mute,null);f.end();
});
test('relative mute expiry uses local clock despite server clock skew', () => {
  const originalNow=Date.now;let local=originalNow();Date.now=()=>local;
  const f=fixture();
  try {
    f.join();f.receive({type:'world_snapshot',playerId:'p1',roomId:'morning-quarter-v1',worldId:'map2-v1',serverTime:local-600000,strokes:[],chatHistory:[]});
    f.receive({type:'chat_mute_state',muted:true,remainingMs:1000});
    assert.equal(f.store.send('still muted'),false);local+=2000;
    assert.equal(f.store.send('elapsed mute'),true);
  } finally { f.end();Date.now=originalNow; }
});
test('live history and unread cache stay bounded to fifteen messages',()=>{
 const f=fixture();try{f.join({...identity,uid:'bounded-history'});f.snapshot();for(let i=0;i<40;i++)f.receive({type:'chat_message',message:message('bounded-'+i,Date.now()-86400000+i)});const state=f.store.getSnapshot();assert.equal(state.messages.length,15);assert.equal(state.unread,15);assert.equal(state.messages[0].id,'bounded-25');assert.equal(JSON.parse(caches.get('fidget-shared-chat-v1:bounded-history')).length,15);}finally{f.end()}
});
test('older cached conversation survives reconnect and explicit removal',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:Date.now()});const f=fixture();try{f.join({...identity,uid:'old-cache'});f.snapshot([message('older-history',Date.now()-86400000)]);f.receive({type:'kicked',reason:'fixture explicit removal'});t.mock.timers.tick(7200000);assert.equal(f.store.getSnapshot().messages[0].id,'older-history');assert.equal(f.sockets.length,1);f.end();f.join({...identity,uid:'old-cache'});f.snapshot();assert.equal(f.store.getSnapshot().messages[0].id,'older-history');}finally{f.end()}
});

test('latest fifteen messages include older conversations, dedupe and sort',()=>{
 const now=Date.now(),history=Array.from({length:30},(_,i)=>message('history-'+i,now-(30-i)*86400000));
 assert.deepEqual(mergeHistory([],history,now).map(m=>m.id),history.slice(-15).map(m=>m.id));
 assert.equal(mergeHistory(history,[history.at(-1)],now).length,15);
});
test('participant count includes self exactly once when directory omits self',()=>{
 const me={playerId:'self',username:'me'},other={playerId:'other',username:'other'};
 assert.equal(countParticipants([],'self','me'),1);assert.equal(countParticipants([other],'self','me'),2);
 assert.equal(countParticipants([me,other],'self','me'),2);assert.equal(countParticipants([me],'self','me'),1);
});
test('dropped connection retries every five seconds and clears retries on sign out',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:Date.now()});const f=fixture();
 try{f.join({...identity,uid:'retry-profile'});f.snapshot();f.sockets.at(-1).onerror();assert.equal(f.store.getSnapshot().status,'disconnected');t.mock.timers.tick(4999);assert.equal(f.sockets.length,1);t.mock.timers.tick(1);assert.equal(f.sockets.length,2);f.sockets.at(-1).onerror();t.mock.timers.tick(5000);assert.equal(f.sockets.length,3);f.end();t.mock.timers.tick(60000);assert.equal(f.sockets.length,3);}finally{f.end()}
});
test('owner kick never auto-rejoins even when its reason mentions Disconnected',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:Date.now()});const f=fixture();try{f.join();f.snapshot();f.receive({type:'kicked',reason:'Disconnected by owner'});t.mock.timers.tick(60000);assert.equal(f.sockets.length,1);}finally{f.end()}
});

test('admission timeout retries, but incompatible protocol waits for an update',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:Date.now()});const f=fixture();try{f.store.identify({...identity,uid:'timeout-retry'});t.mock.timers.tick(12000);assert.equal(f.store.getSnapshot().status,'disconnected');t.mock.timers.tick(5000);assert.equal(f.sockets.length,2);f.receive({type:'hello',protocol:999,playerId:'wrong'});t.mock.timers.tick(60000);assert.equal(f.sockets.length,2);}finally{f.end()}
});
test('maintenance retries without bypassing a subsequent owner ban',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:Date.now()});const f=fixture();try{f.join({...identity,uid:'maintenance-retry'});f.snapshot();f.receive({type:'maintenance',reason:'Server restarting'});t.mock.timers.tick(5000);assert.equal(f.sockets.length,2);f.receive({type:'hello',protocol:2,playerId:'p1',capabilities:[]});f.snapshot();f.receive({type:'banned',reason:'Disconnected'});t.mock.timers.tick(60000);assert.equal(f.sockets.length,2);}finally{f.end()}
});
