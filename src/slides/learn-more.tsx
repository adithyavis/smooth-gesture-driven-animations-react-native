import type { SlideDef } from '../deck/types';
import '../components/layouts.css';
import './learn-more.css';

const TOPICS = [
  'Gesture compositions',
  'Shared element transitions',
  'Layout animations',
  'Native gestures',
  "Skia",
  "WebGPU"
];

function LearnMore() {
  return (
    <div className="layout-threads layout-fill layout-bullets">
      <h2>Other things to learn about</h2>
      <div>
        <ul>
          {TOPICS.map((topic, i) => (
            <li key={topic} style={{ animationDelay: `${120 + i * 90}ms` }}>{topic}</li>
          ))}
        </ul>
        <p className="lm-etc" style={{ animationDelay: `${120 + TOPICS.length * 90}ms` }}>etc.</p>
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: <LearnMore />,
  notes: `Things we didn't cover, to look up after the talk.

GESTURE COMPOSITIONS — combine gestures: Gesture.Simultaneous (pinch and rotate at the same time), Gesture.Exclusive (double tap wins over single tap), Gesture.Race.

SHARED ELEMENT TRANSITIONS — a view moves from one screen to the next during navigation. In Reanimated, give both views the same sharedTransitionTag.

LAYOUT ANIMATIONS — animate a view when it appears, disappears or changes position in the layout, with the entering, exiting and layout props. For example FadeIn, SlideOutLeft, LinearTransition.

NATIVE GESTURES — Gesture.Native wraps a native component like a ScrollView, so it works together with your own Gesture Handler gestures, for example a pan inside a scroll view.`,
};

export default slide;
