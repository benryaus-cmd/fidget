import test from 'node:test';
import assert from 'node:assert/strict';
import {createPet,normalizePet,renamePet,PET_ITEMS,buyPetItem} from '../src/pet/state.ts';
test('Pip replaces the old default while chosen names survive migration',()=>{
 assert.equal(createPet().name,'Pip');assert.equal(normalizePet({name:'Milo'}).name,'Pip');assert.equal(normalizePet({name:'Meetchu'}).name,'Meetchu');assert.equal(normalizePet(renamePet(createPet(),'Milo')).name,'Milo');
});
test('expanded wardrobe includes twelve palettes, nine faces and ten distinct hats',()=>{
 assert.ok(PET_ITEMS.filter(i=>i.category==='color').length>=12);assert.ok(PET_ITEMS.filter(i=>i.category==='face').length>=9);assert.ok(PET_ITEMS.filter(i=>i.category==='hat').length>=10);assert.ok(PET_ITEMS.some(i=>i.id==='color-gold'));assert.equal(new Set(PET_ITEMS.map(i=>i.id)).size,PET_ITEMS.length);
});
test('new gold and costume purchases equip once without changing arcade progress',()=>{
 const save={gems:1000,pet:createPet(),xp:753,best:{pop:100}};let next=save;
 for(const id of ['color-gold','face-heart','hat-wizard']){const item=PET_ITEMS.find(i=>i.id===id);assert.ok(item);const before=next;next=buyPetItem(next,id);assert.equal(next.gems,before.gems-item.cost);assert.equal(buyPetItem(next,id),next);assert.equal(next.pet[item.category],id);}
 assert.equal(next.xp,753);assert.deepEqual(next.best,{pop:100});assert.equal(normalizePet(next.pet).hat,'hat-wizard');
});
test('floppy ears use mirrored outside attachments rather than folding over the eyes',async()=>{
 const {earPlacement,paletteFor}=await import('../src/pet/appearance.ts');
 for(const side of [-1,1]){const p=earPlacement('ears-floppy',side,0,0,0);assert.ok(Math.abs(p.x)>=13);assert.equal(p.mirror,side);assert.ok(p.y>=5);}
 const palettes=PET_ITEMS.filter(i=>i.category==='color').map(i=>paletteFor(i.id));assert.equal(new Set(palettes.map(p=>p.body)).size,palettes.length);assert.equal(paletteFor('color-gold').metallic,true);
});
test('random tap emotes avoid immediate repeats and real game events map to appropriate reactions',async()=>{
 const {TAP_EMOTES,chooseTapEmote,emoteForEvent}=await import('../src/pet/emotes.ts');assert.ok(TAP_EMOTES.length>=8);
 let last='idle';const seen=new Set();for(let i=0;i<48;i++){const next=chooseTapEmote(last,()=>i%8/8);assert.notEqual(next,last);seen.add(next);last=next;}assert.ok(seen.size>=7);
 assert.equal(emoteForEvent('board-clear'),'confetti');assert.equal(emoteForEvent('song-complete'),'dance');assert.equal(emoteForEvent('miss'),'encourage');assert.equal(emoteForEvent('best'),'confetti');
});
test('Pip is 30 percent taller with the face high and paws low',async()=>{
 const {bodyDimensions,bodyAnchors}=await import('../src/pet/appearance.ts');const b=bodyDimensions(1,1),a=bodyAnchors(b.h);assert.equal(b.h,35.5*1.3);assert.equal(b.w,19.2);assert.equal(b.wb,16.6);assert.ok(a.faceY<b.h*.36);assert.ok(a.pawY>b.h*.75);
});
test('Mint Mochi is free by default; untouched old defaults migrate and explicit colours survive',()=>{
 assert.equal(createPet().color,'color-mint');assert.ok(createPet().owned.includes('color-mint'));
 assert.equal(normalizePet({color:'color-cream',owned:['color-cream']}).color,'color-mint');
 const chosen=buyPetItem({gems:100,pet:createPet()},'color-cream').pet;assert.equal(normalizePet(chosen).color,'color-cream');
 const gold=buyPetItem({gems:100,pet:createPet()},'color-gold').pet;assert.equal(normalizePet(gold).color,'color-gold');
});
