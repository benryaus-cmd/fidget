/** Visual-only pose for the procedural mascot. Never touches physics. */
export interface MiloPose {
  dir: number; ox: number; bob: number; rot: number; sx: number; sy: number; hip: number; front: number;
  earA: number; earDrop: number; tail: number;
  f0x: number; f0y: number; f1x: number; f1y: number;
  a0x: number; a0y: number; a1x: number; a1y: number;
  blink: number; eye: number; mouth: number; wide: number;
}

export interface Spr { v: number; d: number }

export const newPose = (): MiloPose => ({
  dir: 1, ox: 0, bob: 0, rot: 0, sx: 1, sy: 1, hip: 10, front: 0, earA: 0, earDrop: 0, tail: 0,
  f0x: -6.5, f0y: 0, f1x: 6.5, f1y: 0, a0x: 0, a0y: 0, a1x: 0, a1y: 0,
  blink: 0, eye: 0, mouth: 0, wide: 1,
});

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const approach = (v: number, t: number, d: number) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
export const smooth = (k: number) => {
  const c = clamp01(k);
  return c * c * (3 - 2 * c);
};

/** Damped spring (semi-implicit Euler), frame-rate independent for dt ≤ 50ms. */
export function spring(s: Spr, target: number, k: number, damp: number, dt: number): void {
  s.d += ((target - s.v) * k - s.d * damp) * dt;
  s.v += s.d * dt;
}