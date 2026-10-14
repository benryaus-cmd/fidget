// Adapted from the user-supplied KENNEY game by Mohammad (Milo procedural renderer).
import {paletteFor,earPlacement} from './appearance';
import type {PetState} from './state';
import type { MiloPose } from './pose';

type G = CanvasRenderingContext2D;
const OUT = '#2a1f4a';
let CREAM = '#fff1d8';
let SHADE = '#f2d4a8';
let LIGHT = '#fffaf0';
let TURQ = '#43c9bb';
let TURQ_HI = '#a3efe4';
let PURP = '#7a4bcf';
let PURP_HI = '#a987f3';
const EYE = '#1a1533';
const CHEEK = 'rgba(255,118,150,0.42)';
const TONGUE = '#ff8aa6';
const OL = 2.3;
const PI = Math.PI;
let ears='ears-original',faceStyle='face-classic',hat='hat-none';
let metallic=false;
const geo = { yb: 0, yt: 0, h: 0, w: 0, wb: 0, fo: 0 };

function setBody(sx: number, sy: number, hip: number, bob: number): void {
  geo.yb = -hip + bob; geo.h = 37.4 * sy; geo.yt = geo.yb - geo.h; geo.w = 17.9 * sx; geo.wb = 14.7 * sx;
}

function bodyPath(g: G): void {
  const { yt, yb, h, w, wb } = geo;
  g.beginPath();
  g.moveTo(0, yt);
  g.bezierCurveTo(w * 0.6, yt, w, yt + h * 0.2, w, yt + h * 0.47);
  g.bezierCurveTo(w, yt + h * 0.8, wb * 0.9, yb, 0, yb);
  g.bezierCurveTo(-wb * 0.9, yb, -w, yt + h * 0.8, -w, yt + h * 0.47);
  g.bezierCurveTo(-w, yt + h * 0.2, -w * 0.6, yt, 0, yt);
  g.closePath();
}

function oval(g: G, x: number, y: number, rx: number, ry: number): void {
  g.beginPath();
  g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, PI * 2);
}

/** m=0 → outline pass (unified silhouette), m=1 → colour pass. */
function paint(g: G, col: string, m: number): void {
  if (m === 0) { g.strokeStyle = OUT; g.lineWidth = OL * 2; g.stroke(); } else { g.fillStyle = col; g.fill(); }
}

function limb(g: G, ax: number, ay: number, bx: number, by: number, wd: number, col: string, m: number): void {
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by);
  g.strokeStyle = m === 0 ? OUT : col; g.lineWidth = m === 0 ? wd + OL * 2 : wd; g.stroke();
}

function tail(g: G, P: MiloPose, m: number): void {
  const k = 1 - P.front * 0.8;
  g.save();
  g.translate(-geo.wb * 0.78, geo.yb - 7);
  g.rotate(P.tail * 0.35);
  g.beginPath(); g.moveTo(4, 1); g.quadraticCurveTo(-6.5 * k, 2.5, -5.5 * k, -5.5);
  g.strokeStyle = m === 0 ? OUT : CREAM; g.lineWidth = m === 0 ? 4 + OL * 2 : 4; g.stroke();
  oval(g, -5.5 * k, -6.3, 3.2, 3.2); paint(g, PURP, m);
  if (m) { oval(g, -6.2 * k, -7.4, 1.2, 0.9); g.fillStyle = PURP_HI; g.fill(); }
  g.restore();
}

function ear(g: G, i: number, P: MiloPose, m: number): void {
  const s = i ? 1 : -1;
  g.save();
  const attachment=earPlacement(ears,s,geo.fo,P.earDrop,P.earA);
  g.translate(attachment.x,geo.yt+attachment.y);g.rotate(attachment.angle);g.scale(attachment.mirror,1);
  g.beginPath();
  if(ears==='ears-round'){g.ellipse(0,-4,6,6.5,0,0,PI*2);}
  else if(ears==='ears-floppy'){g.moveTo(-2,-2);g.bezierCurveTo(6,-6,13,0,12,10);g.bezierCurveTo(12,21,4,23,2,13);g.bezierCurveTo(1,8,-2,3,-2,-2);g.closePath();}
  else {g.moveTo(-2.9,1.5);const length=ears==='ears-bunny'?25:16;g.bezierCurveTo(-7.3,-5,-4,-length+3,0.6,-length);g.bezierCurveTo(4.8,-length+4,5.4,-4,2.9,1.5);g.closePath();}
  paint(g, TURQ, m);
  if(m&&ears==='ears-floppy'){g.beginPath();g.moveTo(4,2);g.quadraticCurveTo(10,9,6,15);g.strokeStyle=TURQ_HI;g.lineWidth=1.7;g.stroke();}
  if (m && ears!=='ears-floppy') {
    g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(-0.8, -8, 0.4, -12.5);
    g.strokeStyle = TURQ_HI; g.lineWidth = 1.7; g.stroke();
  }
  g.restore();
}

