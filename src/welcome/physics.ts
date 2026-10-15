export type Bubble={id:number;x:number;y:number;vx:number;vy:number;radius:number;level:number};
export function createBubbles(width:number,height:number):Bubble[]{
 const radius=Math.max(10,Math.min(23,height*.24,width*.075));
 return [0,1,2].map((id)=>({id,x:width*(.2+id*.3),y:height*.5,vx:(id-1)*11,vy:0,radius,level:0}));
}
export function stepBubbles(bubbles:Bubble[],width:number,height:number,delta:number,held=-1):void{
 const dt=Math.max(0,Math.min(.032,delta));
 for(const b of bubbles){if(b.id===held)continue;b.vy+=65*dt;b.vx*=Math.exp(-.3*dt);b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<b.radius){b.x=b.radius;b.vx=Math.abs(b.vx)*.8;}else if(b.x>width-b.radius){b.x=width-b.radius;b.vx=-Math.abs(b.vx)*.8;}
  if(b.y<b.radius){b.y=b.radius;b.vy=Math.abs(b.vy)*.8;}else if(b.y>height-b.radius){b.y=height-b.radius;b.vy=-Math.abs(b.vy)*.76;if(Math.abs(b.vy)<8)b.vy=-30;}
 }
}
/** Merge only on a deliberate release; ambient collisions cannot start an endless chain. */
export function mergeBubble(bubbles:Bubble[],id:number,width:number,height:number):{bubbles:Bubble[];merged:boolean;burst:boolean}{
 const b=bubbles.find(v=>v.id===id);if(!b)return {bubbles,merged:false,burst:false};
 const other=bubbles.find(v=>v.id!==id&&v.level===b.level&&Math.hypot(v.x-b.x,v.y-b.y)<(v.radius+b.radius)*.9);
 if(!other)return {bubbles,merged:false,burst:false};
 if(b.level>=1)return {bubbles:createBubbles(width,height),merged:true,burst:true};
 const radius=Math.min(b.radius*1.35,height/2-2),next={...b,x:Math.max(radius,Math.min(width-radius,(b.x+other.x)/2)),y:Math.max(radius,Math.min(height-radius,(b.y+other.y)/2)),vx:(b.vx+other.vx)*.5,vy:-65,radius,level:b.level+1};
 // Replace the consumed bubble so the little playground always has something to do.
 const replacement={...other,level:next.level,radius,x:other.x<width/2?width-radius:radius,y:radius,vy:12};
 return {bubbles:bubbles.map(v=>v.id===id?next:v.id===other.id?replacement:v),merged:true,burst:false};
}
