import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
import {adjacent,dominoCascade} from './rules';
import {POP_CLEAR_DELAY_MS} from '../catalog';
type Props={hit:(points:number,kind:string,pitch?:number)=>void;reducedMotion:boolean};
export default function DominoPop({hit,reducedMotion}:Props){
 const [popped,setPopped]=useState<number[]>([]),[automatic,setAutomatic]=useState<number[]>([]),[side,setSide]=useState(0),[clearing,setClearing]=useState(false),[message,setMessage]=useState('Sweep 3 neighbours to start a domino chain');
 const state=useRef({done:new Set<number>(),auto:new Set<number>(),path:[] as number[],triggered:false,pointer:-1,generation:0}),timers=useRef<ReturnType<typeof setTimeout>[]>([]),callback=useRef(hit);callback.current=hit;
 const cancelTimers=()=>{timers.current.forEach(clearTimeout);timers.current=[];};
 useEffect(()=>()=>cancelTimers(),[]);
 const flip=()=>{cancelTimers();state.current={done:new Set(),auto:new Set(),path:[],triggered:false,pointer:-1,generation:state.current.generation+1};setPopped([]);setAutomatic([]);setClearing(false);setSide(n=>n+1);setMessage('Fresh side. Sweep 3 neighbours for another chain.');};
 const clear=()=>{if(state.current.done.size!==25)return;setClearing(true);setMessage('DOMINO CLEAR! Turning the board…');callback.current(0,'domino-clear');timers.current.push(setTimeout(flip,POP_CLEAR_DELAY_MS));};
 const burst=(seed:number)=>{const v=state.current,queue=dominoCascade(seed,v.done),generation=v.generation;v.triggered=true;v.path=[];if(!queue.length)return;setMessage(`DOMINO! ${queue.length} bubbles in the wave`);callback.current(0,'domino-chain');
  queue.forEach((id,index)=>timers.current.push(setTimeout(()=>{const current=state.current;if(current.generation!==generation||current.done.has(id))return;current.done.add(id);current.auto.add(id);setPopped([...current.done]);setAutomatic([...current.auto]);clear();},reducedMotion?0:65*(index+1))));
 };
 const pop=(id:number)=>{const v=state.current;if(v.done.has(id)||v.done.size===25)return;v.done.add(id);setPopped([...v.done]);callback.current(3,'pop',260+id*17);
  const previous=v.path.at(-1);v.path=previous!==undefined&&adjacent(previous,id)?[...v.path,id]:[id];
  if(v.path.length>=3&&!v.triggered)burst(id);clear();
 };
 const end=(cancel=false)=>{state.current.pointer=-1;state.current.path=[];state.current.triggered=false;if(cancel){cancelTimers();if(state.current.done.size===25)flip();}};
 useEffect(()=>{const hidden=()=>{if(document.hidden)end(true)};document.addEventListener('visibilitychange',hidden);const blur=()=>end(true);window.addEventListener('blur',blur);return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',blur)}},[]);
 const sweep=(e:PointerEvent<HTMLDivElement>)=>{if(state.current.pointer!==e.pointerId)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-domino]');if(target&&e.currentTarget.contains(target))pop(Number(target.dataset.domino));};
 return <><div className="toy-status" role="status">{message}</div><div className={`pop-housing domino-housing ${clearing?'board-cleared':''}`} onPointerMove={sweep} onPointerUp={e=>{if(state.current.pointer===e.pointerId)end();}} onPointerCancel={e=>{if(state.current.pointer===e.pointerId)end(true);}} onLostPointerCapture={e=>{if(state.current.pointer===e.pointerId)end(true);}}><div className="pop-board" key={side}>{Array.from({length:25},(_,id)=><button key={id} data-domino={id} className={`bubble ${popped.includes(id)?'popped':''} ${automatic.includes(id)?'domino-auto':''}`} aria-label={`Domino bubble ${id+1}${popped.includes(id)?', popped':''}`} style={{'--bubble':['#ee80b8','#bd94f2','#87dcca'][(Math.floor(id/5)+side)%3]} as CSSProperties} onPointerDown={e=>{if(state.current.pointer!==-1)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);state.current.pointer=e.pointerId;state.current.path=[];state.current.triggered=false;pop(id);}} onClick={e=>{if(e.detail===0){if(state.current.triggered){state.current.triggered=false;state.current.path=[];}pop(id);}}}>{automatic.includes(id)?'✧':''}</button>)}</div>{clearing&&<div className={`board-clear-banner ${reducedMotion?'still':''}`} aria-hidden><span>✦</span><strong>DOMINO CLEAR!</strong><small>LET IT RIPPLE</small></div>}</div><div className="toy-engraving">MANUAL POPS EARN · DOMINOES ARE PURE JOY</div></>;
}
