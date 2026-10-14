import test from 'node:test';
import assert from 'node:assert/strict';
import {angleDelta,rotationReward,accuracyPoints,stepMarble,TAU} from './physics.ts';
test('angular wrap remains a short movement across the zero seam',()=>{
 assert.ok(Math.abs(angleDelta(-Math.PI+.1,Math.PI-.1)-.2)<1e-8);
 assert.ok(Math.abs(angleDelta(Math.PI-.1,-Math.PI+.1)+.2)<1e-8);
});
test('only whole revolutions earn, bounded by the flick budget',()=>{
 assert.equal(rotationReward(TAU-.01,8),0);
 assert.equal(rotationReward(TAU*3.4,8),3);
 assert.equal(rotationReward(TAU*100,8),8);
 assert.equal(rotationReward(TAU*100,0),0);
});
test('slider precision rejects misses and rewards exact alignment',()=>{
 assert.equal(accuracyPoints(40,50),0);
 assert.equal(accuracyPoints(50,50),30);
 assert.ok(accuracyPoints(44,50)>0);
});
test('gravity accelerates marble and boundary collisions return it to board',()=>{
 const falling=stepMarble({x:150,y:20,vx:0,vy:0},.02,[]);
 assert.ok(falling.vy>0); assert.ok(falling.y>20);
 const bouncing=stepMarble({x:8,y:30,vx:-100,vy:0},.02,[]);
 assert.ok(bouncing.x>=10); assert.ok(bouncing.vx>0);
});
test('a marble striking a peg reflects outward instead of sticking',()=>{
 const bounced=stepMarble({x:150,y:91,vx:0,vy:80},.02,[{x:150,y:110}]);
 assert.ok(bounced.vy<0); assert.ok(bounced.y<=92);
});
test('a centered drop crosses the board within four seconds rather than trapping on pegs',()=>{
 const pegs=Array.from({length:6},(_,r)=>Array.from({length:r%2?6:5},(_,c)=>({x:r%2?35+c*50:60+c*50,y:105+r*43}))).flat();
 let marble={x:150,y:47,vx:0,vy:0};
 for(let frame=0;frame<240&&marble.y<374;frame++)marble=stepMarble(marble,1/60,pegs);
 assert.ok(marble.y>=374);
});
