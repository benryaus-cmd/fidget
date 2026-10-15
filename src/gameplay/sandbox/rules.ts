const TAU=Math.PI*2;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function adjacent(a:number,b:number):boolean{return a!==b&&Math.abs(a%5-b%5)+Math.abs(Math.floor(a/5)-Math.floor(b/5))===1;}
/** Breadth-first, two physical hops, at most eight cosmetic pops. */
export function dominoCascade(seed:number,popped:ReadonlySet<number>):number[]{
 const seen=new Set([...popped,seed]),queue=[{id:seed,depth:0}],result:number[]=[];
 while(queue.length&&result.length<8){const next=queue.shift()!;if(next.depth>=2)continue;
  for(let id=0;id<25&&result.length<8;id++)if(!seen.has(id)&&adjacent(next.id,id)){seen.add(id);result.push(id);queue.push({id,depth:next.depth+1});}
 }
 return result;
}
export function gradeCatch(angle:number,speed:number,target:number,travel:number):'unready'|'perfect'|'near'|'miss'{
 if(![angle,speed,target,travel].every(Number.isFinite)||Math.abs(speed)<3||Math.abs(travel)<TAU)return 'unready';
 const error=Math.abs(Math.atan2(Math.sin(angle-target),Math.cos(angle-target)));
 return error<=.24?'perfect':error<=.48?'near':'miss';
}
export type Crystal={id:number;x:number;y:number;vx:number;vy:number;mode:'free'|'orbit'|'flying'|'banked';earned:boolean;slot:number;flight:number;fromX:number;fromY:number};
export type OrbitWorld={crystals:Crystal[];pointer:{x:number;y:number;active:boolean};time:number;lastCapture:number;completed:boolean};
export function createOrbit():OrbitWorld{return {crystals:Array.from({length:8},(_,id)=>{const a=id*TAU/8;return {id,x:160+Math.cos(a)*110,y:210+Math.sin(a)*110,vx:0,vy:0,mode:'free',earned:false,slot:id,flight:0,fromX:0,fromY:0};}),pointer:{x:160,y:210,active:false},time:0,lastCapture:-Infinity,completed:false};}
export function releaseOrbit(w:OrbitWorld,cancelled:boolean):number{
 w.pointer.active=false;let count=0;
 for(const c of w.crystals)if(c.mode==='orbit'){count++;if(cancelled){c.mode='free';c.vx=Math.cos(c.slot)*35;c.vy=Math.sin(c.slot)*35;}else{c.mode='flying';c.flight=0;c.fromX=c.x;c.fromY=c.y;}}
 return count;
}
export function stepOrbit(w:OrbitWorld,delta:number):{captures:number[];complete:boolean}{
 const dt=clamp(Number.isFinite(delta)?delta:0,0,.035),captures:number[]=[];w.time+=dt;
 for(const c of w.crystals){
  if(c.mode==='banked')continue;
  if(c.mode==='flying'){c.flight=Math.min(1,c.flight+dt/1.05);const k=c.flight,a=Math.atan2(c.fromY-210,c.fromX-160)+k*TAU*1.3,r=Math.hypot(c.fromX-160,c.fromY-210)*(1-k);c.x=160+Math.cos(a)*r;c.y=210+Math.sin(a)*r;if(k===1)c.mode='banked';continue;}
  if(c.mode==='free'){
   const dx=w.pointer.x-c.x,dy=w.pointer.y-c.y,dist=Math.hypot(dx,dy);
   if(w.pointer.active&&dist<155){c.vx+=dx*10*dt;c.vy+=dy*10*dt;}
   c.vx*=Math.exp(-4*dt);c.vy*=Math.exp(-4*dt);c.x=clamp(c.x+c.vx*dt,12,308);c.y=clamp(c.y+c.vy*dt,20,400);
   if(w.pointer.active&&Math.hypot(w.pointer.x-c.x,w.pointer.y-c.y)<25&&w.time-w.lastCapture>=.12){c.mode='orbit';w.lastCapture=w.time;if(!c.earned){c.earned=true;captures.push(c.id);}}
  }
  if(c.mode==='orbit'){const a=c.slot*TAU/8+w.time*1.8,r=43+(c.slot%2)*10;c.vx+=(w.pointer.x+Math.cos(a)*r-c.x)*65*dt;c.vy+=(w.pointer.y+Math.sin(a)*r-c.y)*65*dt;c.vx*=Math.exp(-12*dt);c.vy*=Math.exp(-12*dt);c.x=clamp(c.x+c.vx*dt,12,308);c.y=clamp(c.y+c.vy*dt,20,400);}
 }
 const complete=!w.completed&&w.crystals.every(c=>c.mode==='banked');if(complete)w.completed=true;
 return {captures,complete};
}
