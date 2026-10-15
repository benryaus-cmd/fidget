/** Optional cozy care. Pet state never changes arcade scores or XP. */
export type PetState={
  name:string;customName?:boolean;customColor?:boolean;owned:string[];color:string;ears:string;face:string;hat:string;
  treats:number;feeds:number;lastFedAt:number;
};
export type PetItem={
  id:string;name:string;cost:number;category:'color'|'ears'|'face'|'hat';
  color?:string;accent?:string;secondary?:string;
};
export const PET_ITEMS:PetItem[]=[
  {id:'color-cream',name:'Vanilla',cost:0,category:'color',color:'#fff0cf',accent:'#70d9cf',secondary:'#b5a0e8'},
  {id:'color-lavender',name:'Lavender Cloud',cost:25,category:'color',color:'#d9c8ff',accent:'#8de0db',secondary:'#f8c1df'},
  {id:'color-mint',name:'Mint Mochi',cost:0,category:'color',color:'#bcecd7',accent:'#a594e9',secondary:'#ffe1ac'},
  {id:'color-peach',name:'Peach Puff',cost:25,category:'color',color:'#ffd2b8',accent:'#83d8d0',secondary:'#c8b0ef'},
  {id:'color-gold',name:'Golden Honey',cost:80,category:'color',color:'#f7cb57',accent:'#ffefd1',secondary:'#b77a35'},
  {id:'color-silver',name:'Moon Silver',cost:65,category:'color',color:'#cad8ee',accent:'#f4f9ff',secondary:'#687caa'},
  {id:'color-rose',name:'Rose Quartz',cost:30,category:'color',color:'#f9afce',accent:'#ffdfb8',secondary:'#a46cb7'},
  {id:'color-sky',name:'Cloud Blue',cost:30,category:'color',color:'#abdfff',accent:'#d8c6ff',secondary:'#5b88bf'},
  {id:'color-coral',name:'Coral Crush',cost:35,category:'color',color:'#ff9b93',accent:'#ffe2ac',secondary:'#b34d73'},
  {id:'color-ocean',name:'Ocean Teal',cost:40,category:'color',color:'#56cbbb',accent:'#c0f6f1',secondary:'#38667b'},
  {id:'color-ink',name:'Midnight Ink',cost:50,category:'color',color:'#7773aa',accent:'#e2b4ff',secondary:'#42415f'},
  {id:'color-cherry',name:'Cherry Soda',cost:40,category:'color',color:'#e96b87',accent:'#ffd5df',secondary:'#7c416d'},
  {id:'ears-original',name:'Classic Ears',cost:0,category:'ears'},
  {id:'ears-bunny',name:'Bunny Ears',cost:30,category:'ears'},
  {id:'ears-round',name:'Round Ears',cost:20,category:'ears'},
  {id:'ears-floppy',name:'Floppy Ears',cost:30,category:'ears'},
  {id:'face-classic',name:'Classic Smile',cost:0,category:'face'},
  {id:'face-sparkly',name:'Sparkly Eyes',cost:25,category:'face'},
  {id:'face-sleepy',name:'Sleepy Smile',cost:20,category:'face'},
  {id:'face-heart',name:'Heart Eyes',cost:35,category:'face'},
  {id:'face-wink',name:'Little Wink',cost:25,category:'face'},
  {id:'face-star',name:'Starry Eyes',cost:35,category:'face'},
  {id:'face-cool',name:'Too Cool',cost:40,category:'face'},
  {id:'face-cheeky',name:'Cheeky Grin',cost:30,category:'face'},
  {id:'face-happy',name:'Happy Crescent',cost:25,category:'face'},
  {id:'hat-none',name:'No Hat',cost:0,category:'hat'},
  {id:'hat-beanie',name:'Cozy Beanie',cost:35,category:'hat'},
  {id:'hat-crown',name:'Tiny Crown',cost:60,category:'hat'},
  {id:'hat-star',name:'Lucky Star',cost:40,category:'hat'},
  {id:'hat-cap',name:'Skater Cap',cost:40,category:'hat'},
  {id:'hat-wizard',name:'Moon Wizard',cost:65,category:'hat'},
  {id:'hat-flower',name:'Daisy Days',cost:30,category:'hat'},
  {id:'hat-headphones',name:'Little DJ',cost:55,category:'hat'},
  {id:'hat-party',name:'Party Time',cost:45,category:'hat'},
  {id:'hat-bow',name:'Bubblegum Bow',cost:35,category:'hat'},
];
export const TREAT_PACK_COST=15;
export const TREAT_PACK_SIZE=5;
export const MAX_TREATS=50;
export const FEED_COOLDOWN_MS=3000;
const MAX_COUNT=1_000_000_000;
export function createPet():PetState {
  return {name:'Pip',customName:false,customColor:false,owned:['color-mint','color-cream','ears-original','face-classic','hat-none'],color:'color-mint',ears:'ears-original',face:'face-classic',hat:'hat-none',treats:5,feeds:0,lastFedAt:0};
}
const bounded=(value:unknown,fallback:number,max:number)=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):fallback;
const cleanName=(value:unknown)=>typeof value==='string'?Array.from(value.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g,'').trim()).slice(0,16).join(''):'';
export function normalizePet(value:unknown):PetState {
  const base=createPet();
  if(!value||typeof value!=='object'||Array.isArray(value))return base;
  const p=value as Record<string,unknown>;
  const owned=[...new Set([...base.owned,...(Array.isArray(p.owned)?p.owned.filter((id):id is string=>typeof id==='string'&&PET_ITEMS.some(i=>i.id===id)):[])])];
  const equipped=(category:PetItem['category'])=>typeof p[category]==='string'&&owned.includes(p[category])&&PET_ITEMS.some(i=>i.id===p[category]&&i.category===category)?p[category] as string:base[category];
  const customColor=p.customColor===true||Array.isArray(p.owned)&&p.owned.some(id=>typeof id==='string'&&id.startsWith('color-')&&id!=='color-cream'&&id!=='color-mint');
  const color=equipped('color');
  const cleaned=cleanName(p.name),customName=p.customName===true||!!cleaned&&!['Milo','Mile','Pip'].includes(cleaned);
  return {name:customName?cleaned||base.name:base.name,customName,customColor,owned,color:!customColor&&color==='color-cream'?base.color:color,ears:equipped('ears'),face:equipped('face'),hat:equipped('hat'),treats:bounded(p.treats,5,MAX_TREATS),feeds:bounded(p.feeds,0,MAX_COUNT),lastFedAt:bounded(p.lastFedAt,0,Number.MAX_SAFE_INTEGER)};
}
export type PetStatus={hunger:number;label:string;canFeed:boolean;cozy:boolean};
export function petStatus(pet:PetState,now=Date.now()):PetStatus {
  const valid=Number.isFinite(now)&&now>=0;
  const elapsed=valid?Math.max(0,now-pet.lastFedAt):0;
  const hunger=pet.feeds===0?35:Math.min(100,elapsed/(6*60*60*1000)*100);
  return {hunger,label:hunger<25?'Cozy & content':hunger<70?'A little snack?':'Snack time, whenever',canFeed:valid&&pet.treats>0&&(pet.feeds===0||elapsed>=FEED_COOLDOWN_MS),cozy:hunger<25};
}
export function equipPetItem(pet:PetState,id:string):PetState {
  const item=PET_ITEMS.find(i=>i.id===id);
  if(!item||!pet.owned.includes(id)||pet[item.category]===id)return pet;
  return {...pet,[item.category]:id,...(item.category==='color'?{customColor:true}:{})};
}
type PetWallet={gems:number;pet:PetState};
export function buyPetItem<T extends PetWallet>(save:T,id:string):T {
  const item=PET_ITEMS.find(i=>i.id===id);
  if(!item)return save;
  if(save.pet.owned.includes(id)){
    const pet=equipPetItem(save.pet,id);return pet===save.pet?save:{...save,pet};
  }
  if(!Number.isFinite(save.gems)||save.gems<item.cost)return save;
  const pet=equipPetItem({...save.pet,owned:[...save.pet.owned,id]},id);
  return {...save,gems:save.gems-item.cost,pet};
}
export function buyTreats<T extends PetWallet>(save:T):T {
  if(!Number.isFinite(save.gems)||save.gems<TREAT_PACK_COST||!Number.isFinite(save.pet.treats)||save.pet.treats<0||save.pet.treats>MAX_TREATS-TREAT_PACK_SIZE)return save;
  return {...save,gems:save.gems-TREAT_PACK_COST,pet:{...save.pet,treats:save.pet.treats+TREAT_PACK_SIZE}};
}
export function feedPet(pet:PetState,now=Date.now()):PetState {
  if(!petStatus(pet,now).canFeed)return pet;
  return {...pet,treats:pet.treats-1,feeds:Math.min(MAX_COUNT,pet.feeds+1),lastFedAt:Math.floor(now)};
}
export function renamePet(pet:PetState,name:string):PetState {
  const next=cleanName(name);
  return !next?pet:next===pet.name&&pet.customName?pet:{...pet,name:next,customName:true};
}
