import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const temp=mkdtempSync(`${tmpdir()}/uff-sound-`);
execFileSync('node_modules/.bin/tsc',['src/audio/sound.ts','--outDir',temp,'--target','ES2022','--module','ES2022','--moduleResolution','Bundler','--lib','ES2022,DOM','--skipLibCheck']);
writeFileSync(`${temp}/sound.mjs`,readFileSync(`${temp}/sound.js`,'utf8').replace("'@aippy/runtime/device'", JSON.stringify(pathToFileURL(`${process.cwd()}/node_modules/@aippy/runtime/dist/device/index.js`).href)));
let contexts=0,oscillators=0;const vibrations=[];const nodes=[];
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
class Context {
  state='running';currentTime=0;destination={};
  constructor(){contexts++;}
  createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createOscillator(){oscillators++;const node={frequency:param(),connect(){},disconnect(){},start(){},stop(at){this.end=at;}};nodes.push(node);return node;}
  resume(){return Promise.resolve();}
}
globalThis.window={AudioContext:Context};
Object.defineProperty(globalThis,'navigator',{value:{vibrate:n=>vibrations.push(n)},configurable:true});
const {unlockAudio,playSound,setSoundSettings}=await import(pathToFileURL(`${temp}/sound.mjs`).href);
unlockAudio();unlockAudio();assert.equal(contexts,1,'repeated gestures share one context');
setSoundSettings({muted:true,sfxVolume:1,haptics:true,hapticStrength:1});
playSound('muted-one');assert.equal(oscillators,0);assert.equal(vibrations.at(-1),12,'muting SFX preserves separately controlled haptics');
setSoundSettings({muted:false,sfxVolume:1,haptics:false,hapticStrength:1});
for(const kind of ['melody','piano-miss']) {
  const start=nodes.length;playSound(kind,330);
  assert.equal(nodes.length-start,2,`${kind} must use layered piano feedback`);
  assert.ok(nodes[start].end>=.6,`${kind} must ring rather than produce a short click`);
  nodes.slice(start).forEach(n=>n.onended());
}
let start=nodes.length;playSound('slider',520);
assert.ok(nodes[start].end>=.15,'slider must produce a melodic slide envelope');
nodes.slice(start).forEach(n=>n.onended());
for(const kind of ['switch','switch-match']) {
  const start=nodes.length;playSound(kind);
  assert.equal(nodes[start].type,'square',`${kind} must use mechanical click feedback`);
  nodes.slice(start).forEach(n=>n.onended());
}
const prior=oscillators;
const count=vibrations.length;
for(let i=0;i<30;i++)playSound(`burst-${i}`);
assert.equal(oscillators-prior,20,'concurrent voices capped');assert.equal(vibrations.length,count);
assert.equal(contexts,1);
const bridgeCalls=[];
window.webkit={messageHandlers:{aippyListener:{postMessage:message=>bridgeCalls.push(message)}}};
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
setSoundSettings({muted:true,sfxVolume:0,haptics:true,hapticStrength:.5});
playSound('native-haptic');
await Promise.resolve();
assert.deepEqual(bridgeCalls,[{command:'navigator.vibrate',parameters:6}],'Aippy native bridge handles haptics without browser API');
Object.defineProperty(globalThis,'navigator',{value:{vibrate:n=>vibrations.push(n)},configurable:true});
const beforeBrowser=vibrations.length;
playSound('browser-with-bridge');
await Promise.resolve();
assert.equal(vibrations.length,beforeBrowser+1,'browser vibration remains supported');
assert.equal(bridgeCalls.length,1,'SDK chooses one route and avoids duplicate native vibration');
rmSync(temp,{recursive:true,force:true});
console.log('Shared context, voice cap and independent haptic settings passed. No live sound tested.');
