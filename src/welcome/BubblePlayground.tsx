import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {createBubbles,mergeBubble,stepBubbles,type Bubble} from './physics';
import './welcome.css';
type Gesture={id:number;pointer:number;startX:number;startY:number;offsetX:number;offsetY:number;lastX:number;lastY:number;lastTime:number;moved:number;original:Bubble};
export default function BubblePlayground({reducedMotion,onPlay}:{reducedMotion:boolean;onPlay:(kind:string)=>void}){
 const root=useRef<HTMLDivElement>(null),buttons=useRef<(HTMLButtonElement|null)[]>([]),world=useRef<Bubble[]>([]),size=useRef({width:300,height:100}),gesture=useRef<Gesture|null>(null),callback=useRef(onPlay);callback.current=onPlay;
 const [message,setMessage]=useState('GRAB · FLICK · MERGE MATCHING BUBBLES'),[burst,setBurst]=useState(0);
 useEffect(()=>{if(!burst)return;const timer=setTimeout(()=>setBurst(0),750);return()=>clearTimeout(timer);},[burst]);
 const paint=()=>{for(const b of world.current){const el=buttons.current[b.id];if(!el)continue;el.style.width=el.style.height=`${b.radius*2}px`;el.style.transform=`translate(${b.x-b.radius}px,${b.y-b.radius}px)`;el.dataset.level=String(b.level);el.dataset.held=String(gesture.current?.id===b.id);}};
 useEffect(()=>{
  const el=root.current;if(!el)return;let raf=0,last=0;
  const resize=()=>{const r=el.getBoundingClientRect();size.current={width:r.width,height:r.height};world.current=createBubbles(r.width,r.height);gesture.current=null;paint();};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const tick=(now:number)=>{const dt=last?Math.min(.032,(now-last)/1000):0;last=now;if(!document.hidden&&!reducedMotion){stepBubbles(world.current,size.current.width,size.current.height,dt,gesture.current?.id??-1);paint();}raf=requestAnimationFrame(tick);};
  const hide=()=>{last=0;const g=gesture.current;if(document.hidden&&g){const b=world.current.find(b=>b.id===g.id);if(b)Object.assign(b,g.original);gesture.current=null;paint();}};
  document.addEventListener('visibilitychange',hide);if(!reducedMotion)raf=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',hide);};
 },[reducedMotion]);
 const point=(e:PointerEvent)=>{const r=root.current!.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
 const down=(e:PointerEvent<HTMLButtonElement>,id:number)=>{if(gesture.current||e.button!==0)return;e.preventDefault();const b=world.current.find(v=>v.id===id);if(!b)return;const p=point(e);gesture.current={id,pointer:e.pointerId,startX:p.x,startY:p.y,offsetX:p.x-b.x,offsetY:p.y-b.y,lastX:p.x,lastY:p.y,lastTime:performance.now(),moved:0,original:{...b}};b.vx=b.vy=0;e.currentTarget.setPointerCapture(e.pointerId);paint();};
 const move=(e:PointerEvent<HTMLButtonElement>)=>{const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;const b=world.current.find(v=>v.id===g.id)!;const p=point(e),now=performance.now(),dt=Math.max(.016,(now-g.lastTime)/1000);const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));b.x=clamp(p.x-g.offsetX,b.radius,size.current.width-b.radius);b.y=clamp(p.y-g.offsetY,b.radius,size.current.height-b.radius);b.vx=clamp((p.x-g.lastX)/dt,-350,350);b.vy=clamp((p.y-g.lastY)/dt,-350,350);g.moved+=Math.hypot(p.x-g.lastX,p.y-g.lastY);g.lastX=p.x;g.lastY=p.y;g.lastTime=now;paint();};
 const release=(e:PointerEvent<HTMLButtonElement>,cancel=false)=>{const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;gesture.current=null;const b=world.current.find(v=>v.id===g.id)!;
  if(cancel){Object.assign(b,g.original);paint();return;}
  if(g.moved<5){b.vy=-120;b.vx=(b.id-1)*40;setMessage('BOING! DRAG TWO MATCHING BUBBLES TOGETHER');callback.current('welcome-bounce');}
  else{const result=mergeBubble(world.current,g.id,size.current.width,size.current.height);world.current=result.bubbles;if(result.merged){setMessage(result.burst?'BIG SQUISH! GO AGAIN?':'A BIGGER WOBBLE! MERGE THE TWO BIG ONES');callback.current(result.burst?'welcome-burst':'welcome-merge');if(result.burst)setBurst(n=>n+1);}else{setMessage('NICE FLICK. TRY MERGING A MATCHING PAIR');callback.current('welcome-flick');}}
  if(reducedMotion)for(const v of world.current)v.vx=v.vy=0;paint();
 };
 return <div className="bubble-playground"><div className="welcome-orbits" aria-hidden/><div ref={root} className="welcome-bubble-field" aria-label="Pip's bubble playground">{[0,1,2].map(id=><button ref={el=>{buttons.current[id]=el}} key={id} type="button" className="welcome-bubble" aria-label={`Play with bubble ${id+1}`} onPointerDown={e=>down(e,id)} onPointerMove={move} onPointerUp={e=>release(e)} onPointerCancel={e=>release(e,true)} onLostPointerCapture={e=>release(e,true)} onClick={e=>{if(e.detail===0){setMessage('BOING! TRY DRAGGING A MATCHING PAIR');callback.current('welcome-bounce');}}}><span>{id===1?'✦':'·'}</span></button>)}{burst>0&&<span className={`welcome-burst ${reducedMotion?'still':''}`} key={burst} aria-hidden>✦ · ✧ · ✦</span>}</div><span className="art-caption" role="status">{message}</span></div>;
}
