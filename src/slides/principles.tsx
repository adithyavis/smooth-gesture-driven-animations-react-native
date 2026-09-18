import type { ReactNode } from 'react';
import { PhotoGrid } from '../components/PhotoGrid';
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

/** One demo, drawn twice: the version without the principle, and with it. */
type Demo = (props: { good: boolean; playing: boolean }) => ReactNode;

const Photos: Demo = ({ good, playing }) => <PhotoGrid mode={good ? 'shared' : 'cut'} playing={playing} />;
const Volume: Demo = ({ good, playing }) => <VolumeSlider mode={good ? 'rubber' : 'plain'} playing={playing} />;

/** The two versions side by side; only the one being discussed moves. */
function Principles({ Demo, active }: { Demo: Demo; active: 'left' | 'right' }) {
  return (
    <div className="layout-principles">
      <h2>Principles of animation</h2>
      <div className="principles-demos">
        <figure className={active === 'left' ? 'active' : ''}>
          <Demo good={false} playing={active === 'left'} />
          <Verdict good={false} />
        </figure>
        <figure className={active === 'right' ? 'active' : ''}>
          <Demo good playing={active === 'right'} />
          <Verdict good />
        </figure>
      </div>
    </div>
  );
}

export const instantOpen: SlideDef = {
  content: <Principles Demo={Photos} active="left" />,
  notes: `Tap a photo and the screen is simply replaced. Tap back and it is replaced again.

It works, but you lose your place: where did that photo come from, and where did it go? Your eyes have to search the grid again every time.`,
};

export const sharedOpen: SlideDef = {
  content: <Principles Demo={Photos} active="right" />,
  notes: `Same taps. Now the photo you touched grows out of its own cell into full screen, and shrinks back into that same cell when you go back.

Nothing is replaced; one object moves. You never lose track of where you are, and the motion explains the navigation for you. This is a shared element transition — what the Photos app does.`,
};

export const followFinger: SlideDef = {
  content: <Principles Demo={Volume} active="left" />,
  notes: `The slider tracks the finger exactly — the fill's edge sits under your fingertip the whole way.

But watch what happens at the top and bottom: the finger keeps going and the slider just stops. Nothing tells you that you hit the limit. It feels dead.`,
};

export const rubberBand: SlideDef = {
  content: <Principles Demo={Volume} active="right" />,
  notes: `Same gesture, one change. Past the limit, the slider stretches toward your finger and gets slightly narrower — the further you pull, the less it gives.

Let go and it springs back to its normal size. The volume stays where it was; only the shape recovers.

This is what Apple's volume slider does. It's the same rubber-band curve as iOS scroll views. It tells you "that's the end" without a single word or icon.`,
};
