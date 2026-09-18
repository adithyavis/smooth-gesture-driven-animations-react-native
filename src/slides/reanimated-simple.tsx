import type { ReactNode } from 'react';
import { Code } from '../components/Code';
import { Pill } from '../components/diagram/Pill';
import { Phone, SCREEN_H, SCREEN_W } from '../components/Phone';
import type { SlideDef } from '../deck/types';
import './reanimated-simple.css';

const CODE = `function Box() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(2, { duration: 1000 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.box, style]} />;
}`;

const BOX = 56;
const TITLE = 'Simple animation with Reanimated';

/** Shared by every Reanimated slide, so the title stays put from one to the next. */
function ReanimatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="layout-threads layout-fill layout-reanimated">
      <h2>{TITLE}</h2>
      {children}
    </div>
  );
}

export const demo: SlideDef = {
  // The three Reanimated pieces, in the order the next slide builds them.
  content: (
    <ReanimatedLayout>
      <div className="ra-row">
        <div className="ra-left"><Code lang="jsx" mark={[[2, 2], [5, 5], [8, 10]]}>{CODE}</Code></div>
        <Phone playing>
          <div className="ra-box"
            style={{
              width: BOX,
              height: BOX,
              left: (SCREEN_W - BOX) / 2,
              top: (SCREEN_H - BOX) / 2,
            }} />
        </Phone>
      </div>
    </ReanimatedLayout>
  ),
  notes: `Same box, same animation, now with Reanimated. Three highlighted pieces, and the next slide shows where each one lives.

useSharedValue — scale isn't React state and isn't an Animated.Value. It's a shared value: one value that both threads can see. Changing it never re-renders Box.

withTiming — assigning an animation to .value. Looks like Animated.timing, but withTiming is itself a worklet: the animation is JavaScript that runs on the UI thread.

useAnimatedStyle — the big difference from Animated. This is a function you write, and it runs on the UI thread every time scale changes. It can have ifs, maths, clamps, whatever you like. That's what Animated couldn't do.

Transition: "So where does each of these actually run?"`,
};

/** A step at a time: the shared value, then the animation writing it, then
 *  the style reading it, then all of it on a loop with JS left out. `mark` is
 *  the code the lit part of the diagram came from. */
const STEPS: { active: string[]; mark: [number, number][] }[] = [
  { active: ['uiBox', 'jsi', 'shared', 'jsShared'], mark: [[2, 2]] },
  { active: ['uiBox', 'jsi', 'shared', 'jsTiming', 'timing', 'write'], mark: [[5, 5]] },
  { active: ['uiBox', 'jsi', 'shared', 'jsStyle', 'style', 'read', 'view'], mark: [[8, 10]] },
  { active: ['uiBox', 'jsi', 'shared', 'timing', 'write', 'style', 'read', 'view', 'frame', 'loop'], mark: [] },
];

/** Row centres, shared by both runtimes so the arrows run straight across. */
const ROW_TIMING = 143;
const ROW_SHARED = 222;
const ROW_STYLE = 301;

/** The UI thread, JSI included. The code beside it stands in for the JS thread,
 *  so the crossings start at the left edge, coming out of the code. */
