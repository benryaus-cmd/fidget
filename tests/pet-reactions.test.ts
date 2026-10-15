import test from 'node:test';import assert from 'node:assert/strict';
import {emoteForEvent,reactionPriority} from '../src/pet/emotes.ts';
test('six new physical moments have distinct Pip reactions',()=>{
 const kinds=['welcome-merge','welcome-burst','slider-sync','magnet-wave','spin-brake','spin-start'];assert.equal(new Set(kinds.map(emoteForEvent)).size,6);
});
test('major celebrations outrank ordinary input and idle',()=>{assert.ok(reactionPriority('best')>reactionPriority('score'));assert.ok(reactionPriority('board-clear')>reactionPriority('piano'));assert.ok(reactionPriority('award')>reactionPriority('combo'));});