/** Master side-paw geometry — shared by both sides, only mirrored. */
const PAW = { rx: 4.3, ry: 3.1, tilt: 0.22, ax: 0.94, ay: 0.7, out: 1.6 };

/** One tiny plush side paw drawn in a local frame; s=-1 mirrors it for the opposite side. */
function createSidePaw(g: G, s: number, dx: number, dy: number, m: number): void {
  const { yt, h, w } = geo;
  g.save();
  g.translate(s * (w * PAW.ax + PAW.out) + dx, yt + h * PAW.ay + dy);
  g.scale(s, 1);
  g.rotate(PAW.tilt);
  oval(g, 0, 0, PAW.rx, PAW.ry);
  paint(g, CREAM, m);
  g.restore();
}

function sidePaws(g: G, P: MiloPose, m: number): void {
  createSidePaw(g, -1, P.a0x, P.a0y, m); // left paw (mirrored instance)
  createSidePaw(g, 1, P.a1x, P.a1y, m); // right paw (normal instance)
}

function leg(g: G, i: number, P: MiloPose, m: number): void {
  const s = i ? 1 : -1;
  const fx = i ? P.f1x : P.f0x, fy = i ? P.f1y : P.f0y, off = 1.4 * (1 - P.front);
  limb(g, s * 5.4 * Math.min(1.15, P.sx), geo.yb - 2, fx, fy - 4.6, 7.8, CREAM, m);
  oval(g, fx + off, fy - 4.2, 5.7, 3.8);
  if (m && i) { g.strokeStyle = OUT; g.lineWidth = 3.4; g.stroke(); }
  paint(g, PURP, m);
  if (m) { oval(g, fx + off + 1.1, fy - 5.8, 2.35, 1.2); g.fillStyle = PURP_HI; g.fill(); }
}

function body(g: G, m: number): void {
  bodyPath(g); paint(g, CREAM, m);
  if (!m) return;
  const { yt, yb, h, w, fo } = geo;
  g.save(); bodyPath(g); g.clip();
  if(metallic){const sheen=g.createLinearGradient(-w,yt,w,yb);sheen.addColorStop(0,SHADE);sheen.addColorStop(.3,CREAM);sheen.addColorStop(.45,LIGHT);sheen.addColorStop(.55,CREAM);sheen.addColorStop(1,SHADE);g.fillStyle=sheen;g.fillRect(-w,yt,w*2,h);}
  oval(g, -w * 0.3, yb + 3, w * 1.05, h * 0.36); g.fillStyle = SHADE; g.fill();
  oval(g, fo * 0.6 + 1, yb - h * 0.24, w * 0.5, h * 0.22); g.fillStyle = LIGHT; g.fill();
  oval(g, -w * 0.28 + fo * 0.3, yt + h * 0.17, w * 0.3, h * 0.09); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
  g.restore();
}

function eye(g: G, x: number, y: number, rx: number, ry: number, P: MiloPose, s: number): void {
  g.strokeStyle = EYE; g.lineWidth = 2;
  g.beginPath();
  if (P.eye === 1) {
    const d = -s;
    g.moveTo(x - d * 2.6, y - 3); g.lineTo(x + d * 2.2, y); g.lineTo(x - d * 2.6, y + 3); g.stroke(); return;
  }
  if (P.eye === 2) { g.arc(x, y + 1.8, 3.2, PI * 1.1, PI * 1.9); g.stroke(); return; }
  if (P.eye === 3) { g.arc(x, y - 1.2, 3, PI * 0.15, PI * 0.85); g.stroke(); return; }
  if(faceStyle==='face-happy'||faceStyle==='face-wink'&&s===1){g.arc(x,y+1.8,3.2,PI*1.1,PI*1.9);g.stroke();return;}
  if(faceStyle==='face-cool'){g.fillStyle='#232238';g.fillRect(x-5,y-3,10,6);g.strokeRect(x-5,y-3,10,6);g.strokeStyle='#97dfef';g.lineWidth=1;g.beginPath();g.moveTo(x-3,y-2);g.lineTo(x,y+1);g.stroke();return;}
  if(faceStyle==='face-heart'){g.fillStyle='#e878a1';g.moveTo(x,y+4);g.bezierCurveTo(x-8,y-1,x-4,y-7,x,y-3);g.bezierCurveTo(x+4,y-7,x+8,y-1,x,y+4);g.fill();return;}
  if(faceStyle==='face-star'){star(g,x,y,5,2.5);g.fillStyle='#b375d2';g.fill();return;}
  const open = (1 - P.blink) * (faceStyle==='face-sleepy'?.5:1);
  if (open < 0.22) { g.moveTo(x - rx, y + 0.5); g.quadraticCurveTo(x, y + 2, x + rx, y + 0.5); g.stroke(); return; }
  oval(g, x, y, rx, ry * open); g.fillStyle = EYE; g.fill();
  if (open > 0.55) {
    oval(g, x + rx * 0.3, y - ry * open * 0.38, rx * (faceStyle==='face-sparkly'?.62:.38), rx * .38); g.fillStyle = '#ffffff'; g.fill();
    if(faceStyle==='face-sparkly'){g.fillRect(x-1,y-3,2,6);g.fillRect(x-3,y-1,6,2);}
    oval(g, x - rx * 0.28, y + ry * open * 0.42, rx * 0.17, rx * 0.17); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
  }
}

