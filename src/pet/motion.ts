/** Small deterministic visual controller. It never touches game scores or currency. */
export type Platform={x:number;y:number};
export type PetMotion={x:number;y:number;from:Platform;to:Platform;phase:number;wait:number;happy:number;action:'idle'|'hop'|'happy';index:number;hops:number;dir:number;landing:number};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function fitPlatforms(points:Platform[],width:number,height:number):Platform[]{
 const result:Platform[]=[];
 if(width<48||height<76)return result;
 for(const p of points){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;const q={x:clamp(p.x,24,width-24),y:clamp(p.y,66,height-10)};if(!result.some(v=>Math.hypot(v.x-q.x,v.y-q.y)<8))result.push(q);}
 return result;
}
export function createMotion(platforms:Platform[]):PetMotion{
 const p=platforms[0]??{x:30,y:76};return {x:p.x,y:p.y,from:{...p},to:{...p},phase:0,wait:1.5,happy:0,action:'idle',index:0,hops:0,dir:1,landing:0};
}
export function reactMotion(m:PetMotion){m.happy=1.15;if(m.action!=='hop')m.action='happy';m.wait=Math.max(m.wait,1.4);}
export function stepMotion(m:PetMotion,delta:number,platforms:Platform[],reduced:boolean){
 const dt=clamp(Number.isFinite(delta)?delta:0,0,.04);m.happy=Math.max(0,m.happy-dt);m.landing=Math.max(0,m.landing-dt);
 if(!platforms.length)return;
 if(reduced){m.action=m.happy>0?'happy':'idle';m.phase=0;m.x=platforms[0].x;m.y=platforms[0].y;m.index=0;return;}
 if(m.action==='hop'){
  m.phase=Math.min(1,m.phase+dt/.76);const k=m.phase;
  m.x=m.from.x+(m.to.x-m.from.x)*k;m.y=Math.max(60,m.from.y+(m.to.y-m.from.y)*k-Math.sin(k*Math.PI)*Math.min(50,22+Math.abs(m.to.x-m.from.x)*.2));
  if(k===1){m.hops++;m.action='idle';m.landing=.23;m.wait=1.6+(m.hops%3)*.45;}
 }else{
  m.action=m.happy>0?'happy':'idle';m.wait-=dt;
  if(m.wait<=0&&platforms.length>1&&m.happy===0){m.index=(m.index+1)%platforms.length;m.from={x:m.x,y:m.y};m.to={...platforms[m.index]};m.dir=m.to.x>=m.x?1:-1;m.phase=0;m.action='hop';}
 }
}
