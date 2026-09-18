import { Pill } from '../components/diagram/Pill';
import { Walkthrough } from '../components/diagram/Walkthrough';
import type { SlideDef } from '../deck/types';

/** How a touch actually reaches your animation code. */
const GESTURES = [
  {
    active: ['ui', 'touch'],
    caption: <>A touch lands on the UI thread</>,
    sub: 'The OS delivers it to the native view hierarchy. Nothing has reached your JS yet.',
  },
  {
    active: ['ui', 'touch', 'js', 'old'],
    caption: <>React Native's default path goes to JS</>,
    sub: 'The responder system asks the JS thread who should handle this touch. If that thread is busy, your gesture waits.',
  },
  {
    active: ['ui', 'touch', 'recognizer'],
    caption: <>Gesture Handler recognises it natively</>,
    sub: 'RNGH attaches real platform gesture recognizers to the view. Pan, pinch and tap are decided on the UI thread.',
  },
  {
    active: ['ui', 'recognizer', 'worklet'],
    caption: <>Your callbacks are worklets</>,
    sub: 'onBegin, onUpdate and onEnd are compiled into the UI runtime, and the recognizer calls them there directly.',
  },
  {
    active: ['ui', 'touch', 'recognizer', 'worklet', 'shared', 'view'],
    caption: <>Touch to pixels, one thread</>,
    sub: 'The finger moves and the view moves in the same frame. The JS thread is never asked.',
  },
];

function Gestures({ step }: { step: number }) {
  const { active, caption, sub } = GESTURES[Math.min(step, GESTURES.length - 1)];
  const on = (...ids: string[]) => (ids.some((id) => active.includes(id)) ? 1 : 0.16);

  const chips: [string, number, number, string, string][] = [
    ['touch', 46, 118, '#4a90d9', 'touch'],
    ['recognizer', 196, 216, '#4a90d9', 'gesture recognizer'],
    ['worklet', 444, 176, '#6ea8fe', 'your worklet'],
    ['shared', 652, 170, '#56c596', 'shared value'],
    ['view', 854, 172, '#4a90d9', 'native view'],
  ];

  return (
    <Walkthrough step={step} caption={caption} sub={sub}>
      <svg viewBox="0 0 1072 360" className="diagram" role="img"
        aria-label="On the UI thread a touch reaches a native gesture recognizer, which calls your worklet, which writes a shared value and updates the native view. Below, the old path where React Native's responder system round-trips every touch through the JS thread.">
        <defs>
          <marker id="tip3" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#9fb3c8" />
          </marker>
          <marker id="tipOld" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#e07a5f" />
          </marker>
        </defs>

        {/* ---- the UI thread lane ---- */}
        <g opacity={on('ui')}>
          <Pill x={24} y={10} w={110} label="UI thread" />
          <rect x="0" y="44" width="1072" height="150" rx="16"
            fill="rgba(110,168,254,0.07)" stroke="rgba(110,168,254,0.45)" />
        </g>

        {chips.map(([id, x, w, fill, label], i) => (
          <g key={id}>
            {i > 0 && (
              <g opacity={on(id, chips[i - 1][0])}>
                <line x1={x - 30} y1="118" x2={x - 8} y2="118" stroke="#9fb3c8"
                  strokeWidth="2" markerEnd="url(#tip3)" />
              </g>
            )}
            <g opacity={on(id)}>
              <rect x={x} y="92" width={w} height="52" rx="10" fill={fill} />
              <text x={x + w / 2} y="124"
                className={fill === '#4a90d9' ? 'd-chip' : 'd-chip-hot'}
                textAnchor="middle">
                {label}
              </text>
            </g>
          </g>
        ))}

        <g opacity={on('shared', 'view')}>
          <text x="536" y="176" className="d-rt-sub" textAnchor="middle">
            all of this inside one frame
          </text>
        </g>

        {/* ---- the old path, down through JS ---- */}
        <g opacity={on('js')}>
          <Pill x={24} y={204} w={110} label="JS thread" />
          <rect x="0" y="238" width="1072" height="106" rx="16"
            fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.13)" />
        </g>

        <g opacity={on('old')}>
          <path d="M 105 148 L 105 282 L 136 282" fill="none" stroke="#e07a5f"
            strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#tipOld)" />
          <rect x="140" y="252" width="330" height="60" rx="10"
            fill="rgba(224,122,95,0.16)" stroke="#e07a5f" />
          <text x="305" y="288" className="d-old" textAnchor="middle">
            JS decides who responds
          </text>
          <path d="M 474 282 L 940 282 L 940 150" fill="none" stroke="#e07a5f"
            strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#tipOld)" />
          <text x="720" y="330" className="d-old-sub" textAnchor="middle">
            every touch round-trips through JS — this is the path RNGH replaces
          </text>
        </g>
      </svg>
    </Walkthrough>
  );
}

const slide: SlideDef = {
  content: (step: number) => <Gestures step={step} />,
  steps: GESTURES.length,
  notes: `This is where gesture-handler earns its place in the title of the talk. Five presses.

1. A TOUCH LANDS ON THE UI THREAD — worth stating because people assume touches arrive in JS. They don't. The OS hands them to the native view hierarchy, on the UI thread, like any other app.

2. REACT NATIVE'S DEFAULT PATH GOES TO JS — the responder system. Touch events are batched over to the JS thread, JS runs the negotiation (onStartShouldSetResponder and friends), and the answer comes back. That's a round trip per touch, and if the JS thread is mid-render you simply wait. This is why plain PanResponder feels mushy — it isn't Animated's fault, the recognition itself is late.

3. GESTURE HANDLER RECOGNISES IT NATIVELY — RNGH attaches genuine platform recognizers to the view: UIGestureRecognizer subclasses on iOS, its own handler implementation on Android. Pan vs tap vs pinch is decided in native code on the UI thread. JS is not consulted.

4. YOUR CALLBACKS ARE WORKLETS — the tie-in. onBegin / onUpdate / onEnd on a Gesture object are worklets, so they already live in the UI runtime from the last slide. The native recognizer calls straight into them on the same thread. No scheduling, no bridge, no wait.

5. TOUCH TO PIXELS, ONE THREAD — recognizer to worklet to shared value to native view, all inside one frame. That is the actual answer to "how do you get smooth gesture-driven animation".

THINGS THEY WILL ASK:
- Coexisting with a ScrollView: activeOffsetX / failOffsetY, so a mostly-vertical drag fails your pan and lets the scroll take it. Also Gesture.Simultaneous, Gesture.Race and Gesture.Exclusive for composing.
- GestureHandlerRootView has to wrap your app or nothing fires. Everyone hits this once.
- If a callback can't be a worklet, or you call runOnJS inside it, you are back on the JS thread for that part — the slow path from step 2, just with better ergonomics.`,
};

export default slide;
