import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {createOrbit,stepOrbit,releaseOrbit} from './rules';
type Props={hit:(points:number,kind:string,pitch?:number)=>void;reducedMotion:boolean;intensity:number;material:string};
const COLORS=['#fb6da8','#ffc575','#b7ed85','#69e7ce','#79b4ff','#b396ff','#f286df','#ffb4c5'];
export default function OrbitMagnet({hit,reducedMotion,intensity,material}:Props){
 const canvas=useRef<HTMLCanvasElement>(null),world=useRef(createOrbit()),pointer=useRef<number|null>(null),callback=useRef(hit),reset=useRef<ReturnType<typeof setTimeout>|null>(null),counts=useRef(''),[message,setMessage]=useState('Hold the magnet. Gather an orbit. Release to swirl.');callback.current=hit;
 const refresh=()=>{world.current=createOrbit();pointer.current=null;counts.current='';setMessage('Fresh crystals. Build a bigger orbit.');reset.current=null;};
 const release=(cancel=false)=>{pointer.current=null;const count=releaseOrbit(world.current,cancel);if(cancel){setMessage('Orbit released gently. Gather it again.');return;}if(count){setMessage(`${count} crystal${count===1?'':'s'} spiralling into the vortex`);callback.current(0,count>=3?'orbit-release':'orbit-small');}};
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const g=el.getContext('2d');if(!g)return;if(world.current.completed)refresh();let raf=0,last=0,visible=!document.hidden;
  const size=()=>{const box=el.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);el.width=Math.max(1,Math.round(box.width*dpr));el.height=Math.max(1,Math.round(box.height*dpr));};const observer=new ResizeObserver(size);observer.observe(el);size();
  const draw=(now:number)=>{const dt=last?Math.min(.035,(now-last)/1000):0;last=now;const w=world.current,result=stepOrbit(w,dt);
   for(const id of result.captures)callback.current(6,'magnet',350+id*35);
   const orbit=w.crystals.filter(c=>c.mode==='orbit').length,banked=w.crystals.filter(c=>c.mode==='banked').length,key=`${orbit}/${banked}`;
   if(key!==counts.current){counts.current=key;if(orbit)setMessage(`${orbit} / 8 orbiting · ${banked} banked · release to swirl`);else if(banked&&!w.completed)setMessage(`${banked} / 8 banked. Gather the rest.`);}
   if(result.complete){setMessage('VORTEX CLEAR! A fresh constellation is coming.');callback.current(0,'orbit-clear');reset.current=setTimeout(refresh,1100);}
   el.dataset.orbit=String(orbit);el.dataset.banked=String(banked);
   g.setTransform(el.width/320,0,0,el.height/420,0,0);const bg=g.createLinearGradient(0,0,320,420);bg.addColorStop(0,material==='chrome'?'#45546b':material==='glass'?'#124251':'#19243d');bg.addColorStop(1,'#0b1024');g.fillStyle=bg;g.fillRect(0,0,320,420);
   g.strokeStyle='#a6c9ff0e';g.lineWidth=1;for(let x=20;x<320;x+=25){g.beginPath();g.moveTo(x,0);g.lineTo(x,420);g.stroke();}
   g.save();g.translate(160,210);g.strokeStyle=w.completed?'#b1ffe5':'#a5a0e559';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();const radius=16+i*10;g.ellipse(0,0,radius,radius*.55,reducedMotion?i*.6:w.time*.7+i*.6,0,Math.PI*2);g.stroke();}g.fillStyle='#b9a6ff';g.font='8px system-ui';g.textAlign='center';g.fillText('RELEASE TO SWIRL',0,65);g.restore();
   if(w.pointer.active){g.strokeStyle='#91f2d73a';g.lineWidth=1;g.beginPath();g.arc(w.pointer.x,w.pointer.y,55,0,Math.PI*2);g.stroke();}
   for(const c of w.crystals){if(c.mode==='banked')continue;g.save();g.translate(c.x,c.y);g.rotate(reducedMotion?Math.PI/4:w.time*.35+c.id);g.shadowBlur=reducedMotion?0:Math.round(intensity*10);g.shadowColor=COLORS[c.id];g.fillStyle=COLORS[c.id];g.fillRect(-7,-7,14,14);g.shadowBlur=0;g.fillStyle='#ffffff80';g.fillRect(-5,-5,4,4);g.restore();}
   const p=w.pointer;g.save();g.translate(p.x,p.y);g.lineWidth=10;g.strokeStyle=p.active?'#fb91c3':'#8a7ca5';g.beginPath();g.arc(0,0,17,0,Math.PI);g.stroke();g.strokeStyle='#b9efff';g.beginPath();g.moveTo(-17,0);g.lineTo(-17,-14);g.moveTo(17,0);g.lineTo(17,-14);g.stroke();g.restore();
   if(visible)raf=requestAnimationFrame(draw);
  };
  const visibility=()=>{visible=!document.hidden;cancelAnimationFrame(raf);last=0;if(!visible){releaseOrbit(world.current,true);pointer.current=null;if(reset.current!==null){clearTimeout(reset.current);reset.current=null;}}else{if(world.current.completed)refresh();raf=requestAnimationFrame(draw);}};
  const blur=()=>{if(world.current.pointer.active)release(true);};
  document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);if(visible)raf=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();if(reset.current!==null)clearTimeout(reset.current);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);};
 },[reducedMotion,intensity,material]);
 const position=(e:PointerEvent<HTMLCanvasElement>)=>{const b=e.currentTarget.getBoundingClientRect();return{x:Math.max(14,Math.min(306,(e.clientX-b.x)/b.width*320)),y:Math.max(22,Math.min(398,(e.clientY-b.y)/b.height*420))};};
 return <><div className="toy-status" role="status">{message}</div><div className="field-housing orbit-housing"><canvas ref={canvas} tabIndex={0} aria-label="Orbit magnet. Hold to gather crystals, release to swirl. Space also gathers and releases." onPointerDown={e=>{if(pointer.current!==null||world.current.completed)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointer.current=e.pointerId;Object.assign(world.current.pointer,position(e),{active:true});}} onPointerMove={e=>{if(pointer.current===e.pointerId)Object.assign(world.current.pointer,position(e));}} onPointerUp={e=>{if(pointer.current===e.pointerId)release();}} onPointerCancel={e=>{if(pointer.current===e.pointerId)release(true);}} onLostPointerCapture={e=>{if(pointer.current===e.pointerId)release(true);}} onKeyDown={e=>{if(e.code==='Space'&&!e.repeat&&pointer.current===null&&!world.current.completed){e.preventDefault();pointer.current=-1;Object.assign(world.current.pointer,{x:160,y:210,active:true});}}} onKeyUp={e=>{if(e.code==='Space'&&pointer.current===-1){e.preventDefault();release();}}} onBlur={()=>{if(world.current.pointer.active)release(true);}}/></div><div className="toy-engraving">GATHER · ORBIT · LET GO</div></>;
}
