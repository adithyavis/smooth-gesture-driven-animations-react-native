import { Code } from '../components/Code';
import type { SlideDef } from '../deck/types';
import './view-to-uiview.css';

const JSX = `<View style={{
  position: 'absolute',
  left: 40, top: 80,
  width: 160, height: 100,
  backgroundColor: 'blue',
}} />`;

const UIKIT = `let box = UIView()
box.frame = CGRect(
  x: 40, y: 80,
  width: 160, height: 100)
box.backgroundColor = .blue
view.addSubview(box)`;

function Arrow() {
  return (
    <svg viewBox="0 0 40 20" className="v2u-arrow" aria-hidden="true">
      <line x1="2" y1="10" x2="34" y2="10" stroke="#9fb3c8" strokeWidth="2" />
      <path d="M28,4 L38,10 L28,16 z" fill="#9fb3c8" />
    </svg>
  );
}

/** What the code puts on screen, with its frame measured out. */
function FramePreview() {
  return (
    <svg viewBox="-20 -34 360 290" className="v2u-frame" role="img"
      aria-label="A blue rectangle on screen at x 40, y 80, 160 wide and 100 tall, measured from the top-left corner.">
      <rect x="0" y="0" width="320" height="240" rx="18"
        fill="#000" stroke="#2c2c2e" strokeWidth="5" />
      <text x="0" y="-12" className="nf-origin">(0, 0)</text>

      <rect x="40" y="80" width="160" height="100" rx="4" fill="#0a84ff" />

      <line x1="0" y1="130" x2="40" y2="130" className="nf-guide" />
      <text x="20" y="120" className="nf-label" textAnchor="middle">x 40</text>

      <line x1="120" y1="0" x2="120" y2="80" className="nf-guide" />
      <text x="128" y="46" className="nf-label">y 80</text>

      <line x1="40" y1="200" x2="200" y2="200" className="nf-guide" />
      <text x="120" y="226" className="nf-label" textAnchor="middle">width 160</text>

      <line x1="220" y1="80" x2="220" y2="180" className="nf-guide" />
      <text x="228" y="137" className="nf-label">height 100</text>
    </svg>
  );
}

function ViewToUIView() {
  return (
    <div className="layout-threads layout-fill layout-v2u">
      <h2>How React Native Renders</h2>
      <div className="v2u-row">
        <figure className="v2u-side">
          <figcaption>You write</figcaption>
          <Code lang="jsx">{JSX}</Code>
        </figure>
        <Arrow />
        <figure className="v2u-side">
          <figcaption>React Native creates</figcaption>
          <Code lang="swift">{UIKIT}</Code>
        </figure>
        <Arrow />
        <figure className="v2u-side">
          <figcaption>On screen</figcaption>
          <FramePreview />
        </figure>
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: <ViewToUIView />,
  notes: `Tie it straight back to the last slide: the middle panel is plain UIKit, the same code you'd write in a native app.

LEFT — what you write. A <View /> with a style. It's a description, not a view.

MIDDLE — what ends up on the UI thread. A UIView with a frame. The frame is the layout: x, y, width, height, in points from the top-left corner of the parent. Add it to the view and UIKit draws it. (Strictly, React Native creates RCTViewComponentView, which is a UIView subclass. On Android it's a ReactViewGroup.)

RIGHT — the result. Point at the measurements: those four numbers are all a native view needs to know about layout.

THE FRAME — you never wrote a CGRect. React Native worked the numbers out with Yoga, its flexbox engine, and set the frame for you. Here it's absolute so the numbers match; with flexbox Yoga does the maths.

Line to land: "React Native doesn't draw anything itself. It makes the same native views you'd make by hand." Then: the next slide is how it gets from the left box to the middle one.`,
};

export default slide;
