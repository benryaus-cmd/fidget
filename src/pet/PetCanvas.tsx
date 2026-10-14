import {useEffect,useRef} from 'react';
import {drawMilo} from './draw';
import {newPose,type MiloPose} from './pose';
import {createMotion,fitPlatforms,reactMotion,stepMotion,type Platform,type PetMotion} from './motion';
import type {PetState} from './state';
import {emoteForEvent,EMOTE_LABELS,type PetEmote,type PetEvent} from './emotes';
import {useState} from 'react';
import './pet.css';
/** Independent instance poses keep showroom and wardrobe animation from sharing rig state. */
function poseAt(p:MiloPose,time:number,m:PetMotion,reduced:boolean){
 const happy=m.happy>0,air=m.action==='hop',wave=happy?Math.sin(time*14):0;
 const squish=reduced?0:air?-.09*Math.sin(m.phase*Math.PI):m.landing>0?.16*Math.sin(m.landing/.23*Math.PI):Math.sin(time*3)*.023;
 p.dir=air?m.dir:1;p.front=air?.35:.9;p.sx=1+squish*.75;p.sy=1-squish;p.bob=reduced?0:-Math.abs(Math.sin(time*2))*.7;
 p.rot=reduced?0:air?m.dir*Math.sin(m.phase*Math.PI)*.09:happy?wave*.05:Math.sin(time*.8)*.018;
 p.earA=reduced?0:Math.sin(time*2.4)*.055+(happy?wave*.08:0);p.earDrop=air?-.25*Math.sin(m.phase*Math.PI):squish*1.8;
 p.tail=reduced?0:Math.sin(time*3)*.25;p.blink=(time%3.7)<.16?Math.sin((time%3.7)/.16*Math.PI):0;
 p.eye=happy?2:0;p.mouth=happy?2:air?1:0;p.a0x=happy?-3:0;p.a1x=happy?3:0;p.a0y=happy?-6:air?-3:0;p.a1y=happy?-7:air?-3:0;
 p.f0y=p.f1y=air?-2*Math.sin(m.phase*Math.PI):0;
 if(happy){const k=1-m.happy/1.15,w=Math.sin(k*Math.PI*8),move=reduced?0:1;
  if(m.emote==='wave'){p.a1y=-10;p.a1x=3+w*3*move;p.eye=0;}
  if(m.emote==='bounce')p.bob-=Math.abs(Math.sin(k*Math.PI*3))*5*move;
  if(m.emote==='spin'){p.dir=reduced?1:Math.sign(Math.cos(k*Math.PI*2))*Math.max(.3,Math.abs(Math.cos(k*Math.PI*2)));p.eye=0;}
  if(m.emote==='dance'||m.emote==='listen'){p.rot=w*.13*move;p.a0y=-4-w*4*move;p.a1y=-4+w*4*move;p.f0y=-Math.max(0,w)*3*move;p.f1y=-Math.max(0,-w)*3*move;}
  if(m.emote==='peek'){p.eye=4;p.a0x=13;p.a1x=-13;p.a0y=p.a1y=-13;p.front=1;}
  if(m.emote==='snooze'){p.eye=3;p.mouth=3;p.blink=1;p.earDrop=.5;p.rot=.08*move;}
  if(m.emote==='confetti'||m.emote==='cheer'){p.a0y=p.a1y=-10;p.a0x=-4;p.a1x=4;}
  if(m.emote==='encourage'){p.eye=0;p.mouth=0;p.rot=Math.sin(k*Math.PI*2)*.05*move;}
 }

}
function paint(canvas:HTMLCanvasElement,p:MiloPose,pet:PetState,size:number,scale:number,time:number,m:PetMotion,reduced:boolean){
 const g=canvas.getContext('2d');if(!g)return;
 const dpr=Math.min(2,window.devicePixelRatio||1);if(canvas.width!==size*dpr){canvas.width=size*dpr;canvas.height=size*dpr;}
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,size,size);const feet=size-5;
 if(m.action!=='hop'){g.fillStyle='#100e2460';g.beginPath();g.ellipse(size/2,feet+1,17*scale,3*scale,0,0,Math.PI*2);g.fill();}
 g.translate(size/2,feet);g.scale(scale,scale);poseAt(p,time,m,reduced);drawMilo(g,p,pet);
 if(m.happy>0){const k=1-m.happy/1.15,lift=reduced?0:k*10;g.textAlign='center';g.font='bold 10px sans-serif';g.fillStyle='#f5bdd8';
  if(m.emote==='confetti'){for(let i=0;i<9;i++){g.fillStyle=['#ffe39c','#b9efdc','#e4b4ff'][i%3];const a=i*2.4;g.fillRect(Math.sin(a)*(18+k*5),-20-Math.cos(a)*18-k*8,2,3);}}
  else g.fillText(m.emote==='snooze'?'zZ':m.emote==='dance'||m.emote==='listen'?'♫':m.emote==='peek'?'?':m.emote==='heart'?'♥':'✦',22,-42-lift);
 }
 canvas.dataset.emote=m.happy>0?m.emote:'idle';

}
export function PetPortrait({pet,reducedMotion=false,reaction=0,emote}:{pet:PetState;reducedMotion?:boolean;reaction?:number;emote?:PetEmote}){
 const canvas=useRef<HTMLCanvasElement>(null),appearance=useRef(pet),m=useRef(createMotion([{x:0,y:0}]));appearance.current=pet;
 useEffect(()=>{if(reaction)reactMotion(m.current,emote)},[reaction]);
 useEffect(()=>{let raf=0,last=0,time=0;const p=newPose();const loop=(now:number)=>{const dt=last?Math.min(.04,(now-last)/1000):0;last=now;if(!document.hidden){time+=dt;stepMotion(m.current,dt,[{x:0,y:0}],reducedMotion);if(canvas.current)paint(canvas.current,p,appearance.current,180,2.05,time,m.current,reducedMotion);}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf)},[reducedMotion]);
 return <canvas ref={canvas} className="pet-portrait" width={360} height={360} aria-label={`${pet.name} wearing selected pet style`} role="img"/>;
}
export default function PetRoamer({pet,screen,reducedMotion,onReact}:{pet:PetState;screen:'home'|'showroom';reducedMotion:boolean;onReact:()=>void}){
 const ref=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null),canvas=useRef<HTMLCanvasElement>(null),appearance=useRef(pet),react=useRef(onReact),motion=useRef<PetMotion|null>(null);appearance.current=pet;react.current=onReact;
 useEffect(()=>{
  const layer=ref.current,root=layer?.closest('.uff'),main=root?.querySelector('.content');if(!layer||!root||!main)return;
  let platforms:Platform[]=[],width=0,height=0,raf=0,last=0,time=0,dirty=true;const p=newPose();
  const measure=()=>{
   const r=root.getBoundingClientRect(),v=main.getBoundingClientRect();width=r.width;height=v.height;
   layer.style.top=`${v.top-r.top}px`;layer.style.left=`${v.left-r.left}px`;layer.style.width=`${v.width}px`;layer.style.height=`${v.height}px`;width=v.width;
   const point=(x:number,y:number)=>({x:x-v.left,y:y-v.top});let raw:Platform[]=[];
   if(screen==='showroom'){
    raw=Array.from(main.querySelectorAll('.toy-card')).map(card=>{const b=card.getBoundingClientRect();return point(b.left+b.width*.27,b.top+48)}).filter(q=>q.y>68&&q.y<height-10);
   }else{
    const a=main.querySelector('.launch-art')?.getBoundingClientRect();const b=main.querySelector('.hero-bubble')?.getBoundingClientRect();
    if(a){raw=[point(a.left+28,a.bottom-24),point(a.right-28,a.bottom-24)];if(b)raw.splice(1,0,point(b.left+b.width/2,b.top+6));}
   }
   platforms=fitPlatforms(raw,width,height);motion.current=createMotion(platforms);dirty=false;
  };
  const invalidate=()=>{dirty=true};const observer=new ResizeObserver(invalidate);observer.observe(main);observer.observe(root);main.addEventListener('scroll',invalidate,{passive:true});window.addEventListener('resize',invalidate);
  const loop=(now:number)=>{
   const dt=last?Math.min(.04,(now-last)/1000):0;last=now;
   if(!document.hidden){if(dirty)measure();const m=motion.current;if(m&&platforms.length&&button.current&&canvas.current){time+=dt;stepMotion(m,dt,platforms,reducedMotion);button.current.style.transform=`translate(${m.x-28}px,${m.y-51}px)`;button.current.dataset.reaction=m.action;button.current.dataset.emote=m.happy>0?m.emote:'idle';button.current.dataset.hops=String(m.hops);paint(canvas.current,p,appearance.current,56,.62,time,m,reducedMotion);}}
   raf=requestAnimationFrame(loop);
  };
  raf=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(raf);observer.disconnect();main.removeEventListener('scroll',invalidate);window.removeEventListener('resize',invalidate);motion.current=null};
 },[screen,reducedMotion]);
 return <div ref={ref} className="pet-roam-layer"><div className="pet-roamer"><button ref={button} className="pet-touch" aria-label={`Pet ${pet.name}`} title={`Tap ${pet.name} for a little happy hop`} onClick={()=>{if(motion.current)reactMotion(motion.current);react.current()}}><canvas ref={canvas} className="pet-roamer-canvas" width={112} height={112} aria-hidden="true"/></button></div></div>;
}

