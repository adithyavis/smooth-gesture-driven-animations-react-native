import { useEffect, useRef, useState } from 'react';
import { Code } from '../components/Code';
import { Phone, SCREEN_H, SCREEN_W } from '../components/Phone';
import type { SlideDef } from '../deck/types';
import './simple-animation.css';

const CODE = `function Box() {
  const [scale, setScale] = useState(1);

  useInterval(() => {
    setScale((s) => Math.min(s + 0.05, 2));
  }, 16);

  return (
    <View style={[styles.box, { transform: [{ scale }] }]} />
  );
}`;

/** setInterval, cleaned up on unmount, always calling the latest callback. */
function useInterval(callback: () => void, delay: number) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });
  useEffect(() => {
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

const BOX = 56;

/** The code on the left, running for real: state plus an interval, nothing else. */
function ScaleDemo() {
  const [scale, setScale] = useState(1);

  useInterval(() => {
    setScale((s) => Math.min(s + 0.05, 2));
  }, 16);

  // Start over after a pause, so it keeps playing while you talk.
  useEffect(() => {
    if (scale < 2) return;
    const id = setTimeout(() => setScale(1), 1000);
    return () => clearTimeout(id);
  }, [scale]);

  return (
    <Phone playing>
      <div className="sa-box"
        style={{
          width: BOX,
          height: BOX,
          left: (SCREEN_W - BOX) / 2,
          top: (SCREEN_H - BOX) / 2,
          transform: `scale(${scale})`,
        }} />
    </Phone>
  );
}

function SimpleAnimation() {
  return (
    <div className="layout-threads layout-fill layout-simple">
      <h2>Simple animation</h2>
      <div className="sa-row">
        <Code lang="jsx">{CODE}</Code>
        <ScaleDemo />
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: <SimpleAnimation />,
  notes: `The most obvious way to animate in React Native, with nothing but React: a bit of state, an interval, and a style.

THE CODE — scale lives in state. Every 16ms (roughly one frame at 60fps) we bump it by 0.05 until it reaches 2. The style reads it into a transform. useInterval isn't built in; it's the well-known hook that wraps setInterval in a useEffect and cleans up.

THE DEMO — it's that exact code running. And it looks fine.

WHAT'S ACTUALLY HAPPENING, every tick — setScale on the JS thread, React re-renders Box, the renderer diffs it, commits, and the new transform is sent across to the UI thread to update the native view. Sixty times a second, through the whole pipeline from the last slide.

WHY IT BREAKS — it only looks smooth because the JS thread is idle. setInterval isn't tied to the screen's refresh, and every tick is queued behind whatever else JS is doing. Fetch a list, render a screen, parse some JSON, and the ticks arrive late or bunch up: the box stutters.

Transition: "So the question is how to run this without the JS thread in the loop."`,
};

export default slide;
