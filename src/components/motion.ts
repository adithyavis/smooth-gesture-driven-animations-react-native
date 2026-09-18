/* Timing helpers shared by the scripted demos. Every demo is a pure function
 * of time, so these take seconds and return a progress or a pose. */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Critically damped spring from 0 to 1: fast out, soft landing, no wobble. */
export const settle = (t: number, stiffness = 16) =>
  t <= 0 ? 0 : 1 - (1 + stiffness * t) * Math.exp(-stiffness * t);

/** A tap, in seconds from its start: fade in, press, lift, fade out. */
export const TAP_UP = 0.55;
export function tapAt(local: number) {
  const IN = 0.25, DOWN = 0.4, OUT = 0.8;
  const opacity =
    local < 0 || local > OUT ? 0
    : local < IN ? local / IN
    : local < TAP_UP ? 1
    : 1 - (local - TAP_UP) / (OUT - TAP_UP);
  return { opacity, pressed: local >= DOWN && local < TAP_UP };
}
