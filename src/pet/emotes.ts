export const TAP_EMOTES=['wave','bounce','spin','dance','heart','peek','snooze','confetti'] as const;
export type PetEmote=typeof TAP_EMOTES[number]|'idle'|'cheer'|'encourage'|'listen'|'catch'|'splat'|'bow'|'float'|'dizzy'|'focus';
export type PetEvent={id:number;kind:string};
export const EMOTE_LABELS:Record<PetEmote,string>={idle:'Keeping you company',wave:'Hey, you!',bounce:'Boing!',spin:'Wheee!',dance:'Tiny dance break',heart:'You made my day',peek:'Peekaboo!',snooze:'Just resting my eyes',confetti:'Little celebration!',cheer:'You got this!',encourage:'One more try?',listen:'Listening along',catch:'Got it! Almost.',splat:'A very big squish',bow:'Perfectly in tune',float:'Crystal cloud nine',dizzy:'Whoa. Nice brakes.',focus:'Ready. Steady. Spin.'};
export function chooseTapEmote(previous:string,random:()=>number=Math.random):PetEmote{const pool=TAP_EMOTES.filter(e=>e!==previous),n=random();return pool[Math.min(pool.length-1,Math.floor(Math.max(0,Number.isFinite(n)?n:0)*pool.length))];}
export function emoteForEvent(kind:string):PetEmote{
 const moments:Record<string,PetEmote>={'welcome-merge':'catch','welcome-burst':'splat','slider-sync':'bow','magnet-wave':'float','spin-brake':'dizzy','spin-start':'focus','domino-chain':'catch','domino-clear':'confetti','brake-perfect':'bow','brake-near':'encourage','brake-miss':'encourage','orbit-release':'float','orbit-clear':'confetti'};if(moments[kind])return moments[kind];
 if(['board-clear','best','award','perfect-song'].includes(kind))return 'confetti';
 if(kind==='song-complete')return 'dance';if(kind==='miss')return 'encourage';if(kind==='combo')return 'cheer';if(kind==='start')return 'wave';if(kind==='finish')return 'heart';if(kind==='piano')return 'listen';return 'bounce';
}

export function reactionPriority(kind:string):number{
 if(['best','award','perfect-song','welcome-burst','domino-clear','orbit-clear'].includes(kind))return 4;
 if(['board-clear','magnet-wave','slider-sync','song-complete','brake-perfect','orbit-release','domino-chain'].includes(kind))return 3;
 if(['combo','welcome-merge','spin-brake'].includes(kind))return 2;
 return 1;
}
