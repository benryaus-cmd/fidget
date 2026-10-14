import test from 'node:test';
import assert from 'node:assert/strict';
import {MELODIES,phraseNotes,advanceMelody} from './melodies.ts';
import {createBoardClearTimer,POP_CLEAR_DELAY_MS} from './catalog.ts';
test('songs contain coherent named public-domain melody transcriptions fitting seven keys',()=>{
 assert.equal(MELODIES.length,3);
 for(const song of MELODIES){assert.ok(song.title.length>4);assert.ok(song.source.startsWith('https://'));assert.ok(song.notes.length>=28);assert.ok(song.notes.every(n=>n.key>=0&&n.key<7&&n.beats>0));assert.deepEqual(song.phrases.flat(),song.notes);assert.ok(song.phrases.every(p=>p.length>0&&p.length<=4));}
 assert.deepEqual(MELODIES[0].notes.slice(0,8).map(n=>n.key),[2,2,3,4,4,3,2,1]);
});
test('four-note chunks advance continuously, last shorter chunk is retained',()=>{
 const s={notes:Array.from({length:6},()=>({key:0,beats:1})),phrases:[[{key:0,beats:1},{key:0,beats:1},{key:0,beats:1},{key:0,beats:1}],[{key:0,beats:1},{key:0,beats:1}]]};
 assert.equal(phraseNotes(s,1).length,2);
 assert.deepEqual(advanceMelody(s,0,3,0),{phrase:1,step:0,correct:true,phraseComplete:true,songComplete:false});
 assert.deepEqual(advanceMelody(s,1,1,0),{phrase:0,step:0,correct:true,phraseComplete:true,songComplete:true});
});
test('wrong notes reset only the current phrase and cannot complete a song',()=>{
 const s={notes:[{key:2,beats:1}],phrases:[[{key:2,beats:1}]]};
 assert.deepEqual(advanceMelody(s,0,0,3),{phrase:0,step:0,correct:false,phraseComplete:false,songComplete:false});
});
test('auto flip schedules only one reset at750ms and awards nothing on its own',()=>{
 let now=0,next=0,queue=[],flips=0;
 const timer=createBoardClearTimer((callback,delay)=>{queue.push({id:++next,at:now+delay,callback});return next;},id=>{queue=queue.filter(t=>t.id!==id)});
 const tick=ms=>{now+=ms;for(const t of queue.filter(t=>t.at<=now)){queue=queue.filter(v=>v.id!==t.id);t.callback();}};
 assert.equal(POP_CLEAR_DELAY_MS,750);assert.equal(timer.arm(()=>flips++),true);assert.equal(timer.arm(()=>flips++),false);
 tick(749);assert.equal(flips,0);tick(1);assert.equal(flips,1);tick(750);assert.equal(flips,1);
});
test('leaving a toy cancels a pending clear and stale callbacks stay inert',()=>{
 let captured,flips=0,cancelled=0;
 const timer=createBoardClearTimer(cb=>{captured=cb;return 1;},()=>cancelled++);
 timer.arm(()=>flips++);timer.dispose();captured();assert.equal(flips,0);assert.equal(cancelled,1);assert.equal(timer.arm(()=>flips++),false);
});
test('a completed clear callback cannot flip twice if a stale callback is invoked',()=>{
 let captured,flips=0;const timer=createBoardClearTimer(cb=>{captured=cb;return 1;},()=>{});
 timer.arm(()=>flips++);captured();captured();assert.equal(flips,1);
});
