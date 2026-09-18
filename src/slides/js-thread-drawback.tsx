import { Pill } from '../components/diagram/Pill';
import '../components/diagram/diagram.css';
import type { SlideDef } from '../deck/types';
import './js-thread-drawback.css';

/** One slot is one frame, 16ms. */
const X0 = 160;
const SLOT = 70;

/** What the JS thread is doing, slot by slot. A tick is the animation's
 *  setScale; everything else is ordinary app work that happens to be queued. */
const JS_WORK: { from: number; slots: number; label: string; tick?: boolean }[] = [
  { from: 0, slots: 1, label: 'tick', tick: true },
  { from: 1, slots: 1, label: 'tick', tick: true },
  { from: 2, slots: 1, label: 'tick', tick: true },
  { from: 3, slots: 2, label: 'JSON.parse' },
  { from: 5, slots: 3, label: 'Re-render list' },
  { from: 8, slots: 1, label: 'tick', tick: true },
  { from: 9, slots: 1, label: 'tick', tick: true },
  { from: 10, slots: 2, label: 'Navigation' },
  { from: 12, slots: 1, label: 'tick', tick: true },
];

/** The scale each frame shows. It only moves when a tick got through. */
const FRAMES = ['1.05', '1.10', '1.15', '1.15', '1.15', '1.15', '1.15', '1.15',
  '1.20', '1.25', '1.25', '1.25', '1.30'];
const updated = (i: number) => JS_WORK.some((w) => w.tick && w.from === i);

/** Runs of frames where the box didn't move. */
const FROZEN = [{ from: 3, slots: 5 }, { from: 10, slots: 2 }];

const slotX = (i: number) => X0 + i * SLOT;

function ThreadsTimeline() {
  return (
    <svg viewBox="0 0 1072 300" className="diagram" role="img"
      aria-label="Two lanes, one frame per 16ms. On the JS thread, animation ticks are interrupted by JSON.parse, re-rendering a list and navigation. On the UI thread, the box's scale stops changing for every frame where a tick didn't get through.">
      {/* 16ms scale, over the first slot */}
      <g className="col c1">
        <path d={`M${slotX(0) + 2},22 v-6 h${SLOT - 4} v6`} fill="none" stroke="#9fb3c8" strokeWidth="1.5" />
        <text x={slotX(0) + SLOT / 2} y="10" className="d-edge" textAnchor="middle">16ms</text>
      </g>

      {/* JS thread */}
      <g className="col c2">
        <Pill x={0} y={67} w={110} label="JS thread" />
        <rect x={X0 - 10} y="30" width={1072 - X0 + 10} height="92" rx="12"
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
        {JS_WORK.map((w) => (
          <g key={w.from}>
            <rect x={slotX(w.from) + 4} y="50" width={w.slots * SLOT - 8} height="52" rx="8"
              fill={w.tick ? '#2e9fe0' : '#e8a33d'} />
            <text x={slotX(w.from) + (w.slots * SLOT) / 2} y="82"
              className={w.tick ? 'jd-tick' : 'jd-work'} textAnchor="middle">{w.label}</text>
          </g>
        ))}
      </g>

      {/* A tick's new scale crossing over to the UI thread */}
      <g className="col c3">
        {FRAMES.map((_, i) => updated(i) && (
          <line key={i} x1={slotX(i) + SLOT / 2} y1="104" x2={slotX(i) + SLOT / 2} y2="162"
            stroke="#9fb3c8" strokeWidth="1.5" strokeDasharray="3 4" />
        ))}
      </g>

      {/* UI thread */}
      <g className="col c4">
        <Pill x={0} y={187} w={110} label="UI thread" />
        <rect x={X0 - 10} y="150" width={1072 - X0 + 10} height="92" rx="12"
          fill="rgba(120,180,240,0.12)" stroke="rgba(120,180,240,0.3)" />
        {FRAMES.map((scale, i) => (
          <g key={i}>
            <rect x={slotX(i) + 4} y="170" width={SLOT - 8} height="52" rx="8"
              fill={updated(i) ? '#4a90d9' : 'none'}
              stroke={updated(i) ? 'none' : 'rgba(240,140,110,0.7)'}
              strokeDasharray={updated(i) ? undefined : '4 4'} />
            <text x={slotX(i) + SLOT / 2} y="202" textAnchor="middle"
              className={updated(i) ? 'jd-frame' : 'jd-stale'}>{scale}</text>
          </g>
        ))}
      </g>

      {/* Where the box visibly stops */}
      <g className="col c5">
        {FROZEN.map((f) => (
          <g key={f.from}>
            <path d={`M${slotX(f.from) + 4},254 v8 h${f.slots * SLOT - 8} v-8`}
              fill="none" stroke="#f0b4a1" strokeWidth="1.5" />
            <text x={slotX(f.from) + (f.slots * SLOT) / 2} y="288" className="jd-frozen"
              textAnchor="middle">box frozen</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function JsThreadDrawback() {
  return (
    <div className="layout-threads layout-fill">
      <h2>Simple animation</h2>
      <div>
        <ThreadsTimeline />
        <p className="jd-takeaway">
          The animation waits in line with everything else on the JS thread.
        </p>
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: <JsThreadDrawback />,
  notes: `Why the last slide's animation breaks in a real app.

TOP LANE — the JS thread, one box per 16ms frame. The blue ticks are our setScale. The orange blocks are normal app work: parsing an API response, re-rendering a list, a navigation transition. JS runs one thing at a time, so the tick has to wait its turn.

BOTTOM LANE — the UI thread still draws every 16ms. It just has nothing new to draw. Follow the numbers: 1.15 sits there for five frames, then jumps. That's the stutter people see.

setInterval doesn't catch up on missed ticks either, so the animation doesn't just pause, it also runs late.

None of the orange work is a bug. It's what apps do. The problem is putting the animation on the same thread.

Transition: "So move the animation to the thread that draws the frames."`,
};

export default slide;
