import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSave,persistSave,pinGoal,goalItem,purchase,clearOwnedGoal} from '../src/economy.ts';
import {buyPetItem} from '../src/pet/state.ts';
const store=()=>{let value:string|null=null;return {getItem:()=>value,setItem:(_key:string,v:string)=>{value=v}};};
test('old saves default to no goal and invalid/owned pins do not change wallet',()=>{
 const s=loadSave(store());assert.equal(s.goal,null);
 assert.equal(pinGoal(s,'not-an-item'),s);assert.equal(pinGoal(s,'midnight'),s);assert.equal(pinGoal(s,'color-mint'),s);
 assert.equal(pinGoal(s,'hat-headphones').gems,s.gems);assert.equal(goalItem(pinGoal(s,'hat-headphones'))?.name,'Little DJ');
});
test('studio and Pip pins persist, and buying the goal clears it exactly once',()=>{
 const storage=store(),s=loadSave(storage);
 const pin=pinGoal(s,'hat-headphones');assert.equal(persistSave(pin,storage),true);assert.equal(loadSave(storage).goal,'hat-headphones');
 const bought=clearOwnedGoal(buyPetItem(pin,'hat-headphones'));assert.equal(bought.goal,null);assert.equal(bought.gems,s.gems-55);assert.equal(clearOwnedGoal(bought),bought);
 const studio={...s,gems:500};const next=purchase(pinGoal(studio,'chrome'),'chrome');assert.equal(next.goal,null);assert.equal(next.gems,360);
});
test('goal normalization rejects removed items and preserves unrelated progression',()=>{
 const storage=store(),s={...loadSave(storage),goal:'removed',xp:999,best:{pop:100},gems:57};persistSave(s,storage);const n=loadSave(storage);assert.equal(n.goal,null);assert.equal(n.xp,999);assert.equal(n.gems,57);assert.equal(n.best.pop,100);
});