function brow(g: G, x: number, y: number): void {
  g.beginPath(); g.moveTo(x - 2.2, y + 0.5); g.quadraticCurveTo(x, y - 1, x + 2.2, y + 0.5);
  g.strokeStyle = OUT; g.lineWidth = 1.4; g.stroke();
}

function mouth(g: G, x: number, y: number, k: number): void {
  if(faceStyle==='face-cheeky'&&k===0)k=2;
  g.strokeStyle = EYE; g.lineWidth = 1.6;
  g.beginPath();
  if (k === 0) { g.arc(x, y - 1.8, 2.2, PI * 0.22, PI * 0.78); g.stroke(); }
  else if (k === 1) { g.ellipse(x, y, 1.6, 2, 0, 0, PI * 2); g.fillStyle = EYE; g.fill(); }
  else if (k === 2) {
    g.moveTo(x + 3.2, y - 1.2); g.arc(x, y - 1.2, 3.2, 0, PI); g.closePath(); g.fillStyle = EYE; g.fill();
    oval(g, x, y + 0.9, 1.7, 1); g.fillStyle = TONGUE; g.fill();
  } else { g.moveTo(x - 2.2, y); g.quadraticCurveTo(x, y - 1.2, x + 2.2, y); g.stroke(); }
}

function face(g: G, P: MiloPose): void {
  const fo = geo.fo, ey = geo.yt + geo.h * 0.47, side = 1 - P.front;
  const e0 = fo - 6.2, e1 = fo + 6.2, rx = 3.5 * P.wide, ry = 4.9 * P.wide;
  g.fillStyle = CHEEK;
  oval(g, e0 - 3.1, ey + 5.6, 3.05, 1.86); g.fill();
  oval(g, e1 + 3.1, ey + 5.6, 3.05, 1.86); g.fill();
  eye(g, e0, ey, rx * (1 - side * 0.1), ry * (1 - side * 0.06), P, -1);
  eye(g, e1, ey, rx, ry, P, 1);
  if (P.eye === 0) { const by = ey - ry - 2.6; brow(g, e0, by); brow(g, e1, by); }
  if(faceStyle==='face-cool'){g.beginPath();g.moveTo(e0+4,ey-2);g.lineTo(e1-4,ey-2);g.strokeStyle=EYE;g.lineWidth=1.5;g.stroke();}
  mouth(g, fo + 1.2 * side, ey + 6.8, P.mouth);
}

/** Draws the mascot with its feet at the origin, facing +x before `dir` mirroring. */
export function drawMilo(g: G, P: MiloPose, appearance?:Pick<PetState,'color'|'ears'|'face'|'hat'>): void {
  const palette=paletteFor(appearance?.color??'color-cream');
  [CREAM,SHADE,LIGHT,TURQ,TURQ_HI,PURP,PURP_HI]=[palette.body,palette.shade,palette.light,palette.ears,palette.earHi,palette.feet,palette.feetHi];metallic=palette.metallic;
  ears=appearance?.ears??'ears-original';faceStyle=appearance?.face??'face-classic';hat=appearance?.hat??'hat-none';
  setBody(P.sx, P.sy, P.hip, P.bob);
  geo.fo = 4.5 * (1 - P.front);
  g.save();
  g.translate(P.ox, 0);
  g.scale(P.dir, 1);
  if (P.rot) { g.translate(0, -18); g.rotate(P.rot); g.translate(0, 18); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let m = 0; m < 2; m++) {
    tail(g, P, m); ear(g, 0, P, m); sidePaws(g, P, m);
    leg(g, 0, P, m); leg(g, 1, P, m);
    body(g, m);
    if (m) {face(g, P);if(P.eye===4)sidePaws(g,P,m);}
    ear(g, 1, P, m);
  }
  drawHat(g);
  g.restore();
}

