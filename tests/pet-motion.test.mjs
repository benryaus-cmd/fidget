import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotion,stepMotion,reactMotion,fitPlatforms} from '../src/pet/motion.ts';
test('platforms clamp inside usable surface and discard unusable duplicates',()=>{
 assert.deepEqual(fitPlatforms([{x:-5,y:20},{x:999,y:999},{x:999,y:999}],320,480),[{x:63,y:126},{x:257,y:470}]);
});
test('pet makes an arc and lands on a real platform without escaping bounds',()=>{
 const p=[{x:40,y:120},{x:230,y:150}];const m=createMotion(p);let airborne=false,landed=false;
 for(let i=0;i<400;i++){stepMotion(m,.016,p,false);airborne||=m.action==='hop';landed||=m.hops>0;assert.ok(Number.isFinite(m.x)&&Number.isFinite(m.y));assert.ok(m.x>=40&&m.x<=230);}
 assert.ok(airborne&&landed);assert.ok(m.hops>=1);
});
test('reduced motion keeps its position and tap feedback does not jump',()=>{
 const p=[{x:50,y:100},{x:200,y:100}],m=createMotion(p);reactMotion(m);for(let i=0;i<300;i++)stepMotion(m,.016,p,true);assert.equal(m.x,50);assert.equal(m.y,100);assert.equal(m.hops,0);
});
test('reaction lasts through a tap, then normal idle resumes without awarding anything',()=>{
 const p=[{x:50,y:100}],m=createMotion(p);reactMotion(m);stepMotion(m,.1,p,false);assert.equal(m.action,'happy');for(let i=0;i<150;i++)stepMotion(m,.016,p,false);assert.equal(m.action,'idle');assert.equal(m.hops,0);
});
test('returning from a hidden tab cannot teleport across several hops',()=>{
 const p=[{x:50,y:100},{x:200,y:100}],m=createMotion(p);stepMotion(m,100,p,false);assert.equal(m.hops,0);assert.equal(m.x,50);
});
test('hops between low perches keep the entire enlarged character inside the content area',()=>{
 const p=[{x:50,y:126},{x:200,y:126}],m=createMotion(p);
 for(let i=0;i<300;i++){stepMotion(m,.016,p,false);assert.ok(m.y>=121,'ears must remain visible at the apex');}
});
