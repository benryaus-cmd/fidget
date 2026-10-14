import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const temp = mkdtempSync(`${tmpdir()}/uff-radio-`);
execFileSync('node_modules/.bin/tsc', ['src/audio/radio.ts','--outDir',temp,'--target','ES2022','--module','ES2022','--lib','ES2022,DOM','--skipLibCheck']);
writeFileSync(`${temp}/package.json`,JSON.stringify({type:'module'}));
writeFileSync(`${temp}/radio.mjs`,readFileSync(`${temp}/radio.js`));
const { RadioController, STATIONS } = await import(pathToFileURL(`${temp}/radio.mjs`).href);
class Media extends EventTarget {
  volume=0; src=''; preload=''; paused=true; plays=0; reject=false;
  play(){this.plays++; this.paused=false; return this.reject?Promise.reject(new Error('blocked')):Promise.resolve();}
  pause(){this.paused=true;setTimeout(()=>this.dispatchEvent(new Event('pause')),0);}
  load(){} removeAttribute(){}
}
Object.defineProperty(globalThis,'navigator',{value:{audioSession:{type:'auto'}},configurable:true});
const media = new Media();
const player = new RadioController(()=>media, 15);
assert.equal(STATIONS.length,5);
player.select('vaporwaves');
assert.equal(media.plays,0,'selecting must never autoplay');
assert.equal(navigator.audioSession.type,'auto','station selection never activates an audio session');
player.play();
assert.equal(navigator.audioSession.type,'ambient','explicit radio play requests mixing only when supported');
assert.equal(player.snapshot().status,'loading','promise success is not proof of playback');
media.dispatchEvent(new Event('pause'));
assert.equal(player.snapshot().status,'loading','stale queued pause must not cancel a newer play');
media.dispatchEvent(new Event('playing'));
assert.equal(player.snapshot().status,'playing');
player.pause();
assert.equal(player.snapshot().status,'paused');
media.reject=true;
player.play();
await new Promise(r=>setTimeout(r,0));
await new Promise(r=>setTimeout(r,5));
assert.equal(player.snapshot().status,'error','queued pause must not erase playback error');
media.reject=false;
player.play();
await new Promise(r=>setTimeout(r,25));
assert.equal(player.snapshot().status,'error','hung playback must time out');
assert.equal(media.paused,true);
player.volume(Number.NaN);
assert.equal(media.volume,0);
player.dispose();
rmSync(temp,{recursive:true,force:true});
console.log('Radio state, no-autoplay, blocked-play and timeout checks passed. No live audio tested.');
