import { useEffect, useRef } from 'react';
import { clamp01, lerp, settle, TAP_UP, tapAt } from './motion';
import { Phone, placeFinger, SCREEN_H, SCREEN_W } from './Phone';
import './PhotoGrid.css';

/* ---------- The grid ---------- */
const COLS = 3;
const GAP = 2;
const GRID_TOP = 56;
const TILE = (SCREEN_W - GAP * (COLS - 1)) / COLS;
const HUES = [12, 200, 140, 280, 35, 180, 330, 95, 220, 20, 160, 260, 50, 300, 190];
const photo = (hue: number) =>
  `linear-gradient(160deg, hsl(${hue} 72% 64%), hsl(${hue + 30} 62% 30%))`;

type Rect = { x: number; y: number; w: number; h: number };
const tileRect = (i: number): Rect => ({
  x: (i % COLS) * (TILE + GAP),
  y: GRID_TOP + Math.floor(i / COLS) * (TILE + GAP),
  w: TILE,
  h: TILE,
});
/** The opened photo: full width, 4:5, centred. */
const FULL_H = (SCREEN_W * 5) / 4;
const FULL: Rect = { x: 0, y: (SCREEN_H - FULL_H) / 2, w: SCREEN_W, h: FULL_H };
const BACK = { x: 24, y: 44 };

/* ---------- The script ----------
 * Each loop: tap a photo, look at it, tap back. A different photo each time. */
const TAPPED = [4, 9, 1];
const LOOP = 4.4;
const OPEN_TAP = 0;
const CLOSE_TAP = 1.9;
const OPEN_AT = OPEN_TAP + TAP_UP;
const CLOSE_AT = CLOSE_TAP + TAP_UP;

function sample(t: number, mode: 'cut' | 'shared') {
  const tile = TAPPED[Math.floor(t / LOOP) % TAPPED.length];
  const l = t % LOOP;

  // 0 is the grid, 1 is the photo full screen.
  const open =
    mode === 'shared'
      ? settle(l - OPEN_AT) - settle(l - CLOSE_AT)
      : l >= OPEN_AT && l < CLOSE_AT ? 1 : 0;

  const onBack = l >= CLOSE_TAP;
  const from = tileRect(tile);
  const tap = tapAt(l - (onBack ? CLOSE_TAP : OPEN_TAP));
  const fingerAt = onBack ? BACK : { x: from.x + from.w / 2, y: from.y + from.h / 2 };

  return { tile, open, from, tap, fingerAt };
}

/**
 * A phone showing a photo grid, driven by a scripted finger.
 * `cut` swaps screens instantly; `shared` grows the tapped photo into place and back.
 */
export function PhotoGrid({ mode, playing }: { mode: 'cut' | 'shared'; playing: boolean }) {
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const backdrop = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const finger = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    // Written straight to the DOM every frame: no React render in the loop.
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const { tile, open, from, tap, fingerAt } = sample((now - start) / 1000, mode);
      const shown = open > 0.001;

      tiles.current.forEach((el, i) => {
        // The tapped photo has left the grid, so its cell is empty.
        el!.style.visibility = shown && i === tile ? 'hidden' : 'visible';
      });
      backdrop.current!.style.opacity = String(clamp01(open));
      back.current!.style.opacity = String(clamp01((open - 0.5) / 0.5));

      const img = image.current!.style;
      img.visibility = shown ? 'visible' : 'hidden';
      img.background = photo(HUES[tile]);
      img.left = `${lerp(from.x, FULL.x, open)}px`;
      img.top = `${lerp(from.y, FULL.y, open)}px`;
      img.width = `${lerp(from.w, FULL.w, open)}px`;
      img.height = `${lerp(from.h, FULL.h, open)}px`;

      placeFinger(finger.current!, fingerAt.x, fingerAt.y, tap);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, playing]);

  return (
    <Phone playing={playing} fingerRef={finger}>
      <div className="phone-title">Photos</div>
      {HUES.map((hue, i) => {
        const r = tileRect(i);
        return (
          <div key={i} ref={(el) => { tiles.current[i] = el; }} className="pg-tile"
            style={{ left: r.x, top: r.y, width: r.w, height: r.h, background: photo(hue) }} />
        );
      })}
      <div ref={backdrop} className="pg-backdrop" style={{ opacity: 0 }} />
      <div ref={image} className="pg-image" style={{ visibility: 'hidden' }} />
      <div ref={back} className="pg-back" style={{ left: BACK.x - 14, top: BACK.y - 14, opacity: 0 }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </div>
    </Phone>
  );
}
