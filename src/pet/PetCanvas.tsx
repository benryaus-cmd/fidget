import {useEffect,useRef} from 'react';
import {drawMilo} from './draw';
import {newPose,type MiloPose} from './pose';
import {createMotion,fitPlatforms,reactMotion,stepMotion,type Platform,type PetMotion} from './motion';
import type {PetState} from './state';
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
}
function paint(canvas:HTMLCanvasElement,p:MiloPose,pet:PetState,size:number,scale:number,time:number,m:PetMotion,reduced:boolean){
 const g=canvas.getContext('2d');if(!g)return;
 const dpr=Math.min(2,window.devicePixelRatio||1);if(canvas.width!==size*dpr){canvas.width=size*dpr;canvas.height=size*dpr;}
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,size,size);const feet=size-5;
 if(m.action!=='hop'){g.fillStyle='#100e2460';g.beginPath();g.ellipse(size/2,feet+1,17*scale,3*scale,0,0,Math.PI*2);g.fill();}
 g.translate(size/2,feet);g.scale(scale,scale);poseAt(p,time,m,reduced);drawMilo(g,p,pet);
 if(m.happy>0){g.fillStyle='#ffc4df';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('♥',22,-44-(1-m.happy/1.15)*16);}
}
export function PetPortrait({pet,reducedMotion=false,reaction=0}:{pet:PetState;reducedMotion?:boolean;reaction?:number}){
 const canvas=useRef<HTMLCanvasElement>(null),appearance=useRef(pet),m=useRef(createMotion([{x:0,y:0}]));appearance.current=pet;
 useEffect(()=>{if(reaction)reactMotion(m.current)},[reaction]);
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
   if(!document.hidden){if(dirty)measure();const m=motion.current;if(m&&platforms.length&&button.current&&canvas.current){time+=dt;stepMotion(m,dt,platforms,reducedMotion);button.current.style.transform=`translate(${m.x-28}px,${m.y-51}px)`;button.current.dataset.reaction=m.action;button.current.dataset.hops=String(m.hops);paint(canvas.current,p,appearance.current,56,.7,time,m,reducedMotion);}}
   raf=requestAnimationFrame(loop);
  };
  raf=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(raf);observer.disconnect();main.removeEventListener('scroll',invalidate);window.removeEventListener('resize',invalidate);motion.current=null};
 },[screen,reducedMotion]);
 return <div ref={ref} className="pet-roam-layer"><div className="pet-roamer"><button ref={button} className="pet-touch" aria-label={`Pet ${pet.name}`} title={`Tap ${pet.name} for a little happy hop`} onClick={()=>{if(motion.current)reactMotion(motion.current);react.current()}}><canvas ref={canvas} className="pet-roamer-canvas" width={112} height={112} aria-hidden="true"/></button></div></div>;
}
