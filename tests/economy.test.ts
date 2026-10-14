import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('economy exposes a safe default save and bounded genuine play rewards', async () => {
  assert.ok(existsSync(new URL('../src/economy.ts', import.meta.url)), 'economy module must exist');
  const { DEFAULT_SAVE, recordAction } = await import('../src/economy.ts');
  let save = structuredClone(DEFAULT_SAVE);
  assert.equal(save.gems, 90);
  assert.deepEqual(save.owned, ['midnight','soft','sparkle','poptron']);
  assert.equal(recordAction(save,'pop',0), save);
  for(let i=0;i<150;i++) save=recordAction(save,'pop',1);
  assert.equal(save.gems,110);
  assert.equal(save.interactions,150);
  assert.equal(save.mastery.pop,150);
  const capped = recordAction(save,'pop',1e10);
  assert.equal(capped.xp-save.xp,10);
});

test('purchases atomically deduct their actual price and only owned items equip', async () => {
  const { DEFAULT_SAVE, purchase, equip, ITEMS } = await import('../src/economy.ts');
  const base=structuredClone(DEFAULT_SAVE);
  const item=ITEMS.find(i=>i.cost>0)!;
  assert.equal(purchase(base,item.id),base);
  assert.equal(equip(base,item.id),base);
  const rich={...base,gems:1000};
  const bought=purchase(rich,item.id);
  assert.equal(bought.gems,1000-item.cost);
  assert.ok(bought.owned.includes(item.id));
  assert.equal(purchase(bought,item.id),bought);
  const equipped=equip(bought,item.id);
  assert.equal(item.category==='station'?equipped.settings.station:equipped[item.category],item.id);
  assert.equal(purchase(rich,'invalid'),rich);
  assert.equal(rich.gems,1000);
});

test('mastery uses shared showroom thresholds and collector counts only themes',async()=>{
  const { DEFAULT_SAVE, MASTERY_THRESHOLDS, AWARDS, claimAward }=await import('../src/economy.ts');
  assert.deepEqual(MASTERY_THRESHOLDS,[25,100,250,500]);
  const save=structuredClone(DEFAULT_SAVE);
  assert.equal(AWARDS.find(a=>a.id==='collector')!.progress(save),1);
  assert.equal(claimAward(save,'collector'),save);
  assert.equal(AWARDS.find(a=>a.id==='master')!.target,500);
});

test('old daily progress resets without lost lifetime progress or a duplicate round payment',async()=>{
  const { DEFAULT_SAVE, recordAction, claimDaily, completeRound }=await import('../src/economy.ts');
  const previous={...structuredClone(DEFAULT_SAVE),interactions:800,mastery:{pop:400},daily:{date:'2000-01-01',actions:100,rounds:1,claimed:true},completedRounds:['paid-before']};
  const reset=recordAction(previous,'pop',1);
  assert.equal(reset.daily.actions,1);
  assert.equal(reset.daily.rounds,0);
  assert.equal(reset.daily.claimed,false);
  assert.equal(reset.interactions,801);
  assert.equal(reset.mastery.pop,401);
  assert.equal(claimDaily(reset),reset);
  assert.equal(completeRound(reset,'pop',40,45,'paid-before').reward,0);
});

test('save round trip keeps equipment and bounded settings with independent defaults',async()=>{
  const { loadSave,persistSave,DEFAULT_SAVE,purchase,equip }=await import('../src/economy.ts');
  const data=new Map<string,string>();
  const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value)}};
  const save=equip(purchase({...structuredClone(DEFAULT_SAVE),gems:1000},'vaporwaves'),'vaporwaves');
  assert.equal(persistSave(save,storage),true);
  assert.deepEqual(loadSave(storage),save);
  const a=loadSave(),b=loadSave();
  a.owned.push('gold');
  assert.ok(!b.owned.includes('gold'));
});

