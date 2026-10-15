import test from 'node:test';
import assert from 'node:assert/strict';
import {dominoCascade,adjacent,gradeCatch,createOrbit,stepOrbit,releaseOrbit} from '../src/gameplay/sandbox/rules.ts';
test('domino cascade has finite breadth, never repeats and excludes already popped bubbles',()=>{
 const done=new Set([0,1,2]);const result=dominoCascade(2,done);assert.ok(result.length>0&&result.length<=8);assert.equal(new Set(result).size,result.length);assert.ok(result.every(i=>i>=0&&i<25&&!done.has(i)));assert.deepEqual(dominoCascade(0,new Set(Array.from({length:25},(_,i)=>i))),[]);
});
test('adjacent path uses physical neighbours, not wrapped board edges',()=>{assert.equal(adjacent(4,5),false);assert.equal(adjacent(1,2),true);assert.equal(adjacent(1,6),true);assert.equal(adjacent(1,7),false)});
test('spinner catch requires a genuine revolution and sufficient coasting speed',()=>{
 assert.equal(gradeCatch(0,10,0,5),'unready');assert.equal(gradeCatch(0,1,0,8),'unready');assert.equal(gradeCatch(Math.PI*2+.1,8,0,8),'perfect');assert.equal(gradeCatch(.35,8,0,8),'near');assert.equal(gradeCatch(1,8,0,8),'miss');
});
test('orbit capture pays once per crystal even when a gesture is cancelled',()=>{
 const w=createOrbit();w.pointer={x:160,y:210,active:true};const captures:number[]=[];
 for(let i=0;i<300;i++)captures.push(...stepOrbit(w,.016).captures);
 assert.equal(captures.length,8);assert.equal(new Set(captures).size,8);assert.equal(w.crystals.filter(c=>c.mode==='orbit').length,8);
 releaseOrbit(w,true);w.pointer.active=true;const again:number[]=[];for(let i=0;i<300;i++)again.push(...stepOrbit(w,.016).captures);assert.equal(again.length,0);
});
test('a released orbit reaches the vortex exactly once and stays bounded',()=>{
 const w=createOrbit();w.pointer.active=true;for(let i=0;i<300;i++)stepOrbit(w,.016);assert.equal(releaseOrbit(w,false),8);
 let completions=0;for(let i=0;i<500;i++){const r=stepOrbit(w,.016);completions+=Number(r.complete);assert.equal(r.captures.length,0);}
 assert.equal(completions,1);assert.equal(w.crystals.filter(c=>c.mode==='banked').length,8);assert.ok(w.crystals.every(c=>Number.isFinite(c.x)&&Number.isFinite(c.y)));
});
