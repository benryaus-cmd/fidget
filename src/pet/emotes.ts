export const TAP_EMOTES=['wave','bounce','spin','dance','heart','peek','snooze','confetti'] as const;
export type PetEmote=typeof TAP_EMOTES[number]|'idle'|'cheer'|'encourage'|'listen';
export type PetEvent={id:number;kind:string};
export const EMOTE_LABELS:Record<PetEmote,string>={idle:'Keeping you company',wave:'Hey, you!',bounce:'Boing!',spin:'Wheee!',dance:'Tiny dance break',heart:'You made my day',peek:'Peekaboo!',snooze:'Just resting my eyes',confetti:'Little celebration!',cheer:'You got this!',encourage:'One more try?',listen:'Listening along'};
export function chooseTapEmote(previous:string,random:()=>number=Math.random):PetEmote{const pool=TAP_EMOTES.filter(e=>e!==previous),n=random();return pool[Math.min(pool.length-1,Math.floor(Math.max(0,Number.isFinite(n)?n:0)*pool.length))];}
export function emoteForEvent(kind:string):PetEmote{
 if(['board-clear','best','award','perfect-song'].includes(kind))return 'confetti';
 if(kind==='song-complete')return 'dance';if(kind==='miss')return 'encourage';if(kind==='combo')return 'cheer';if(kind==='start')return 'wave';if(kind==='finish')return 'heart';if(kind==='piano')return 'listen';return 'bounce';
}