test('awards require earned progress and can be claimed only once', async () => {
  const { DEFAULT_SAVE, recordAction, claimAward } = await import('../src/economy.ts');
  const base=structuredClone(DEFAULT_SAVE);
  assert.equal(claimAward(base,'first'),base);
  const earned=recordAction(base,'pop',1);
  const claimed=claimAward(earned,'first');
  assert.equal(claimed.gems,earned.gems+20);
  assert.equal(claimAward(claimed,'first'),claimed);
  assert.equal(claimAward(earned,'unknown'),earned);
});

test('round rewards require meaningful play and remain capped and idempotent', async () => {
  const { DEFAULT_SAVE, completeRound } = await import('../src/economy.ts');
  const base=structuredClone(DEFAULT_SAVE);
  assert.equal(completeRound(base,'pop',50,9,'early').reward,0);
  assert.equal(completeRound(base,'pop',0,45,'empty').reward,0);
  assert.equal(completeRound(base,'pop',NaN,45,'invalid').reward,0);
  const won=completeRound(base,'pop',100000,45,'round-1');
  assert.equal(won.reward,65);
  assert.equal(won.isBest,true);
  assert.equal(won.save.daily.rounds,1);
  const retry=completeRound(won.save,'pop',100000,45,'round-1');
  assert.equal(retry.reward,0);
  assert.equal(retry.save,won.save);
  assert.equal(completeRound(won.save,'pop',5,45,'round-2').isBest,false);
});

test('daily goal needs forty actions and a valid round and pays once', async () => {
  const { DEFAULT_SAVE, recordAction, completeRound, claimDaily } = await import('../src/economy.ts');
  let save=structuredClone(DEFAULT_SAVE);
  for(let i=0;i<40;i++) save=recordAction(save,'pop',1);
  assert.equal(claimDaily(save),save);
  save=completeRound(save,'pop',40,45,'daily-round').save;
  const claimed=claimDaily(save);
  assert.equal(claimed.gems,save.gems+30);
  assert.equal(claimDaily(claimed),claimed);
});

test('v1 migration retains progress and adds all new default equipment', async () => {
  const { loadSave, persistSave } = await import('../src/economy.ts');
  const data=new Map([['uff-save-v1',JSON.stringify({gems:400,xp:120,interactions:44,owned:['midnight','glacier'],theme:'glacier',muted:true,haptics:false,best:{pop:18},claimed:['first']})]]);
  const storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v)}};
  const save=loadSave(storage);
  assert.equal(save.theme,'glacier');
  assert.equal(save.settings.muted,true);
  assert.equal(save.settings.haptics,false);
  assert.equal(save.best.pop,18);
  assert.ok(save.owned.includes('soft'));
  assert.equal(persistSave(save,storage),true);
  assert.ok(data.has('uff-save-v2'));
});

test('malformed saves and blocked storage never break consumers', async () => {
  const { loadSave, persistSave, DEFAULT_SAVE } = await import('../src/economy.ts');
  const blocked={getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('blocked')}};
  assert.equal(loadSave(blocked).gems,90);
  assert.equal(persistSave(DEFAULT_SAVE,blocked),false);
  const malformed={gems:-9,xp:'infinity',interactions:null,owned:['nope','midnight','midnight'],theme:'glacier',settings:{sfxVolume:800,intensity:-100,station:'unknown'},best:{pop:-2,spinner:'5'},daily:{date:'not a date',actions:900,rounds:-1},completedRounds:[5,'okay']};
  const safe=loadSave({getItem:()=>JSON.stringify(malformed),setItem:()=>{}});
  assert.equal(safe.gems,0);
  assert.equal(safe.xp,0);
  assert.equal(safe.theme,'midnight');
  assert.equal(safe.settings.sfxVolume,1);
  assert.equal(safe.settings.intensity,0);
  assert.equal(safe.settings.station,'poptron');
  assert.equal(safe.daily.actions,0);
  assert.equal(safe.best.pop,0);
  assert.equal(safe.best.spinner,0);
  assert.deepEqual(safe.completedRounds,['okay']);
});
