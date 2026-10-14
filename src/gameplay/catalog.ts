export type ToyId = 'pop'|'spinner'|'switch'|'piano'|'sliders'|'dial'|'marble'|'magnet';
export const TOYS: {id:ToyId;name:string;tag:string;accent:string;instruction:string;challenge:string}[] = [
 {id:'pop',name:'Pop Frenzy',tag:'SILICONE SATISFACTION',accent:'#fa6cad',instruction:'Tap or sweep the bubbles. Clear the board and it automatically flips to a fresh side.',challenge:'Pop the glowing bubble. Clear all 25 for a celebration and automatic fresh side.'},
 {id:'spinner',name:'Spin Lab',tag:'PRECISION BEARINGS',accent:'#9c89ff',instruction:'Drag around a lobe, then release. A full revolution earns points.',challenge:'Flick full circles. Each flick scores up to 8 revolutions; flick again to keep scoring.'},
 {id:'switch',name:'Switch Circuit',tag:'CLICK INTO PLACE',accent:'#62ebc0',instruction:'Flip each chunky rocker and light up your circuit.',challenge:'Match all four switches to the illuminated target pattern.'},
 {id:'piano',name:'Piano Rush',tag:'PLAY YOUR COLORS',accent:'#7ab6ff',instruction:'Tap the keys, or use A S D F G H J. Try a chord with two fingers.',challenge:'Play a familiar classic four notes at a time. Listen first, follow the glowing notes, and finish the song.'},
 {id:'sliders',name:'Slider Sync',tag:'FIND THE SWEET SPOT',accent:'#ffbd66',instruction:'Slide each fader and release inside its glowing target band.',challenge:'Align all three faders. Release within the target band to lock each one.'},
 {id:'dial',name:'Detent Dial',tag:'A PERFECT LITTLE CLICK',accent:'#e9ed88',instruction:'Drag around the outer rim. Release to snap to one of twelve detents.',challenge:'Turn the rim until the needle reaches the glowing number, then release.'},
 {id:'marble',name:'Marble Drop',tag:'CONTROLLED CHAOS',accent:'#78e5fa',instruction:'Drag the launcher across the top and release to drop a marble.',challenge:'Aim for the glowing cup. Bouncing marbles score once when they land.'},
 {id:'magnet',name:'Magnet Field',tag:'PULL SOME MAGIC',accent:'#ff8d7f',instruction:'Hold and drag the magnet to collect every crystal. Release to recharge.',challenge:'Sweep the board to collect 8 crystals, then release for a new wave.'},
];
export const POP_CLEAR_DELAY_MS=750;
export function createBoardClearTimer<T>(schedule:(callback:()=>void,delay:number)=>T,cancel:(token:T)=>void){
 let token:T|undefined,disposed=false,generation=0;
 return {
  arm(callback:()=>void){if(disposed||token!==undefined)return false;const current=++generation;token=schedule(()=>{if(disposed||generation!==current)return;token=undefined;generation++;callback();},POP_CLEAR_DELAY_MS);return true;},
  dispose(){disposed=true;generation++;if(token!==undefined)cancel(token);token=undefined;},
 };
}
