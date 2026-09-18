import { Pill } from '../components/diagram/Pill';
import '../components/diagram/diagram.css';
import type { SlideDef } from '../deck/types';

/** A pure native app: every step of a frame runs on the one UI thread. */
function UIThreadChart() {
  return (
    <svg viewBox="0 0 822 190" className="diagram" role="img"
      aria-label="The UI thread handles touch and scroll, layout and draw, then updates the native views.">
      <defs>
        <marker id="tip-native" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#9fb3c8" />
        </marker>
      </defs>

      <g className="col c1">
        <Pill x={14} y={10} w={110} label="UI thread" />
        <rect x="0" y="44" width="530" height="142" rx="14"
          fill="rgba(120,180,240,0.12)" stroke="rgba(120,180,240,0.3)" />

        <rect x="14" y="84" width="140" height="62" rx="9" fill="#4a90d9" />
        <text x="84" y="122" className="d-box-sm" textAnchor="middle">Touch, scroll</text>
        <line x1="156" y1="115" x2="194" y2="115" stroke="#9fb3c8" strokeWidth="2"
          markerEnd="url(#tip-native)" />

        {/* Same yellow as Yoga on the React Native chart: here layout shares
            the UI thread instead of getting a thread of its own. */}
        <rect x="195" y="84" width="140" height="62" rx="9" fill="#f0c44a" />
        <text x="265" y="124" className="d-yoga" textAnchor="middle">Layout</text>
        <line x1="337" y1="115" x2="375" y2="115" stroke="#9fb3c8" strokeWidth="2"
          markerEnd="url(#tip-native)" />

        <rect x="376" y="84" width="140" height="62" rx="9" fill="#4a90d9" />
        <text x="446" y="122" className="d-box-sm" textAnchor="middle">Draw</text>
      </g>

      <g className="col c2">
        <line x1="534" y1="115" x2="596" y2="115" stroke="#9fb3c8" strokeWidth="2"
          markerEnd="url(#tip-native)" />
        <rect x="602" y="84" width="220" height="62" rx="9" fill="#4a90d9" />
        <text x="712" y="122" className="d-box-sm" textAnchor="middle">Native UI</text>
      </g>
    </svg>
  );
}

function NativeRendering() {
  return (
    <div className="layout-threads layout-fill">
      <h2>How Native Apps Render</h2>
      <UIThreadChart />
    </div>
  );
}

const slide: SlideDef = {
  content: <NativeRendering />,
  notes: `Set this up as the baseline before React Native. A pure Swift or Kotlin app has ONE thread that does the work for every frame: the UI thread, also called the main thread.

THE CHART — every frame, the UI thread handles touch and scroll, runs layout, and draws. Point at the yellow box: that's layout, the same colour as Yoga on the React Native chart coming up. In a native app it shares the UI thread; React Native moves it to a thread of its own.

SCROLLING IS ON THE UI THREAD TOO — UIScrollView, RecyclerView, LazyColumn. Block the main thread and a scroll freezes mid-fling. Native gets away with it because a scroll frame is cheap: only the offset changes, and views that already exist are reused.

WHAT'S LEFT OFF THE CHART — turning the drawing into pixels and compositing the screen. That runs outside the UI thread: the render server on iOS, RenderThread and SurfaceFlinger on Android. It's there if anyone asks, but it isn't where your code runs.

Transition: "Keep this picture in mind. React Native adds a JS thread to the left of it."`,
};

export default slide;
