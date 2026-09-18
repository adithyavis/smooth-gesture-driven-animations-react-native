import type { ReactNode } from 'react';
import { Code } from '../components/Code';
import { Pill } from '../components/diagram/Pill';
import '../components/diagram/diagram.css';
import { DragDemo } from '../components/DragDemo';
import type { SlideDef } from '../deck/types';
import './gesture-driven.css';

const CODE = `const x = useSharedValue(0);
const y = useSharedValue(0);

const pan = Gesture.Pan()
  .onChange((e) => {
    x.value += e.changeX;
    y.value += e.changeY;
  })
  .onEnd(() => {
    x.value = withSpring(0);
    y.value = withSpring(0);
  });

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }, { translateY: y.value }],
}));

<GestureDetector gesture={pan}>
  <Animated.View style={[styles.box, style]} />
</GestureDetector>`;

/** Same title, same phone, on both gesture slides; only the left column changes. */
function GestureLayout({ children }: { children: ReactNode }) {
  return (
    <div className="layout-threads layout-fill layout-gesture">
      <h2>Gesture driven animation</h2>
      <div className="gd-row">
        <div className="gd-left">{children}</div>
        <DragDemo />
      </div>
    </div>
  );
}

export const demo: SlideDef = {
  // The gesture is the new part; the shared values and style are as before.
  content: (
    <GestureLayout>
      <Code lang="jsx" mark={[[4, 12]]}>{CODE}</Code>
    </GestureLayout>
  ),
  notes: `The same pieces as the last slides, now driven by a finger instead of a timer.

x and y — two shared values, like scale before.

THE GESTURE (highlighted) — a pan gesture from React Native Gesture Handler. The recognizer runs natively on the UI thread, and onChange and onEnd are worklets, so they run there too. Every time the finger moves, onChange adds the change to x and y. No trip to the JS thread.

onEnd — the finger lifts, and we hand x and y a spring back to zero. That's the decision Animated couldn't make on the UI thread: "when the finger lets go, do this". Here it's just a function.

useAnimatedStyle — unchanged in spirit: read x and y, return a transform.

GestureDetector — wraps the view so the gesture is attached to it.

THE DEMO — the card follows the finger in the same frame, then springs home when it lets go. Touch in, pixels out, all on one thread.`,
};

/** The JS thread only registers the worklets, once, when Box mounts. */
const REGISTERED = ['useAnimatedStyle', 'onChange', 'onEnd'];

/** Each frame on the UI thread: the gesture callback runs, then the new
 *  translateX is drawn. After the finger lifts, the spring steps on its own. */
const FRAMES: { event?: string; x: number }[] = [
  { event: '+10', x: 10 },
  { event: '+14', x: 24 },
  { event: '+10', x: 34 },
  { event: 'onEnd', x: 20 },
  { x: 4 },
  { x: -3 },
  { x: 0 },
];

const LANE_X = 124;
const REG_W = 146;
/** Where the first frame starts: after the registrations, which come first. */
const F0 = LANE_X + 8 + REG_W + 10;
const FRAME = 96;
const EVENT_W = 48;
const LANE_W = F0 + FRAMES.length * FRAME + 8 - LANE_X;
const W = LANE_X + LANE_W;

const frameX = (i: number) => F0 + i * FRAME;

function GestureTimeline() {
  return (
    <svg viewBox={`0 0 ${W} 280`} className="diagram" role="img"
      aria-label="The JS thread registers useAnimatedStyle, onChange and onEnd once, then stays idle. On the UI thread, each 16ms frame runs the gesture's onChange and then draws the new translateX, one after the other. When the finger lifts, onEnd starts a spring that steps on its own until it settles at 0.">

      {/* JS thread: registrations, then nothing */}
      <g className="col c2">
        <Pill x={0} y={63} w={110} label="JS thread" />
        <rect x={LANE_X} y="30" width={LANE_W} height="92" rx="12"
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
        {REGISTERED.map((name, i) => (
          <g key={name}>
            <rect x={LANE_X + 8} y={38 + i * 26} width={REG_W} height="24" rx="6" fill="#2e9fe0" />
            <text x={LANE_X + 18} y={55 + i * 26} className="gd-reg">{name}</text>
          </g>
        ))}
      </g>

      {/* The worklets cross over once */}
      <g className="col c3">
        <line x1={LANE_X + 8 + REG_W / 2} y1="122" x2={LANE_X + 8 + REG_W / 2} y2="160"
          stroke="#9fb3c8" strokeWidth="1.5" strokeDasharray="3 4" />
        <text x={LANE_X + 8 + REG_W / 2 + 12} y="146" className="gd-note">copied once</text>
      </g>

      {/* UI thread: gesture callback, then the frame, one after the other */}
      <g className="col c4">
        <Pill x={0} y={195} w={110} label="UI thread" />
        <rect x={LANE_X} y="160" width={LANE_W} height="92" rx="12"
          fill="rgba(120,180,240,0.12)" stroke="rgba(120,180,240,0.3)" />
        {FRAMES.map((f, i) => {
          const x = frameX(i);
          const frameStart = f.event ? x + 3 + EVENT_W + 2 : x + 3;
          return (
            <g key={i}>
              {f.event && (
                <>
                  <rect x={x + 3} y="180" width={EVENT_W} height="52" rx="8" fill="#e8a33d" />
                  <text x={x + 3 + EVENT_W / 2} y={f.event === 'onEnd' ? 211 : 212}
                    className={f.event === 'onEnd' ? 'gd-end' : 'gd-delta'} textAnchor="middle">{f.event}</text>
                </>
              )}
              <rect x={frameStart} y="180" width={x + FRAME - 3 - frameStart} height="52" rx="8" fill="#4a90d9" />
              <text x={(frameStart + x + FRAME - 3) / 2} y="212" textAnchor="middle" className="gd-frame">{f.x}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export const timeline: SlideDef = {
  content: (
    <GestureLayout>
      <GestureTimeline />
    </GestureLayout>
  ),
  notes: `The same drag, one frame at a time.

JS THREAD — all it does is register three worklets when Box mounts: the animated style, onChange and onEnd. They're copied to the UI thread once. Then the JS thread sits idle for the entire gesture. Compare that with the Animated timeline, where the JS lane was the whole story.

UI THREAD — one lane, one thing after another. Each frame: the finger moves, the recognizer calls onChange right there (orange, the number is e.changeX), and the new translateX is drawn in the same frame (blue). 10, 24, 34: the card is exactly where the finger is.

onEnd — the finger lifts. onEnd runs on the UI thread too and assigns withSpring(0). From then on there are no more gesture events, just the spring stepping each frame: 20, 4, overshoots to -3, settles at 0.

Touch in, pixels out, all on one thread.`,
};
