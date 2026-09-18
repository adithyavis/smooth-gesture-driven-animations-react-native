import { Code } from '../components/Code';
import { Pill } from '../components/diagram/Pill';
import { DragDemo } from '../components/DragDemo';
import { Phone, SCREEN_H, SCREEN_W } from '../components/Phone';
import '../components/diagram/diagram.css';
import type { SlideDef } from '../deck/types';
import './animated-api.css';

const CODE = `function Box() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 2,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.box, { transform: [{ scale }] }]} />
  );
}`;

/** Same frame grid as the JS-thread drawback slide, so the two read side by side. */
const X0 = 130;
const SLOT = 60;
const SLOTS = 13;

/** The same app work as last time, in the same places. The only animation
 *  work on the JS thread is the one start() call. */
const JS_WORK: { from: number; slots: number; label: string; start?: boolean }[] = [
  { from: 0, slots: 1, label: 'start()', start: true },
  { from: 3, slots: 2, label: 'JSON.parse' },
  { from: 5, slots: 3, label: 'Re-render list' },
  { from: 10, slots: 2, label: 'Navigation' },
];

/** A 1000ms timing from 1 to 2, sampled once a frame by the native driver. */
const FRAMES = Array.from({ length: SLOTS }, (_, i) => (1 + (i + 1) / 60).toFixed(2));

const slotX = (i: number) => X0 + i * SLOT;
const LANE_X = X0 - 6;
const LANE_W = SLOTS * SLOT + 12;
const W = LANE_X + LANE_W;

function HandoffTimeline() {
  return (
    <svg viewBox={`0 0 ${W} 310`} className="diagram" role="img"
      aria-label="Two lanes, one frame per 16ms. The JS thread calls start() once, then is busy with JSON.parse, re-rendering a list and navigation. The UI thread still produces a new scale on every frame.">
      {/* 16ms scale, over the first slot */}
      <g className="col c1">
        <path d={`M${slotX(0) + 2},22 v-6 h${SLOT - 4} v6`} fill="none" stroke="#9fb3c8" strokeWidth="1.5" />
        <text x={slotX(0) + SLOT / 2} y="10" className="d-edge" textAnchor="middle">16ms</text>
      </g>

      {/* JS thread */}
      <g className="col c2">
        <Pill x={0} y={67} w={110} label="JS thread" />
        <rect x={LANE_X} y="30" width={LANE_W} height="92" rx="12"
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
        {JS_WORK.map((w) => (
          <g key={w.from}>
            <rect x={slotX(w.from) + 3} y="50" width={w.slots * SLOT - 6} height="52" rx="8"
              fill={w.start ? '#2e9fe0' : '#e8a33d'} />
            <text x={slotX(w.from) + (w.slots * SLOT) / 2} y="82"
              className={w.start ? 'an-start' : 'an-work'} textAnchor="middle">{w.label}</text>
          </g>
        ))}
      </g>

      {/* The whole animation crosses over once */}
      <g className="col c3">
        <line x1={slotX(0) + SLOT / 2} y1="104" x2={slotX(0) + SLOT / 2} y2="174"
          stroke="#9fb3c8" strokeWidth="1.5" strokeDasharray="3 4" />
        <text x={slotX(1) + 4} y="147" className="an-handoff">
          the whole animation, sent once
        </text>
      </g>

      {/* UI thread */}
      <g className="col c4">
        <Pill x={0} y={199} w={110} label="UI thread" />
        <rect x={LANE_X} y="162" width={LANE_W} height="92" rx="12"
          fill="rgba(120,180,240,0.12)" stroke="rgba(120,180,240,0.3)" />
        {FRAMES.map((scale, i) => (
          <g key={i}>
            <rect x={slotX(i) + 3} y="182" width={SLOT - 6} height="52" rx="8" fill="#4a90d9" />
            <text x={slotX(i) + SLOT / 2} y="214" textAnchor="middle" className="an-frame">{scale}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/** What the native driver can and can't be handed. */
function Menu() {
  return (
    <div>
      <div className="an-menu">
        <div className="off">
          <h3>Not support by Animated</h3>
          <ul>
            <li>Layout animations: width, height, margins</li>
            <li>Gesture-tracking animations</li>
            <li>Interruptions while animating</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: 'Simple animation with Animated',
    left: <Code lang="jsx" mark={[[5, 9]]}>{CODE}</Code>,
  },
  {
    title: 'Simple animation with Animated',
    left: (
      <div>
        <HandoffTimeline />
      </div>
    ),
  },
  {
    title: "Simple animation with Animated",
    left: <Menu />,
    drag: true,
  },
];

const BOX = 56;

function AnimatedApi({ step }: { step: number }) {
  const { title, left, drag } = STEPS[Math.min(step, STEPS.length - 1)];
  const center = { left: (SCREEN_W - BOX) / 2, top: (SCREEN_H - BOX) / 2 };
  return (
    <div className="layout-threads layout-fill layout-animated">
      {/* Keyed by step so the title and left column replay their entrance. */}
      <h2 key={`t${step}`} className="an-title">{title}</h2>
      <div className="an-row">
        <div className="an-left" key={`l${step}`}>{left}</div>
        {drag ? (
          <DragDemo />
        ) : (
          <Phone playing>
            {/* A CSS animation, so the browser runs it off the main thread too. */}
            <div className="an-box an-grow-box" style={{ width: BOX, height: BOX, ...center }} />
          </Phone>
        )}
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: (step: number) => <AnimatedApi step={step} />,
  steps: STEPS.length,
  notes: `The fix React Native shipped first: Animated, with the native driver. Three presses.

1. DECLARE IT UP FRONT — no state, no interval, no re-render. scale is an Animated.Value, not React state. Animated.timing describes the whole animation in one go: from 1 to 2, over a second. Then start() — the imperative bit. The style reads the Animated.Value directly, so React never re-renders Box while it runs.

2. HANDED OVER ONCE — useNativeDriver: true is the whole trick. On start(), Animated serialises that description, the value, the timing, the transform it feeds, into a graph of nodes, and sends it to the native side ONCE. From then on, native code on the UI thread steps the timing every frame and writes the transform straight onto the view.
Point at the top lane: it's the same orange work as the last slide, in the same places. JSON.parse, re-render, navigation. Last time every one of those froze the box. Now the bottom lane moves every single frame, because nothing on it is waiting for JS.

3. THE CATCH — you handed over a description, not code. The native side only knows the node types Animated ships: timing, spring, decay, interpolate, some arithmetic. And it can only drive non-layout props, transform and opacity. Try width with the native driver and it errors.
Anything with a decision in it — "if the card is past halfway, fling it off, else snap back" — can't be expressed. That decision has to go back to the JS thread, which is exactly the thread we were trying to avoid. So gestures that need logic are where Animated runs out.

Transition: "What if, instead of sending a description to the UI thread, we could send real JavaScript?"`,
};

export default slide;
