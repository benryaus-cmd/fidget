export interface MelodyNote {key:number;beats:number}
export interface Melody {id:string;title:string;composer:string;provenance:string;source:string;notes:readonly MelodyNote[];phrases:readonly (readonly MelodyNote[])[]}
const LETTERS='CDEFGAB';
/** Independently transcribed, single-line C-major melody excerpts. No recording or modern arrangement is copied. */
function transcribe(id:string,title:string,composer:string,source:string,line:string):Melody{
 const notes=line.trim().split(/\s+/).map(token=>({key:LETTERS.indexOf(token[0]),beats:Number(token.slice(1)||1)}));
 const phrases=Array.from({length:Math.ceil(notes.length/4)},(_,i)=>notes.slice(i*4,i*4+4));
 return {id,title,composer,source,provenance:'Public-domain composition / traditional tune. Original simplified single-line transcription in C major; no third-party recording or arrangement.',notes,phrases};
}
export const MELODIES: readonly Melody[] = [
 transcribe('joy','Ode to Joy','Ludwig van Beethoven · 1824','https://imslp.org/wiki/Symphony_No.9,_Op.125_(Beethoven,_Ludwig_van)',
  'E E F G G F E D C C D E E1.5 D0.5 D2 E E F G G F E D C C D E D1.5 C0.5 C2'),
 transcribe('saints','When the Saints Go Marching In','Traditional American hymn','https://www.loc.gov/item/afc9999005.3748/',
  'C E F G3 C E F G3 C E F G2 E2 C2 E D3 E E D C2 C2 E2 G G G F2 F2 E F G2 E2 C D C3'),
 transcribe('twinkle','Twinkle, Twinkle, Little Star','Traditional French tune · Ah! vous dirai-je, maman','https://imslp.org/wiki/12_Variations_on_%27Ah,_vous_dirai-je_maman%27,_K.265/300e_(Mozart,_Wolfgang_Amadeus)',
  'C C G G A A G2 F F E E D D C2 G G F F E E D2 G G F F E E D2 C C G G A A G2 F F E E D D C2'),
];
export function phraseNotes(song:Pick<Melody,'phrases'>,index:number):readonly MelodyNote[]{return song.phrases[index]??[];}
export function advanceMelody(song:Pick<Melody,'phrases'>,phrase:number,step:number,key:number){
 const notes=phraseNotes(song,phrase);
 if(notes[step]?.key!==key)return {phrase,step:0,correct:false,phraseComplete:false,songComplete:false};
 const phraseComplete=step===notes.length-1,songComplete=phraseComplete&&phrase===song.phrases.length-1;
 return {phrase:phraseComplete?(songComplete?0:phrase+1):phrase,step:phraseComplete?0:step+1,correct:true,phraseComplete,songComplete};
}
