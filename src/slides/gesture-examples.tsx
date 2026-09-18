import type { CSSProperties, ReactNode } from 'react';
import { FINGER, Phone, SCREEN_H, SCREEN_W } from '../components/Phone';
import type { SlideDef } from '../deck/types';
import './gesture-examples.css';

/** Centres an element of the given size on the phone screen. */
const centered = (w: number, h: number): CSSProperties => ({
  width: w,
  height: h,
  left: (SCREEN_W - w) / 2,
  top: (SCREEN_H - h) / 2,
});

/** A fingertip, centred on the screen; each demo's keyframes move it from there. */
function Finger({ className }: { className: string }) {
  return <div className={`touch-finger ge-finger ${className}`} style={centered(FINGER, FINGER)} />;
}

/** Two fingers spread apart and the box grows with them. */
function Pinch() {
  return (
    <>
      <div className="ge-box ge-pinch-box" style={centered(70, 70)} />
      <Finger className="ge-pinch-a" />
      <Finger className="ge-pinch-b" />
    </>
  );
}

/** Two fingers turn around the centre and the card turns with them. */
function Rotate() {
  return (
    <>
      <div className="ge-box ge-rotate-box" style={centered(110, 70)} />
      {/* The fingers ride on a wrapper that rotates by the same amount as the card. */}
      <div className="ge-rotate-hand" style={{ left: SCREEN_W / 2, top: SCREEN_H / 2 }}>
        <div className="touch-finger ge-finger ge-rotate-finger"
          style={{ width: FINGER, height: FINGER, left: -64 - FINGER / 2, top: -FINGER / 2 }} />
        <div className="touch-finger ge-finger ge-rotate-finger"
          style={{ width: FINGER, height: FINGER, left: 64 - FINGER / 2, top: -FINGER / 2 }} />
      </div>
    </>
  );
}

/** A quick swipe, a release, and the card keeps going with the finger's velocity. */
function Fling() {
  return (
    <>
      <div className="ge-card-under" style={centered(120, 150)} />
      <div className="ge-box ge-fling-card" style={centered(120, 150)} />
      <Finger className="ge-fling-finger" />
    </>
  );
}

/** Two quick taps on a photo, and a heart pops. */
function DoubleTap() {
  return (
    <>
      <div className="ge-photo" style={centered(160, 160)} />
      <div className="ge-heart" style={centered(80, 80)}>♥</div>
      <Finger className="ge-tap-finger" />
    </>
  );
}

const EXAMPLES: { label: string; demo: ReactNode }[] = [
  { label: 'Pinch', demo: <Pinch /> },
  { label: 'Rotate', demo: <Rotate /> },
  { label: 'Fling', demo: <Fling /> },
  { label: 'Double tap', demo: <DoubleTap /> },
];

function GestureExamples() {
  return (
    <div className="layout-threads layout-fill">
      <h2>Gesture driven animation</h2>
      <div className="ge-row">
        {EXAMPLES.map(({ label, demo }) => (
          <figure key={label} className="ge-item">
            <Phone playing>{demo}</Phone>
            <figcaption>{label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: <GestureExamples />,
  notes: `Same recipe, different gestures. Every one of these is a Gesture Handler gesture whose callbacks are worklets, writing shared values on the UI thread.

PINCH — Gesture.Pinch(). onUpdate gives you e.scale; write it into a shared value and use it in the transform.

ROTATE — Gesture.Rotation(). e.rotation in radians. Combine it with pinch using Gesture.Simultaneous and you get the two-finger photo editor.

FLING — a pan whose onEnd reads e.velocityX and hands it to withDecay, so the card keeps going at the speed you threw it. Or decide on the UI thread: past a threshold, fling it off; otherwise, spring it back. That's the "if" Animated couldn't do.

DOUBLE TAP — Gesture.Tap().numberOfTaps(2). onEnd sets a shared value to withSequence(withSpring(1.2), withSpring(1)) and the heart pops. Instagram-style, no round trip to JS.

The point: once the gesture and the animation both live on the UI thread, every one of these is a few lines.`,
};

export default slide;
