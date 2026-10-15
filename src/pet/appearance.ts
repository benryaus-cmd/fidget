import {PET_ITEMS} from './state.ts';
function tint(hex:string,amount:number){const n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v+(amount>=0?255-v:v)*amount).toString(16).padStart(2,'0')).join('');}
export function paletteFor(id:string){const item=PET_ITEMS.find(i=>i.category==='color'&&i.id===id)??PET_ITEMS[0];const body=item.color!,ear=item.accent!,feet=item.secondary!;return {body,shade:tint(body,-.17),light:tint(body,.65),ears:ear,earHi:tint(ear,.55),feet,feetHi:tint(feet,.45),metallic:id==='color-gold'||id==='color-silver'};}
/** Ear positions relative to the top of the head. Floppy lobes mirror OUTWARD. */
export function earPlacement(id:string,side:number,frontOffset:number,drop:number,wiggle:number){
 return id==='ears-floppy'?{x:side*14+frontOffset*.2,y:6,angle:side*.08+wiggle*.5,mirror:side}:{x:side*7.1+frontOffset*.4,y:3.6,angle:side*(.46+drop*.85)+wiggle*(side>0?1.1:.9),mirror:1};
}

/** Pip has a rounder bean silhouette than the original tall pear-shaped Milo. */
export const bodyDimensions=(sx:number,sy:number)=>({h:35.5*sy,w:19.2*sx,wb:16.6*sx});