/** Static thumbnails render the actual purchasable appearance without extra animation loops. */
export function PetStyleThumb({pet}:{pet:PetState}){const ref=useRef<HTMLCanvasElement>(null);useEffect(()=>{const c=ref.current;if(!c)return;const p=newPose();p.front=1;paint(c,p,pet,64,.65,1,createMotion([{x:0,y:0}]),true)},[pet.color,pet.ears,pet.face,pet.hat]);return <canvas ref={ref} className="pet-style-thumb" aria-hidden="true"/>;}
export function PetDock({pet,reducedMotion,event,combo}:{pet:PetState;reducedMotion:boolean;event:PetEvent;combo:number}){
 const [active,setActive]=useState(false);useEffect(()=>{if(!event.id)return;setActive(true);const id=setTimeout(()=>setActive(false),1450);return()=>clearTimeout(id)},[event.id]);
 const emote=emoteForEvent(event.kind);return <div className="pet-dock" data-event={event.kind} data-emote={active?emote:'idle'} aria-label={`${pet.name}, your game companion`}><PetPortrait pet={pet} reducedMotion={reducedMotion} reaction={event.id} emote={emote}/><div className="pet-dock-copy"><b>{combo>=3?`${combo} COMBO`:pet.name}</b><small>{active?EMOTE_LABELS[emote]:'Right here with you'}</small></div></div>;
}
