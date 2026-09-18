import { ArchitectureChart } from '../components/diagram/ArchitectureChart';
import { Walkthrough } from '../components/diagram/Walkthrough';
import type { SlideDef } from '../deck/types';

/** One <View /> walked through the chart, a step at a time. */
const JOURNEY = [
  {
    active: ['react'],
    caption: <>You write a {'<View />'}</>,
    sub: 'Just a description. Nothing exists on screen yet.',
  },
  {
    active: ['metro', 'bundle'],
    caption: <>Metro bundles it</>,
    sub: 'One JS file, running in Hermes on the JS thread.',
  },
  {
    active: ['bundle', 'jsi'],
    caption: <>It crosses JSI</>,
    sub: 'JS calls straight into C++. No JSON, no queue, no waiting.',
  },
  {
    active: ['jsi', 'renderer'],
    caption: <>The renderer makes a shadow node</>,
    sub: 'A C++ copy of your element, in the shadow tree.',
  },
  {
    active: ['renderer', 'yoga'],
    caption: <>Yoga measures it</>,
    sub: 'Flexbox on the shadow thread works out size and position.',
  },
  {
    active: ['renderer', 'nativeUI'],
    caption: <>It becomes a real view</>,
    sub: 'UIView on iOS, android.view.View on Android. Now it is on screen.',
  },
  {
    active: ['worklet', 'nativeUI'],
    caption: <>Now animate it</>,
    sub: 'The worklet moves that native view every frame — the left half of this chart is not involved.',
  },
];

function ViewJourney({ step }: { step: number }) {
  const { active, caption, sub } = JOURNEY[Math.min(step, JOURNEY.length - 1)];
  return (
    <Walkthrough step={step} caption={caption} sub={sub}>
      <ArchitectureChart active={active} />
    </Walkthrough>
  );
}

const slide: SlideDef = {
  content: (step: number) => <ViewJourney step={step} />,
  steps: JOURNEY.length,
  notes: `Same chart, one step per arrow press. Let each step land before you press again — the whole point is that they watch one thing light up at a time.

1. YOU WRITE A <View /> — stress that it is not a view. It's a plain JS object describing what you want. Nothing is on screen.

2. METRO BUNDLES IT — your app becomes one JS file, running in Hermes on the JS thread. Same thread as your state and effects.

3. IT CROSSES JSI — JS calls directly into C++ and gets a result back. The old bridge serialised to JSON and posted it on a queue; this doesn't. Worth pausing here, it's the foundation for everything after.

4. THE RENDERER MAKES A SHADOW NODE — Fabric builds a C++ mirror of your element in the shadow tree.

5. YOGA MEASURES IT — flexbox runs on the shadow thread and produces size and position for every node. Off the JS thread, so a heavy layout doesn't freeze your app.

6. IT BECOMES A REAL VIEW — the tree is committed and mounted: UIView on iOS, android.view.View on Android. Only now is anything drawn. Mention view flattening if you like: pure-layout Views may produce no native view at all.

7. NOW ANIMATE IT — the payoff. Point at how much of the chart is dark. The worklet runtime sits on the UI thread next to the mounted view, so a gesture reads a value and sets that view's transform every frame without crossing back over JSI. Steps 1-6 happen once, at mount. Step 7 happens 60 or 120 times a second.

Line to land it on: "everything on the left can be busy, and the animation still hits every frame." Then go to the demo.`,
};

export default slide;
