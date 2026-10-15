import test from 'node:test';
import assert from 'node:assert/strict';
import {createBubbles,stepBubbles,mergeBubble} from '../src/welcome/physics.ts';
test('welcome physics stay bounded and held bubbles do not drift',()=>{
 const b=createBubbles(320,100),held={...b[0]};for(let i=0;i<1000;i++)stepBubbles(b,320,100,.02,0);
 assert.deepEqual(b[0],held);for(const v of b){assert.ok(v.x>=v.radius&&v.x<=320-v.radius);assert.ok(v.y>=v.radius&&v.y<=100-v.radius);}
});
test('intentional matching releases merge, a second merge bursts, and count stays bounded',()=>{
 let b=createBubbles(320,100);b[0].x=b[1].x;b[0].y=b[1].y;
 let r=mergeBubble(b,0,320,100);assert.equal(r.merged,true);assert.equal(r.burst,false);assert.equal(r.bubbles.length,3);
 b=r.bubbles;b[0].x=b[1].x;b[0].y=b[1].y;r=mergeBubble(b,0,320,100);assert.equal(r.burst,true);assert.equal(r.bubbles.length,3);assert.ok(r.bubbles.every(v=>v.level===0));
});
test('unmatched release never changes collection or creates bubbles',()=>{
 const b=createBubbles(320,120);assert.equal(mergeBubble(b,0,320,120).bubbles,b);assert.equal(mergeBubble(b,99,320,120).merged,false);
});
