import { ArchitectureChart } from '../components/diagram/ArchitectureChart';
import type { SlideDef } from '../deck/types';

function Threads() {
  return (
    <div className="layout-threads">
      <h2>How React Native Renders</h2>
      <ArchitectureChart />
    </div>
  );
}

const slide: SlideDef = {
  content: <Threads />,
  notes: `Don't read the whole diagram out. Trace one path: React on the left, pixels on the right. Everything else is there for the people who already know it.

LEFT — you write React, plus types for anything native. Metro bundles the JS. Codegen turns those type definitions into real native interfaces at build time, which is why the new architecture can be type-safe across the boundary instead of guessing at runtime.

JS BUNDLE — runs in a JS VM (Hermes) on the JS thread. Same thread as your components, state and effects.

JSI — the piece that matters. It lets JS hold a direct reference to a C++ object and call it synchronously. The old architecture serialised everything to JSON and posted it over an async bridge; that queue is where most of the historic "React Native is slow" reputation came from. JSI removes the queue.

RENDERER (Fabric) — builds the shadow tree in C++. Yoga runs on the shadow thread and computes size and position for every node, then the result is committed and mounted as real platform views: UIView on iOS, android.view.View on Android. Note the arrow between Yoga and the renderer is marked UI thread — that's where the mounting actually lands.

NATIVE MODULES (TurboModules) — lazily loaded, through the same codegen'd interfaces.

THE BLUE BOX IS MY ADDITION, not part of the standard diagram. Say so if anyone knows this slide. Reanimated spins up a SECOND JS runtime that lives on the UI thread, next to the renderer. Your worklets run there. So a gesture can read a value and drive a native view's transform without ever touching the JS thread on the left half of this diagram.

That's the payoff: everything left of JSI can be busy, and the animation still hits every frame.`,
};

export default slide;
