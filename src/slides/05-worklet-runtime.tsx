import { Pill } from '../components/diagram/Pill';
import { Walkthrough } from '../components/diagram/Walkthrough';
import type { SlideDef } from '../deck/types';

/** What Reanimated actually sets up, a step at a time. */
const RUNTIME = [
  {
    active: ['jsBox', 'uiBox'],
    caption: <>Two JS runtimes</>,
    sub: 'Same language, same app — but separate memory, on separate threads.',
  },
  {
    active: ['jsBox', 'uiBox', 'runOnUI', 'worklet'],
    caption: <>Your worklet is copied across</>,
    sub: 'A marked function is compiled and copied into the UI runtime. It captures a snapshot of what it closed over, not a live reference.',
  },
  {
    active: ['jsBox', 'uiBox', 'worklet', 'shared'],
    caption: <>Shared values are the shared memory</>,
    sub: 'The one thing both runtimes can read and write. This is how state crosses the gap.',
  },
  {
    active: ['uiBox', 'gesture', 'worklet', 'nativeView', 'loop', 'shared'],
    caption: <>Then it runs every frame</>,
    sub: 'Finger moves, worklet reads the shared value, native view updates. All on the UI thread — the JS thread is asleep.',
  },
  {
    active: ['jsBox', 'uiBox', 'runOnJS'],
    caption: <>...and back, only when you need React</>,
    sub: 'runOnJS to set state. It is asynchronous — it lands on a later frame, so never animate through it.',
  },
];

function WorkletRuntime({ step }: { step: number }) {
  const { active, caption, sub } = RUNTIME[Math.min(step, RUNTIME.length - 1)];
  const on = (...ids: string[]) => (ids.some((id) => active.includes(id)) ? 1 : 0.16);

  return (
    <Walkthrough step={step} caption={caption} sub={sub}>
      <svg viewBox="0 0 1072 340" className="diagram" role="img"
        aria-label="A JS runtime on the JS thread and a second JS runtime on the UI thread, joined by shared values. Worklets are copied over with runOnUI; runOnJS crosses back. On the UI thread a gesture event drives the worklet, which updates the native view, every frame.">
        <defs>
          <marker id="tip2" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#9fb3c8" />
          </marker>
        </defs>

        {/* ---- JS thread ---- */}
        <g opacity={on('jsBox')}>
          <Pill x={20} y={36} w={110} label="JS thread" />
          <rect x="0" y="68" width="330" height="224" rx="16"
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" />
          <text x="28" y="122" className="d-rt-name">JS runtime</text>
          <text x="28" y="164" className="d-line">Your components</text>
          <text x="28" y="196" className="d-line">useState, effects</text>
          <text x="28" y="228" className="d-line">fetch, navigation</text>
          <text x="28" y="268" className="d-rt-sub">busy, and that is fine</text>
        </g>

        {/* ---- crossing over ---- */}
        <g opacity={on('runOnUI')}>
          <text x="455" y="80" className="d-edge" textAnchor="middle">runOnUI</text>
          <line x1="332" y1="96" x2="576" y2="96" stroke="#9fb3c8" strokeWidth="2"
            markerEnd="url(#tip2)" />
        </g>

        {/* ---- shared values ---- */}
        <g opacity={on('shared')}>
          <line x1="332" y1="175" x2="378" y2="175" stroke="#9fb3c8" strokeWidth="2"
            markerStart="url(#tip2)" markerEnd="url(#tip2)" />
          <line x1="532" y1="175" x2="578" y2="175" stroke="#9fb3c8" strokeWidth="2"
            markerStart="url(#tip2)" markerEnd="url(#tip2)" />
          <rect x="380" y="120" width="150" height="110" rx="14" fill="#56c596" />
          <text x="455" y="168" className="d-shared" textAnchor="middle">Shared</text>
          <text x="455" y="196" className="d-shared" textAnchor="middle">values</text>
        </g>

        {/* ---- crossing back ---- */}
        <g opacity={on('runOnJS')}>
          <line x1="576" y1="262" x2="332" y2="262" stroke="#9fb3c8" strokeWidth="2"
            markerEnd="url(#tip2)" />
          <text x="455" y="286" className="d-edge" textAnchor="middle">runOnJS</text>
        </g>

        {/* ---- UI thread ---- */}
        <g opacity={on('uiBox')}>
          <Pill x={600} y={6} w={110} label="UI thread" />
          <rect x="580" y="38" width="492" height="282" rx="16"
            fill="rgba(110,168,254,0.07)" stroke="rgba(110,168,254,0.45)" />
          <text x="608" y="88" className="d-rt-name">Worklet runtime</text>
          <text x="608" y="116" className="d-rt-sub">a second JS runtime, right here</text>
        </g>

        <g opacity={on('gesture')}>
          <rect x="608" y="136" width="146" height="46" rx="9" fill="#4a90d9" />
          <text x="681" y="165" className="d-chip" textAnchor="middle">gesture event</text>
        </g>
        <g opacity={on('gesture', 'worklet')}>
          <line x1="758" y1="159" x2="776" y2="159" stroke="#9fb3c8" strokeWidth="2"
            markerEnd="url(#tip2)" />
        </g>
        <g opacity={on('worklet')}>
          <rect x="780" y="136" width="146" height="46" rx="9" fill="#6ea8fe" />
          <text x="853" y="165" className="d-chip-hot" textAnchor="middle">your worklet</text>
        </g>
        <g opacity={on('worklet', 'nativeView')}>
          <line x1="930" y1="159" x2="948" y2="159" stroke="#9fb3c8" strokeWidth="2"
            markerEnd="url(#tip2)" />
        </g>
        <g opacity={on('nativeView')}>
          <rect x="952" y="136" width="104" height="46" rx="9" fill="#4a90d9" />
          <text x="1004" y="165" className="d-chip" textAnchor="middle">native view</text>
        </g>

        {/* ---- the per-frame loop ---- */}
        <g opacity={on('loop')}>
          <path d="M 1004 186 L 1004 216 L 681 216 L 681 190" fill="none"
            stroke="#9fb3c8" strokeWidth="2" markerEnd="url(#tip2)" />
          <text x="843" y="248" className="d-edge" textAnchor="middle">
            every frame — 60 or 120 times a second
          </text>
          <text x="608" y="292" className="d-rt-sub">
            no trip back to the JS thread
          </text>
        </g>
      </svg>
    </Walkthrough>
  );
}

