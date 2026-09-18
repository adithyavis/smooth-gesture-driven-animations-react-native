import { VolumeSlider } from '../components/VolumeSlider';
import type { SlideDef } from '../deck/types';
import './principles.css';

function Verdict({ good }: { good: boolean }) {
  return (
    <figcaption className={`verdict ${good ? 'good' : 'bad'}`}>
      <svg viewBox="0 0 24 24" role="img" aria-label={good ? 'Good' : 'Bad'}>
        <path d={good ? 'M5 12.5l4.5 4.5L19 7.5' : 'M6.5 6.5l11 11M17.5 6.5l-11 11'} />
      </svg>
    </figcaption>
  );
}

/** Two volume sliders side by side; only the one being discussed moves. */
function Principles({ active }: { active: 'left' | 'right' }) {
  return (
    <div className="layout-principles">
      <h2>Principles of animation</h2>
      <div className="principles-demos">
        <figure className={active === 'left' ? 'active' : ''}>
          <VolumeSlider mode="plain" playing={active === 'left'} />
          <Verdict good={false} />
        </figure>
        <figure className={active === 'right' ? 'active' : ''}>
          <VolumeSlider mode="rubber" playing={active === 'right'} />
          <Verdict good />
        </figure>
      </div>
    </div>
  );
}

export const followFinger: SlideDef = {
  content: <Principles active="left" />,
  notes: `The slider tracks the finger exactly — the fill's edge sits under your fingertip the whole way.

But watch what happens at the top and bottom: the finger keeps going and the slider just stops. Nothing tells you that you hit the limit. It feels dead.`,
};

export const rubberBand: SlideDef = {
  content: <Principles active="right" />,
  notes: `Same gesture, one change. Past the limit, the slider stretches toward your finger and gets slightly narrower — the further you pull, the less it gives.

Let go and it springs back to its normal size. The volume stays where it was; only the shape recovers.

This is what Apple's volume slider does. It's the same rubber-band curve as iOS scroll views. It tells you "that's the end" without a single word or icon.`,
};
