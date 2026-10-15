import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';

test('Pip starts cozy with original owned cosmetics and five treats',async()=>{
  assert.ok(existsSync(new URL('../src/pet/state.ts',import.meta.url)),'pet state module must exist');
  const {createPet,PET_ITEMS}=await import('../src/pet/state.ts');
  const pet=createPet();
  assert.equal(pet.name,'Pip');
  assert.equal(pet.treats,5);
  assert.equal(pet.feeds,0);
  for(const category of ['color','ears','face','hat'] as const){
    assert.ok(pet.owned.includes(pet[category]));
    assert.equal(PET_ITEMS.find(i=>i.id===pet[category])!.cost,0);
  }
  pet.owned.push('test');
  assert.ok(!createPet().owned.includes('test'));
});

test('pet cosmetic purchase is atomic and equips while duplicate buys are free',async()=>{
  const {createPet,buyPetItem,equipPetItem,PET_ITEMS}=await import('../src/pet/state.ts');
  const save={gems:90,pet:createPet(),xp:500};
  const item=PET_ITEMS.find(i=>i.id==='color-lavender')!;
  const bought=buyPetItem(save,item.id);
  assert.equal(bought.gems,90-item.cost);
  assert.equal(bought.pet.color,item.id);
  assert.ok(bought.pet.owned.includes(item.id));
  assert.equal(bought.xp,500);
  assert.equal(save.pet.color,'color-mint');
  assert.equal(buyPetItem(bought,item.id),bought);
  assert.equal(buyPetItem({...save,gems:0},item.id).pet,save.pet);
  assert.equal(buyPetItem(save,'missing'),save);
  assert.equal(equipPetItem(save.pet,item.id),save.pet);
  const original=equipPetItem(bought.pet,'color-cream');
  const reused=buyPetItem({...bought,pet:original},item.id);
  assert.equal(reused.gems,bought.gems);
  assert.equal(reused.pet.color,item.id);
});

test('feeding consumes one treat only once during the three second cooldown',async()=>{
  const {createPet,feedPet,petStatus}=await import('../src/pet/state.ts');
  const pet=createPet(),fed=feedPet(pet,10000);
  assert.equal(fed.treats,4);
  assert.equal(fed.feeds,1);
  assert.equal(fed.lastFedAt,10000);
  assert.equal(feedPet(fed,10000),fed);
  assert.equal(feedPet(fed,12999),fed);
  assert.equal(feedPet(fed,9000),fed);
  assert.equal(feedPet(fed,13000).treats,3);
  assert.equal(petStatus(fed,10000).hunger,0);
  assert.equal(petStatus(fed,10000).canFeed,false);
  assert.equal(petStatus(fed,13000).canFeed,true);
  assert.equal(feedPet({...fed,treats:0},13000).treats,0);
  assert.equal(feedPet(pet,NaN),pet);
});

test('care remains optional after long absence with hunger capped and no lost possessions',async()=>{
  const {createPet,petStatus}=await import('../src/pet/state.ts');
  const pet={...createPet(),feeds:1,lastFedAt:1000};
  const original=structuredClone(pet),status=petStatus(pet,1e15);
  assert.equal(status.hunger,100);
  assert.equal(status.canFeed,true);
  assert.deepEqual(pet,original);
  assert.equal(petStatus(pet,0).hunger,0);
});

test('five-treat purchases cost fifteen gems with fifty-treat inventory cap',async()=>{
  const {createPet,buyTreats}=await import('../src/pet/state.ts');
  const save={gems:90,pet:createPet(),xp:77};
  const bought=buyTreats(save);
  assert.equal(bought.gems,75);
  assert.equal(bought.pet.treats,10);
  assert.equal(bought.xp,77);
  assert.equal(buyTreats({...save,gems:14}).gems,14);
  const full={...save,pet:{...save.pet,treats:48}};
  assert.equal(buyTreats(full),full,'only buy a complete five-treat pack');
  assert.equal(buyTreats({...save,pet:{...save.pet,treats:45}}).pet.treats,50);
});

test('names trim and cap visible characters without empty or control-only labels',async()=>{
  const {createPet,renamePet}=await import('../src/pet/state.ts');
  const pet=createPet();
  assert.equal(renamePet(pet,'  Pip  ').name,'Pip');
  assert.equal(renamePet(pet,'').name,'Pip');
  assert.equal(renamePet(pet,'\n\t'),pet);
  assert.equal(renamePet(pet,'abcdefghijklmnopq').name,'abcdefghijklmnop');
  assert.equal([...renamePet(pet,'🐱'.repeat(20)).name].length,16);
});

test('malformed pet saves retain owned valid cosmetics and repair equip and counters',async()=>{
  const {normalizePet}=await import('../src/pet/state.ts');
  const pet=normalizePet({name:42,owned:['color-lavender','color-lavender','missing',null],color:'color-lavender',ears:'hat-crown',hat:'hat-crown',face:[],treats:200,feeds:-3,lastFedAt:'bad'});
  assert.equal(pet.name,'Pip');
  assert.equal(pet.color,'color-lavender');
  assert.equal(pet.ears,'ears-original');
  assert.equal(pet.hat,'hat-none');
  assert.equal(pet.treats,50);
  assert.equal(pet.feeds,0);
  assert.equal(pet.lastFedAt,0);
  assert.equal(pet.owned.filter(id=>id==='color-lavender').length,1);
  assert.ok(!pet.owned.includes('missing'));
});

test('old economy saves gain Pip and pet purchases survive the existing save roundtrip',async()=>{
  const {loadSave,persistSave}=await import('../src/economy.ts');
  const {buyPetItem,feedPet,renamePet}=await import('../src/pet/state.ts');
  const records=new Map([['uff-save-v1',JSON.stringify({gems:300,xp:80,claimed:['first']})]]);
  const storage={getItem:(key:string)=>records.get(key)??null,setItem:(key:string,value:string)=>{records.set(key,value)}};
  const old=loadSave(storage);
  assert.equal(old.pet.name,'Pip');
  assert.equal(old.pet.treats,5);
  const bought=buyPetItem(old,'hat-star');
  const changed={...bought,pet:feedPet(renamePet(bought.pet,'Nova'),123456)};
  assert.equal(persistSave(changed,storage),true);
  assert.deepEqual(loadSave(storage),changed);
  assert.equal(changed.xp,80);
  assert.deepEqual(changed.claimed,['first']);
});