const slide: SlideDef = {
  content: (step: number) => <WorkletRuntime step={step} />,
  steps: RUNTIME.length,
  notes: `This is the "how does it actually work" slide. Five presses.

1. TWO JS RUNTIMES — the thing people don't expect. Your app has more than one JS runtime. Same language, same bundle, but separate memory, one per thread. The UI one is small and exists only to run animation code.

2. YOUR WORKLET IS COPIED ACROSS — a worklet is just a function the Babel plugin marks and compiles so it can be copied into the other runtime. Key word is COPIED. It captures a snapshot of whatever it closed over at the time it was created. If you close over a plain variable and that variable changes later on the JS side, the worklet still sees the old value. This is the single most common source of confusion, so say it slowly.

3. SHARED VALUES ARE THE SHARED MEMORY — the exception to the copying. A shared value is one box of memory both runtimes point at. Writing .value from either side is visible to the other. That is the whole crossing mechanism: worklets are copied, shared values are shared.

4. THEN IT RUNS EVERY FRAME — the loop. A touch lands on the UI thread, the gesture handler calls your worklet there, the worklet writes a style, the native view updates. None of that goes near the JS thread. Point at the dark left half: your components can be re-rendering, fetching, parsing, and this loop still hits every frame.

5. AND BACK, ONLY WHEN YOU NEED REACT — runOnJS. Use it to setState when a gesture ends, to navigate, to fire analytics. It is ASYNCHRONOUS — it gets scheduled on the JS thread and lands a frame or more later. So never put runOnJS in the per-frame path; it will be janky and it will be your fault, not Reanimated's.

If asked "why not just one runtime": because the JS thread can block, and a blocked animation is worse than a blocked screen.`,
};

export default slide;
