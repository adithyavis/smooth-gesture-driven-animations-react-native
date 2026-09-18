import { useEffect, useRef } from 'react';
import { easeOut } from './motion';
import { Phone } from './Phone';
import './ListEntrance.css';

const ROWS = [
  { hue: 12, name: 92, preview: 128 },
  { hue: 200, name: 70, preview: 112 },
  { hue: 140, name: 104, preview: 132 },
  { hue: 280, name: 78, preview: 100 },
  { hue: 35, name: 88, preview: 124 },
  { hue: 330, name: 64, preview: 116 },
  { hue: 180, name: 96, preview: 108 },
];

/* ---------- The script ----------
 * Plays once, when the slide appears. */
const ENTER_AT = 0.3;
/** Identical on both sides; only the start times differ. */
const DURATION = 0.5;
const RISE = 28;
const STAGGER = 0.07;

/**
 * A phone whose list rows slide up into place.
 * `together` starts every row at once; `staggered` starts them one after another.
 */
export function ListEntrance({ mode, playing }: { mode: 'together' | 'staggered'; playing: boolean }) {
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!playing) return;
    // Written straight to the DOM every frame: no React render in the loop.
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const l = (now - start) / 1000;
      rows.current.forEach((el, i) => {
        const delay = mode === 'staggered' ? i * STAGGER : 0;
        const p = easeOut((l - ENTER_AT - delay) / DURATION);
        el!.style.opacity = String(p);
        el!.style.transform = `translateY(${(1 - p) * RISE}px)`;
      });
      // Stop once the last row has landed.
      const end = ENTER_AT + (mode === 'staggered' ? (ROWS.length - 1) * STAGGER : 0) + DURATION;
      if (l < end) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, playing]);

  return (
    <Phone playing={playing}>
      <div className="phone-title">Messages</div>
      <div className="le-list">
        {ROWS.map(({ hue, name, preview }, i) => (
          <div key={i} ref={(el) => { rows.current[i] = el; }} className="le-row"
            // Hidden from the first paint, so nothing flashes before the entrance.
            style={playing ? { opacity: 0 } : undefined}>
            <div className="le-avatar" style={{ background: `hsl(${hue} 65% 58%)` }} />
            <div className="le-lines">
              <div className="le-name" style={{ width: name }} />
              <div className="le-preview" style={{ width: preview }} />
            </div>
            <div className="le-time" />
          </div>
        ))}
      </div>
    </Phone>
  );
}
