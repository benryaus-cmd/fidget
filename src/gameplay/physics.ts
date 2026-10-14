export const TAU = Math.PI * 2;
export const clamp = (n:number,min:number,max:number) => Math.max(min,Math.min(max,n));
export function angleDelta(a:number,b:number){ return Math.atan2(Math.sin(a-b),Math.cos(a-b)); }
export function rotationReward(travel:number,budget:number){ return Math.min(Math.max(0,budget),Math.floor(Math.abs(travel)/TAU)); }
export function accuracyPoints(value:number,target:number){ const error=Math.abs(value-target);return error<=8?30-Math.round(error*2):0; }
export function stepMarble(m:{x:number;y:number;vx:number;vy:number},dt:number,pegs:{x:number;y:number}[]){
 const n={...m};n.vy+=680*dt;n.x+=n.vx*dt;n.y+=n.vy*dt;
 if(n.x<10){n.x=10;n.vx=Math.abs(n.vx)*.7;}if(n.x>310){n.x=310;n.vx=-Math.abs(n.vx)*.7;}
 for(const p of pegs){const dx=n.x-p.x,dy=n.y-p.y,d=Math.hypot(dx,dy);if(d<18&&d>0){const nx=dx/d,ny=dy/d;n.x=p.x+nx*18;n.y=p.y+ny*18;const v=n.vx*nx+n.vy*ny;if(v<0){n.vx-=1.45*v*nx;n.vy-=1.45*v*ny;}if(Math.abs(n.vx)<3)n.vx=(n.x<160?-1:1)*15;}}
 return n;
}