function ArchitectureDiagram({ active }: { active: string[] }) {
  const on = (...ids: string[]) => (ids.some((id) => active.includes(id)) ? 1 : 0.16);

  return (
    <svg viewBox="0 0 566 360" className="diagram" role="img"
      aria-label="The shared value sits behind JSI, between the JS thread and the worklet runtime on the UI thread. useSharedValue creates it; withTiming and useAnimatedStyle are sent to the UI runtime once. There, every new frame steps withTiming, which writes the shared value; the animated style reads it and updates the native view.">
      <defs>
        <marker id="tip3" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#9fb3c8" />
        </marker>
      </defs>

      {/* ---- UI thread, with JSI as its first column ---- */}
      <g opacity={on('uiBox')}>
        <Pill x={60} y={6} w={110} label="UI thread" />
        <rect x="40" y="38" width="526" height="312" rx="16"
          fill="rgba(110,168,254,0.07)" stroke="rgba(110,168,254,0.45)" />
        <text x="182" y="88" className="d-rt-name">Worklet runtime</text>
      </g>

      {/* ---- JSI, with the shared value in it ---- */}
      <g opacity={on('jsi')}>
        <rect x="40" y="38" width="120" height="312" rx="14"
          fill="rgba(62,143,208,0.14)" stroke="rgba(62,143,208,0.5)" />
        <text x="100" y="72" className="d-jsi" textAnchor="middle">JSI</text>
      </g>
      <g opacity={on('shared')}>
        <rect x="50" y={ROW_SHARED - 36} width="100" height="72" rx="12" fill="#56c596" />
        <text x="100" y={ROW_SHARED - 5} className="d-shared" textAnchor="middle">Shared</text>
        <text x="100" y={ROW_SHARED + 20} className="d-shared" textAnchor="middle">value</text>
        <text x="100" y={ROW_SHARED + 58} className="ra-host" textAnchor="middle">JSI HostObject</text>
      </g>

      {/* ---- crossings from the JS thread, each made once ---- */}
      <g opacity={on('jsShared')}>
        <line x1="0" y1={ROW_SHARED} x2="48" y2={ROW_SHARED} stroke="#9fb3c8" strokeWidth="2"
          markerEnd="url(#tip3)" />
      </g>
      <g opacity={on('jsTiming')}>
        <line x1="0" y1={ROW_TIMING} x2="198" y2={ROW_TIMING} stroke="#9fb3c8" strokeWidth="2"
          markerEnd="url(#tip3)" />
      </g>
      <g opacity={on('jsStyle')}>
        <line x1="0" y1={ROW_STYLE} x2="198" y2={ROW_STYLE} stroke="#9fb3c8" strokeWidth="2"
          markerEnd="url(#tip3)" />
      </g>

      <g opacity={on('timing')}>
        <rect x="200" y={ROW_TIMING - 23} width="150" height="46" rx="9" fill="#6ea8fe" />
        <text x="275" y={ROW_TIMING + 6} className="d-chip-hot" textAnchor="middle">withTiming</text>
      </g>
      <g opacity={on('frame')}>
        <path d={`M 469 ${ROW_STYLE - 25} V ${ROW_TIMING} H 354`} fill="none" stroke="#9fb3c8"
          strokeWidth="2" markerEnd="url(#tip3)" />
        <text x="449" y={ROW_TIMING - 5 } className="d-chip" textAnchor="middle">every frame</text>
      </g>

      {/* The animation writes the value; the style reads it back. */}
      <g opacity={on('write')}>
        <path d={`M 240 ${ROW_TIMING + 25} V ${ROW_SHARED - 14} H 152`} fill="none"
          stroke="#9fb3c8" strokeWidth="2" markerEnd="url(#tip3)" />
        <text x="250" y={ROW_SHARED - 26} className="d-edge">writes</text>
      </g>
      <g opacity={on('read')}>
        <path d={`M 150 ${ROW_SHARED + 14} H 310 V ${ROW_STYLE - 27}`} fill="none"
          stroke="#9fb3c8" strokeWidth="2" markerEnd="url(#tip3)" />
        <text x="320" y={ROW_SHARED + 44} className="d-edge">reads</text>
      </g>

      <g opacity={on('style')}>
        <rect x="200" y={ROW_STYLE - 23} width="150" height="46" rx="9" fill="#6ea8fe" />
        <text x="275" y={ROW_STYLE + 6} className="d-chip-hot" textAnchor="middle">animated style</text>
      </g>
      <g opacity={on('view')}>
        <line x1="354" y1={ROW_STYLE} x2="392" y2={ROW_STYLE} stroke="#9fb3c8" strokeWidth="2"
          markerEnd="url(#tip3)" />
        <rect x="394" y={ROW_STYLE - 23} width="150" height="46" rx="9" fill="#4a90d9" />
        <text x="469" y={ROW_STYLE + 6} className="d-chip" textAnchor="middle">native view</text>
      </g>     
    </svg>
  );
}

function ReanimatedArchitecture({ step }: { step: number }) {
  const { active, mark } = STEPS[Math.min(step, STEPS.length - 1)];
  // On the last step the loop runs without JS, so the code steps back too.
  const jsIdle = mark.length === 0;
  return (
    <ReanimatedLayout>
      <div className="ra-arch">
        <div className={`ra-arch-code ${jsIdle ? 'idle' : ''}`}>
          <div className="ra-pill">JS thread</div>
          <Code lang="jsx" mark={mark}>{CODE}</Code>
        </div>
        <ArchitectureDiagram active={active} />
      </div>
    </ReanimatedLayout>
  );
}

export const architecture: SlideDef = {
  content: (step: number) => <ReanimatedArchitecture step={step} />,
  steps: STEPS.length,
  notes: `Where each highlighted line from the last slide actually lives. Four presses.

1. useSharedValue — the value sits between the two runtimes, behind JSI. Both sides can get at it.
If someone asks "is it a HostObject?": in Reanimated 2, yes, the shared value was literally a C++ jsi::HostObject. From Reanimated 3 on, the value itself lives in the UI runtime, and what sits in C++ is a handle to it: a HostObject both runtimes reference. Writing .value from JS is sent to the UI thread and applied later; reading .value from JS is a blocking call into the UI runtime. Same picture, one value, reachable from both.

2. withTiming — the right-hand side of that assignment is an animation object, and it's made of worklets. Assigning it hands it to the UI runtime, once. From then on, the animation computes the next value and writes the shared value.

3. useAnimatedStyle — the function you pass is a worklet too, copied to the UI runtime once. It reads the shared value and returns a style. Reanimated tracks what it reads, so it re-runs whenever scale changes, and applies the result straight to the native view.

4. Every frame — the screen asks for a new frame, withTiming steps, writes the value, the style re-runs, the view updates. Point at the left half: it's dimmed because it's not involved. The JS thread can be as busy as the last demo and none of this waits.

The difference from Animated: the UI thread isn't running a fixed menu of node types. It's running your JavaScript.

Transition: "Which raises the question: how is there JavaScript running on the UI thread at all?"`,
};
