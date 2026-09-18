import { useEffect, useRef } from 'react';
import './touch.css';
import './VolumeSlider.css';

/** Rest size of the pill, and where it sits inside the fixed-size stage. */
const W = 96;
const H = 250;
const STAGE_W = 220;
const STAGE_H = 420;
const TOP = (STAGE_H - H) / 2;
const FINGER = 46;
const IDLE_VOLUME = 0.45;

/* ---------- The scripted finger ----------
 * Positions are fractions of the pill's height: 0 is the bottom, 1 the top.
 * Going past 0 or 1 means the finger has left the pill. Each stroke starts
 * where the last one left the volume, so the loop runs seamlessly. */
const STROKES = [
  { at: 0, from: IDLE_VOLUME, to: 1.25 }, // up, past max
  { at: 2.7, from: 1, to: -0.25 }, //       down, past min
  { at: 5.4, from: 0, to: IDLE_VOLUME }, // back to where we began
];
const LOOP = 8.1;

/** Seconds into each stroke. */
const APPEAR = 0.25;
const PRESS = 0.35;
const MOVE_START = 0.45;
const MOVE_END = 1.65;
const RELEASE = 2.05;
const GONE = 2.3;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** The further you pull, the less it gives (UIScrollView's formula). */
const MAX_STRETCH = 60;
const rubberBand = (px: number) => (1 - 1 / ((px * 0.55) / MAX_STRETCH + 1)) * MAX_STRETCH;

/** Damped spring from 1 to 0, with a little overshoot. */
const OMEGA = 2 * Math.PI * 2.4;
const ZETA = 0.5;
const OMEGA_D = OMEGA * Math.sqrt(1 - ZETA * ZETA);
const spring = (t: number) =>
  Math.exp(-ZETA * OMEGA * t) * (Math.cos(OMEGA_D * t) + ((ZETA * OMEGA) / OMEGA_D) * Math.sin(OMEGA_D * t));

function sample(t: number) {
  let stroke = STROKES[0];
  for (const s of STROKES) if (t >= s.at) stroke = s;
  const local = t - stroke.at;

  const move = easeInOut(clamp01((local - MOVE_START) / (MOVE_END - MOVE_START)));
  const p = stroke.from + (stroke.to - stroke.from) * move;
  const pressed = local >= PRESS && local < RELEASE;
  const opacity =
    local < APPEAR ? local / APPEAR : local < RELEASE ? 1 : clamp01(1 - (local - RELEASE) / (GONE - RELEASE));

  // How far past the limit the finger is, in px. Positive is past the top.
  const overflow = (x: number) => (x - clamp01(x)) * H;
  const pulled = overflow(pressed ? p : stroke.to);
  const released = local >= RELEASE;
  const stretch = pressed || released ? rubberBand(Math.abs(pulled)) * (released ? spring(local - RELEASE) : 1) : 0;

  return { volume: clamp01(p), p, pressed, opacity, stretch, up: pulled >= 0 };
}

/**
 * An iOS-style volume slider, driven by a scripted finger.
 * `plain` stops dead at the limits; `rubber` stretches past them and springs back.
 */
export function VolumeSlider({ mode, playing }: { mode: 'plain' | 'rubber'; playing: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const finger = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    // Written straight to the DOM every frame: no React render in the loop.
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const s = sample(((now - start) / 1000) % LOOP);
      const stretch = mode === 'rubber' ? s.stretch : 0;
      const height = H + stretch;
      const width = W - stretch * 0.45;

      const tr = track.current!.style;
      tr.height = `${height}px`;
      tr.width = `${width}px`;
      tr.left = `${(STAGE_W - width) / 2}px`;
      // Grow toward the finger: keep the far edge pinned.
      tr.top = `${s.up ? TOP - stretch : TOP}px`;
      fill.current!.style.height = `${s.volume * height}px`;

      const f = finger.current!.style;
      f.top = `${TOP + H - s.p * H - FINGER / 2}px`;
      f.opacity = String(s.opacity);
      f.transform = `scale(${s.pressed ? 0.86 : 1})`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, playing]);

  return (
    <div className={`vs-stage ${playing ? '' : 'idle'}`} style={{ width: STAGE_W, height: STAGE_H }}>
      <div ref={track} className="vs-track" style={{ top: TOP, left: (STAGE_W - W) / 2, width: W, height: H }}>
        <div ref={fill} className="vs-fill" style={{ height: IDLE_VOLUME * H }} />
        <svg className="vs-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9.5h3.6L11 5.6v12.8l-4.4-3.9H3z" fill="currentColor" />
          <path d="M14.5 9a4 4 0 0 1 0 6M17 6.5a7.5 7.5 0 0 1 0 11" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      {playing && (
        <div ref={finger} className="touch-finger"
          style={{ width: FINGER, height: FINGER, left: (STAGE_W - FINGER) / 2, opacity: 0 }} />
      )}
    </div>
  );
}
