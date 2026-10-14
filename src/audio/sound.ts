import { vibrate } from '@aippy/runtime/device';
import { requestMixableAudio } from './audioPolicy.js';
type SoundSettings={muted:boolean;sfxVolume:number;haptics:boolean;hapticStrength:number};
let settings:SoundSettings={muted:false,sfxVolume:.65,haptics:true,hapticStrength:.6};
let context:AudioContext|null=null;
let master:GainNode|null=null;
const voices=new Set<OscillatorNode>();
const gates=new Map<string,number>();
const clamp=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
export function setSoundSettings(next:SoundSettings):void {
  settings={muted:!!next.muted,sfxVolume:clamp(next.sfxVolume),haptics:!!next.haptics,hapticStrength:clamp(next.hapticStrength)};
  if(settings.muted||settings.sfxVolume===0){
    // Release our own output instead of keeping a silent context active.
    const previous=context;context=null;master=null;voices.clear();
    if(previous)void previous.close().catch(()=>{});
  }else if(context&&master)master.gain.setTargetAtTime(settings.sfxVolume*.22,context.currentTime,.015);
}
/** Call inside pointer/key handlers. Unsupported audio leaves gameplay usable. */
export function unlockAudio():void {
  if(settings.muted||settings.sfxVolume===0)return;
  try {
    requestMixableAudio();
    if(!context){
      const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
      if(!Constructor)return;
      context=new Constructor({latencyHint:'interactive'});master=context.createGain();master.gain.value=settings.muted?0:settings.sfxVolume*.22;master.connect(context.destination);
    }
    if(context.state==='suspended')void context.resume().catch(()=>{});
  }catch{/* Audio is optional. */}
}
function tone(freq:number,end:number,duration:number,type:OscillatorType,level:number,delay=0){
  if(!context||!master||voices.size>=20)return;
  const osc=context.createOscillator(),gain=context.createGain(),at=context.currentTime+delay;
  osc.type=type;osc.frequency.setValueAtTime(Math.max(30,freq),at);osc.frequency.exponentialRampToValueAtTime(Math.max(30,end),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,level),at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(gain);gain.connect(master);voices.add(osc);
  osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+duration+.02);
}
export function playSound(kind:string,pitch=440,volume=1):void {
  const now=performance.now(),interval=['spin','dial','magnet','slider'].includes(kind)?45:['piano','melody','piano-miss','piano-preview','song-complete'].includes(kind)?18:25;
  if(now-(gates.get(kind)??-Infinity)<interval)return;
  gates.set(kind,now);
  if(settings.haptics&&settings.hapticStrength>0&&typeof navigator!=='undefined'&&typeof window!=='undefined'){
    // SDK routes browser vibration or Aippy's native bridge, never both.
    const supported=typeof navigator.vibrate==='function'||!!window.webkit?.messageHandlers?.aippyListener;
    if(supported){
      try{void vibrate(Math.round((kind==='reward'||kind==='purchase'?32:12)*settings.hapticStrength)).catch(()=>{});}catch{/* Optional device feedback. */}
    }
  }
  if(kind==='navigation'||settings.muted||settings.sfxVolume===0||clamp(volume)===0)return;
  unlockAudio();if(!context||context.state!=='running')return;
  const v=clamp(volume),p=Number.isFinite(pitch)?Math.max(40,Math.min(4000,pitch)):440;
  try {
    switch(kind){
      case 'pop':tone(p*1.5,p*.23,.12,'sine',v);tone(140,65,.05,'triangle',v*.3);break;
      case 'piano-preview':
      case 'song-complete':
      case 'melody':
      case 'piano-miss':
      case 'piano':tone(p,p,.65,'triangle',v*.7);tone(p*2,p*2,.24,'sine',v*.25);break;
      case 'slider':tone(p*.7,p,.19,'sine',v*.55);break;
      case 'switch':tone(820,260,.044,'square',v*.16);tone(130,65,.06,'triangle',v*.35);break;
      case 'switch-match':tone(1120,640,.055,'square',v*.16);tone(180,90,.075,'triangle',v*.35);break;
      case 'spin':tone(90+p*.12,45,.095,'triangle',v*.5);break;
      case 'dial':tone(780+p*.15,440,.035,'square',v*.16);break;
      case 'marble':tone(680,150,.075,'sine',v*.65);tone(110,65,.085,'triangle',v*.25);break;
      case 'magnet':tone(120,p*.8,.11,'triangle',v*.45);break;
      case 'reward':[1,1.25,1.5,2].forEach((r,i)=>tone(523*r,523*r,.32,'sine',v*.5,i*.075));break;
      case 'purchase':[880,660,1046].forEach((f,i)=>tone(f,f,.17,'triangle',v*.5,i*.07));break;
      default:tone(1000,500,.038,'triangle',v*.4);break;
    }
  }catch{/* Never interrupt interaction feedback. */}
}