/** Body-only silhouette used for the faint high-speed trail. */
export function drawGhost(g: G, sx: number, sy: number, hip: number, bob: number, dir: number, col: string): void {
  setBody(sx, sy, hip, bob);
  g.save(); g.scale(dir, 1); bodyPath(g); g.fillStyle = col; g.fill(); g.restore();
}
function drawHat(g:G){
 if(hat==='hat-none')return;
 g.save();g.translate(0,geo.yt+2);g.lineWidth=2;g.strokeStyle=OUT;
 if(hat==='hat-beanie'){g.fillStyle='#f899bd';g.beginPath();g.ellipse(0,-2,13,10,0,PI,PI*2);g.fill();g.stroke();g.fillStyle='#d96096';g.fillRect(-14,-3,28,5);g.strokeRect(-14,-3,28,5);oval(g,0,-14,4,4);g.fillStyle='#ffe3ed';g.fill();}
 else if(hat==='hat-crown'){g.fillStyle='#ffe087';g.beginPath();g.moveTo(-12,1);g.lineTo(-14,-13);g.lineTo(-6,-7);g.lineTo(0,-18);g.lineTo(6,-7);g.lineTo(14,-13);g.lineTo(12,1);g.closePath();g.fill();g.stroke();oval(g,0,-4,2,3);g.fillStyle='#b679f3';g.fill();}
 else if(hat==='hat-star'){g.fillStyle='#91e7da';g.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?5:11;const x=Math.cos(a)*r,y=-8+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();g.stroke();}
 else if(hat==='hat-cap'){g.fillStyle='#79b7df';g.beginPath();g.ellipse(0,-2,13,10,0,PI,PI*2);g.fill();g.stroke();g.fillStyle='#5482b1';g.beginPath();g.ellipse(8,-2,18,3,0,0,PI*2);g.fill();g.stroke();}
 else if(hat==='hat-wizard'){g.fillStyle='#8565c6';g.beginPath();g.moveTo(-13,-1);g.lineTo(-5,-25);g.lineTo(6,-29);g.lineTo(13,-1);g.closePath();g.fill();g.stroke();g.fillStyle='#b799ef';g.beginPath();g.ellipse(0,-1,18,4,0,0,PI*2);g.fill();g.stroke();star(g,1,-12,4,2);g.fillStyle='#ffe5a1';g.fill();}
 else if(hat==='hat-flower'){g.strokeStyle='#91cb96';g.lineWidth=2;g.beginPath();g.moveTo(5,2);g.lineTo(10,-8);g.stroke();for(let i=0;i<5;i++){const a=i*PI*2/5;oval(g,10+Math.cos(a)*5,-10+Math.sin(a)*5,4,4);g.fillStyle='#fff1e9';g.fill();g.strokeStyle=OUT;g.lineWidth=1;g.stroke();}oval(g,10,-10,3.5,3.5);g.fillStyle='#f5c557';g.fill();}
 else if(hat==='hat-headphones'){g.strokeStyle=OUT;g.lineWidth=6;g.beginPath();g.arc(0,2,19,PI,PI*2);g.stroke();g.strokeStyle='#e6b1f7';g.lineWidth=3;g.stroke();for(const side of [-1,1]){oval(g,side*18,3,5,9);g.fillStyle='#a473ca';g.fill();g.strokeStyle=OUT;g.lineWidth=2;g.stroke();oval(g,side*18-1,2,2,5);g.fillStyle='#f2c5ff';g.fill();}}
 else if(hat==='hat-party'){g.fillStyle='#f29bad';g.beginPath();g.moveTo(-12,1);g.lineTo(0,-27);g.lineTo(12,1);g.closePath();g.fill();g.stroke();g.strokeStyle='#ffe0a2';g.lineWidth=3;g.beginPath();g.moveTo(-7,-8);g.lineTo(7,-8);g.moveTo(-3,-18);g.lineTo(3,-18);g.stroke();oval(g,0,-27,3,3);g.fillStyle='#b7f0db';g.fill();}
 else if(hat==='hat-bow'){g.fillStyle='#ef91c7';for(const side of [-1,1]){g.beginPath();g.moveTo(0,-7);g.bezierCurveTo(side*20,-22,side*20,5,0,-7);g.fill();g.stroke();}oval(g,0,-7,4,4);g.fillStyle='#ffd8ef';g.fill();g.stroke();}

 g.restore();
}

function star(g:G,x:number,y:number,outer:number,inner:number){g.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?inner:outer;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();}
