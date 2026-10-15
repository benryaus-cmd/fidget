import {useEffect,useRef,useState,type PointerEvent,type CSSProperties} from 'react';
import {accuracyPoints,clamp} from './physics';

type Props={challenge:boolean;hit:(points:number,kind:string,pitch?:number)=>void};
const NAMES=['Warmth','Resonance','Energy'];
const COLORS=['#fb6da8','#b7ed85','#79b4ff'];
/** Drag displacement, rather than absolute pointer position, preserves the grab offset. */
function Fader({value,target,disabled,name,onMove,onRelease}:{value:number;target:number;disabled:boolean;name:string;onMove:(v:number)=>void;onRelease:(start:number,value:number)=>void}){
 const track=useRef<HTMLDivElement>(null);
 const drag=useRef<{id:number;x:number;start:number;value:number;width:number}|null>(null);
 const keyStart=useRef<number|null>(null),current=useRef(value);current.current=value;
 const moveRef=useRef(onMove);moveRef.current=onMove;
 useEffect(()=>{const cancel=()=>{const d=drag.current;if(d){drag.current=null;current.current=d.start;moveRef.current(d.start);}keyStart.current=null;};const hidden=()=>{if(document.hidden)cancel();};window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',hidden);return()=>{window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',hidden);};},[]);
 const down=(e:PointerEvent<HTMLButtonElement>)=>{if(disabled||drag.current||e.button!==0)return;e.preventDefault();const width=track.current!.getBoundingClientRect().width;drag.current={id:e.pointerId,x:e.clientX,start:value,value,width};e.currentTarget.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;d.value=Math.round(clamp(d.start+(e.clientX-d.x)/Math.max(1,d.width)*100,0,100));current.current=d.value;onMove(d.value);};
 const up=(e:PointerEvent<HTMLButtonElement>,cancel=false)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(cancel){current.current=d.start;onMove(d.start);}else onRelease(d.start,d.value);};
 return <div className="slider-track" ref={track}><div className="slider-fill" style={{width:`${value}%`}}/><div className="slider-target" style={{left:`${target}%`}}/><button type="button" role="slider" className="fader-handle" style={{left:`${value}%`}} disabled={disabled} aria-label={`${name}, target ${target}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={`${value}, target ${target}`} onPointerDown={down} onPointerMove={move} onPointerUp={e=>up(e)} onPointerCancel={e=>up(e,true)} onLostPointerCapture={e=>up(e,true)} onKeyDown={e=>{const deltas:Record<string,number>={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1,PageDown:-10,PageUp:10};if(!(e.key in deltas)&&e.key!=='Home'&&e.key!=='End')return;e.preventDefault();if(keyStart.current===null)keyStart.current=current.current;const next=e.key==='Home'?0:e.key==='End'?100:clamp(current.current+deltas[e.key]*(e.shiftKey?5:1),0,100);current.current=next;onMove(next);}} onKeyUp={e=>{if(!['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key))return;if(keyStart.current!==null){onRelease(keyStart.current,current.current);keyStart.current=null;}}} onBlur={()=>{keyStart.current=null;}}><span/></button></div>;
}
export default function Sliders({challenge,hit}:Props){
 const [values,setValues]=useState([20,50,80]),[targets,setTargets]=useState([72,28,58]),[locked,setLocked]=useState([false,false,false]),[message,setMessage]=useState('Grab a handle. Slide, then release inside the light.');
 const last=useRef([-Infinity,-Infinity,-Infinity]);
 const finish=(i:number,start:number,value:number)=>{
  if(challenge&&locked[i])return;
  const now=performance.now();if(now-last.current[i]<400||Math.abs(start-value)<2)return;
  last.current[i]=now;const points=accuracyPoints(value,targets[i]);
  if(!points){setMessage('A little closer — aim inside the band');hit(0,'slider-miss');return;}
  hit(points,'slider',200+value*5);setMessage(points===30?'Perfect alignment!':'Sweet spot found');
  const next=locked.map((v,j)=>j===i?true:v);
  if(challenge&&next.every(Boolean)){setLocked([false,false,false]);setTargets(targets.map((t,j)=>(t+29+j*7)%80+10));setMessage('All synced! Tune the next set.');hit(0,'slider-sync');}
  else if(challenge)setLocked(next);else setTargets(targets.map((t,j)=>j===i?(t+37)%80+10:t));
 };
 return <><div className="toy-status" role="status" aria-live="polite">{message}</div><div className="slider-housing">{values.map((v,i)=><div className={`slider-row ${locked[i]?'locked':''}`} key={i} style={{'--bubble':COLORS[i]} as CSSProperties}><div className="slider-label"><span>{NAMES[i].toUpperCase()}</span><b>{locked[i]?'LOCKED':`${v} / ${targets[i]}`}</b></div><Fader value={v} target={targets[i]} name={NAMES[i]} disabled={challenge&&locked[i]} onMove={value=>setValues(old=>old.map((n,j)=>j===i?value:n))} onRelease={(start,value)=>finish(i,start,value)}/></div>)}</div><div className="toy-engraving">GRAB · SLIDE · RELEASE</div></>;
}
