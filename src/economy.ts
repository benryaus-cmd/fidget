import {createPet,normalizePet} from './pet/state.ts';
import type {PetState} from './pet/state.ts';
/** Pure, versioned progression. Screen opens and idle time never award currency. */
export type Save = {
  pet:PetState;
  gems:number; xp:number; interactions:number; best:Record<string,number>;
  owned:string[]; claimed:string[]; theme:string; material:string; trail:string;
  mastery:Record<string,number>; rounds:Record<string,number>; milestones:Record<string,number>;
  settings:{muted:boolean;sfxVolume:number;haptics:boolean;hapticStrength:number;reducedMotion:boolean;intensity:number;radioVolume:number;station:string};
  daily:{date:string;actions:number;rounds:number;claimed:boolean}; completedRounds:string[];
};
type Item = {id:string;name:string;cost:number;category:'theme'|'material'|'trail'|'station';color?:string;secondary?:string;description:string};
export const ITEMS:Item[] = [
  {id:'midnight',name:'Midnight Neon',cost:0,category:'theme',color:'#0a0b1d',secondary:'#7762ff',description:'A luminous midnight studio.'},
  {id:'electric',name:'Electric Sunset',cost:180,category:'theme',color:'#251129',secondary:'#ed4c9c',description:'Hot pink meets the violet hour.'},
  {id:'glacier',name:'Glacier Glass',cost:300,category:'theme',color:'#062b3d',secondary:'#00c9e4',description:'Cool cyan reflections on deep blue.'},
  {id:'gold',name:'Golden Hour',cost:450,category:'theme',color:'#35200b',secondary:'#e7a73d',description:'Warm amber studio light.'},
  {id:'forest',name:'Deep Jungle',cost:650,category:'theme',color:'#082a23',secondary:'#2ed49e',description:'Emerald light and lush shadows.'},
  {id:'soft',name:'Soft Silicone',cost:0,category:'material',description:'Soft, springy and satisfyingly tactile.'},
  {id:'chrome',name:'Liquid Chrome',cost:140,category:'material',description:'Glossy silver and bright specular highlights.'},
  {id:'glass',name:'Crystal Glass',cost:220,category:'material',description:'Translucent frosted surfaces and luminous edges.'},
  {id:'sparkle',name:'Stardust',cost:0,category:'trail',description:'Tiny sparkles follow each satisfying touch.'},
  {id:'neon',name:'Neon Sparks',cost:120,category:'trail',description:'Electric streaks celebrate your moves.'},
  {id:'confetti',name:'Party Confetti',cost:200,category:'trail',description:'A small celebration on every hit.'},
  {id:'poptron',name:'PopTron',cost:0,category:'station',description:'Bright electronic indie pop.'},
  {id:'vaporwaves',name:'Vaporwaves',cost:80,category:'station',description:'Dreamy retro electronic soundscapes.'},
  {id:'indiepop',name:'Indie Pop Rocks!',cost:80,category:'station',description:'Fresh indie melodies for your studio.'},
  {id:'groovesalad',name:'Groove Salad',cost:100,category:'station',description:'Smooth downtempo grooves.'},
  {id:'beatblender',name:'Beat Blender',cost:120,category:'station',description:'A laid-back blend of deep beats.'},
];
const today=()=>new Date().toISOString().slice(0,10);
export const DEFAULT_SAVE:Save={pet:createPet(),gems:90,xp:0,interactions:0,best:{},owned:['midnight','soft','sparkle','poptron'],claimed:[],theme:'midnight',material:'soft',trail:'sparkle',mastery:{},rounds:{},milestones:{},settings:{muted:false,sfxVolume:.65,haptics:true,hapticStrength:.6,reducedMotion:false,intensity:.75,radioVolume:.03,station:'poptron'},daily:{date:today(),actions:0,rounds:0,claimed:false},completedRounds:[]};
export const MASTERY_THRESHOLDS=[25,100,250,500] as const;
const MAX=1_000_000_000;
const MILESTONES=new Set(['pop-board-clear','piano-song-complete','piano-perfect-song']);
const TOYS=new Set(['pop','spinner','switch','piano','sliders','dial','marble','magnet']);
const number=(value:unknown,fallback=0,max=MAX)=>typeof value==='number'&&Number.isFinite(value)?Math.min(max,Math.max(0,Math.floor(value))):fallback;
const unit=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?Math.min(1,Math.max(0,value)):fallback;
const object=(value:unknown):Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
const bool=(value:unknown,fallback:boolean)=>typeof value==='boolean'?value:fallback;
const strings=(value:unknown)=>Array.isArray(value)?[...new Set(value.filter((v):v is string=>typeof v==='string'&&v.length>0&&v.length<=128))]:[];
const counts=(value:unknown)=>Object.fromEntries(Object.entries(object(value)).filter(([key])=>TOYS.has(key)).map(([key,v])=>[key,number(v)]));
const fresh=():Save=>({...DEFAULT_SAVE,pet:createPet(),best:{},mastery:{},rounds:{},milestones:{},owned:[...DEFAULT_SAVE.owned],claimed:[],settings:{...DEFAULT_SAVE.settings},daily:{date:today(),actions:0,rounds:0,claimed:false},completedRounds:[]});
const rollDaily=(save:Save):Save=>save.daily.date===today()?save:{...save,daily:{date:today(),actions:0,rounds:0,claimed:false}};
function normalize(value:unknown):Save {
  const p=object(value),s=object(p.settings),d=object(p.daily),base=fresh();
  const owned=[...new Set([...base.owned,...strings(p.owned).filter(id=>ITEMS.some(item=>item.id===id))])];
  const equipped=(id:unknown,category:Item['category'],fallback:string)=>typeof id==='string'&&owned.includes(id)&&ITEMS.some(i=>i.id===id&&i.category===category)?id:fallback;
  return {...base,pet:normalizePet(p.pet),gems:number(p.gems,90),xp:number(p.xp),interactions:number(p.interactions),best:counts(p.best),mastery:counts(p.mastery),rounds:counts(p.rounds),milestones:Object.fromEntries(Object.entries(object(p.milestones)).filter(([key])=>MILESTONES.has(key)).map(([key,v])=>[key,number(v)])),owned,claimed:strings(p.claimed).filter(id=>AWARDS.some(a=>a.id===id)),theme:equipped(p.theme,'theme','midnight'),material:equipped(p.material,'material','soft'),trail:equipped(p.trail,'trail','sparkle'),settings:{muted:bool(s.muted, bool(p.muted,false)),haptics:bool(s.haptics,bool(p.haptics,true)),sfxVolume:unit(s.sfxVolume,.65),hapticStrength:unit(s.hapticStrength,.6),reducedMotion:bool(s.reducedMotion,false),intensity:unit(s.intensity,.75),radioVolume:unit(s.radioVolume,.03),station:equipped(s.station,'station','poptron')},daily:d.date===today()?{date:today(),actions:number(d.actions),rounds:number(d.rounds),claimed:bool(d.claimed,false)}:base.daily,completedRounds:strings(p.completedRounds).slice(0,100000)};
}
export type SaveStorage = {getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
const browserStorage=():SaveStorage|undefined=>{try{return globalThis.localStorage}catch{return undefined}};
export function loadSave(storage?:SaveStorage):Save {
  try {const store=storage??browserStorage(); if(!store)return fresh();
    const current=store.getItem('uff-save-v2');
    if(current){try{return normalize(JSON.parse(current))}catch{/* Try the old save when current JSON is damaged. */}}
    const old=store.getItem('uff-save-v1');return old?normalize(JSON.parse(old)):fresh();
  }catch{return fresh()}
}
export function persistSave(save:Save,storage?:SaveStorage):boolean {
  try{const store=storage??browserStorage();if(!store)return false;store.setItem('uff-save-v2',JSON.stringify(normalize(save)));return true}catch{return false}
}
export function purchase(save:Save,id:string):Save {
  const item=ITEMS.find(i=>i.id===id);
  if(!item||save.owned.includes(id)||save.gems<item.cost)return save;
  return {...save,gems:save.gems-item.cost,owned:[...save.owned,id]};
}
export function equip(save:Save,id:string):Save {
  const item=ITEMS.find(i=>i.id===id);if(!item||!save.owned.includes(id))return save;
  if(item.category==='station')return save.settings.station===id?save:{...save,settings:{...save.settings,station:id}};
  return save[item.category]===id?save:{...save,[item.category]:id};
}
export type Award={id:string;name:string;icon:string;desc:string;prize:number;progress:(save:Save)=>number;target:number};
export const AWARDS:Award[]=[
  {id:'first',name:'FIRST TOUCH',icon:'👆',desc:'Make your first meaningful move',prize:20,progress:s=>s.interactions,target:1},
  {id:'fifty',name:'FINGER WIZARD',icon:'⚡',desc:'Make 50 meaningful moves',prize:60,progress:s=>s.interactions,target:50},
  {id:'hundred',name:"CAN’T STOP",icon:'🔥',desc:'Make 150 meaningful moves',prize:150,progress:s=>s.interactions,target:150},
  {id:'collector',name:'COLLECTOR',icon:'💎',desc:'Own 3 different studio themes',prize:100,progress:s=>s.owned.filter(id=>ITEMS.some(i=>i.id===id&&i.category==='theme')).length,target:3},
  {id:'arcade',name:'SCORE CHASER',icon:'🏆',desc:'Score 35 in a completed challenge',prize:100,progress:s=>Math.max(0,...Object.values(s.best)),target:35},
  {id:'explorer',name:'STUDIO EXPLORER',icon:'🧭',desc:'Make 25 moves with six different toys',prize:80,progress:s=>Object.values(s.mastery).filter(v=>v>=MASTERY_THRESHOLDS[0]).length,target:6},
  {id:'master',name:'TACTILE MASTER',icon:'✦',desc:'Make 500 moves with one toy',prize:120,progress:s=>Math.max(0,...Object.values(s.mastery)),target:MASTERY_THRESHOLDS[3]},
  ...[400,1000,2500,5000].map((target,index):Award=>({id:`moves-${target}`,name:['FIDGET FLOW','THOUSAND TOUCHES','DEEP IN THE GROOVE','FINGER LEGEND'][index],icon:'⚡',desc:`Make ${target.toLocaleString('en-US')} meaningful moves`,prize:[40,60,90,120][index],progress:s=>s.interactions,target})),
  ...[1,5,10,25,50,100].map((target,index):Award=>({id:`rounds-${target}`,name:['FIRST FINISH','FIVE FOR FUN','ROUND REGULAR','CHALLENGE CLUB','ARCADE VETERAN','CENTURY OF CHALLENGES'][index],icon:'🏁',desc:`Finish ${target} scored challenge${target===1?'':'s'}`,prize:[15,25,35,50,65,100][index],progress:s=>s.completedRounds.length,target})),
  ...[
    {id:'pop',name:'POP',icon:'🫧'},{id:'spinner',name:'SPIN',icon:'🌀'},
    {id:'switch',name:'SWITCH',icon:'🎚️'},{id:'piano',name:'PIANO',icon:'🎹'},
    {id:'sliders',name:'SLIDER',icon:'🎛️'},{id:'dial',name:'DIAL',icon:'⚙️'},
    {id:'marble',name:'MARBLE',icon:'🔮'},{id:'magnet',name:'MAGNET',icon:'🧲'},
  ].flatMap(toy=>[25,100,250].map((target,index):Award=>({id:`${toy.id}-moves-${target}`,name:`${toy.name} ${['EXPLORER','SPECIALIST','EXPERT'][index]}`,icon:toy.icon,desc:`Make ${target} meaningful moves with ${toy.name.toLowerCase()}`,prize:[15,30,50][index],progress:s=>s.mastery[toy.id]??0,target}))),
  ...[1,5,15].map((target,index):Award=>({id:`pop-clear-${target}`,name:['CLEAN SLATE','BUBBLE SWEEP','POP PERFECTION'][index],icon:'🫧',desc:`Clear ${target} complete Pop board${target===1?'':'s'}`,prize:[20,35,60][index],progress:s=>s.milestones?.['pop-board-clear']??0,target})),
  ...[1,3,10].map((target,index):Award=>({id:`piano-song-${target}`,name:['FIRST ENCORE','MELODY MAKER','SONGBOOK STAR'][index],icon:'🎵',desc:`Complete ${target} guided piano song${target===1?'':'s'}`,prize:[20,35,60][index],progress:s=>s.milestones?.['piano-song-complete']??0,target})),
  {id:'piano-perfect-1',name:'PERFECT PERFORMANCE',icon:'🎼',desc:'Complete a guided piano song without a wrong note',prize:45,progress:s=>s.milestones?.['piano-perfect-song']??0,target:1},
  ...['pop','spinner','piano','sliders','marble','magnet'].map((toy):Award=>({id:`${toy}-rounds-5`,name:`${toy.toUpperCase()} CHALLENGER`,icon:'🏆',desc:`Finish 5 scored ${toy} challenges`,prize:40,progress:s=>s.rounds?.[toy]??0,target:5})),
];
/** Every earned, unclaimed award; suitable for badges and a claim-all count. */
export function claimableAwards(save:Save):Award[] {
  return AWARDS.filter(award=>!save.claimed.includes(award.id)&&award.progress(save)>=award.target);
}
/** Exactly five available slots until fewer than five awards remain. */
export function availableAwards(save:Save):Award[] {
  return AWARDS.filter(award=>!save.claimed.includes(award.id)).sort((a,b)=>{
    const ap=a.progress(save),bp=b.progress(save),ar=ap>=a.target,br=bp>=b.target;
    if(ar!==br)return ar?-1:1;
    return ar?0:(bp/b.target-ap/a.target);
  }).slice(0,5);
}
/** Threshold crossings only: repeated renders and claims do not replay popups. */
export function newlyClaimableAwards(before:Save,after:Save):Award[] {
  return claimableAwards(after).filter(award=>!before.claimed.includes(award.id)&&award.progress(before)<award.target);
}
/** Completion events are reported by gameplay; they never mint XP or Gems. */
export function recordMilestone(save:Save,kind:string):Save {
  if(!MILESTONES.has(kind))return save;
  return {...save,milestones:{...save.milestones,[kind]:Math.min(MAX,(save.milestones?.[kind]??0)+1)}};
}
export function claimAward(save:Save,id:string):Save {
  const award=AWARDS.find(a=>a.id===id);if(!award||save.claimed.includes(id)||award.progress(save)<award.target)return save;
  return {...save,gems:Math.min(MAX,save.gems+award.prize),claimed:[...save.claimed,id]};
}
export function recordAction(save:Save,toy:string,points:number):Save {
  if(!TOYS.has(toy)||!Number.isFinite(points)||points<=0)return save;
  const s=rollDaily(save),actions=Math.min(MAX,s.daily.actions+1);
  const reward=actions<=100&&actions%5===0?1:0;
  return {...s,gems:Math.min(MAX,s.gems+reward),xp:Math.min(MAX,s.xp+Math.max(1,number(points,0,10))),interactions:Math.min(MAX,s.interactions+1),mastery:{...s.mastery,[toy]:Math.min(MAX,(s.mastery[toy]??0)+1)},daily:{...s.daily,actions}};
}
export function completeRound(save:Save,toy:string,score:number,elapsedSeconds:number,roundId:string):{save:Save;reward:number;isBest:boolean} {
  const invalid=()=>({save,reward:0,isBest:false});
  if(!TOYS.has(toy)||!Number.isFinite(score)||score<1||!Number.isFinite(elapsedSeconds)||elapsedSeconds<10||typeof roundId!=='string'||!roundId.trim()||roundId.length>128||save.completedRounds.includes(roundId)||save.completedRounds.length>=100000)return invalid();
  const s=rollDaily(save),points=number(score),isBest=points>(s.best[toy]??0),reward=Math.min(65,Math.max(1,Math.floor(points/5))+(isBest?15:0));
  return {save:{...s,rounds:{...s.rounds,[toy]:Math.min(MAX,(s.rounds?.[toy]??0)+1)},gems:Math.min(MAX,s.gems+reward),xp:Math.min(MAX,s.xp+Math.min(100,points)),best:{...s.best,[toy]:Math.max(points,s.best[toy]??0)},daily:{...s.daily,rounds:Math.min(MAX,s.daily.rounds+1)},completedRounds:[...s.completedRounds,roundId]},reward,isBest};
}
export function claimDaily(save:Save):Save {
  const s=rollDaily(save);if(s.daily.claimed||s.daily.actions<40||s.daily.rounds<1)return s;
  return {...s,gems:Math.min(MAX,s.gems+30),daily:{...s.daily,claimed:true}};
}
