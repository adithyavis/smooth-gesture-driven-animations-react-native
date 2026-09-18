import type { ReactNode } from 'react';
import type { SlideDef } from '../deck/types';
import './smooth-matters.css';

/** Three slides under one question, each showing a single app. */
function SmoothMatters({ children, credit }: { children: ReactNode; credit?: ReactNode }) {
  return (
    <div className="layout-smooth-matters">
      <h2>Do smooth animations really matter?</h2>
      <figure>
        {children}
        {credit && <figcaption>{credit}</figcaption>}
      </figure>
    </div>
  );
}

export const amazon: SlideDef = {
  content: (
    <SmoothMatters>
      <img src="/amazon.webp" alt="The Amazon shopping app" className="media portrait" />
    </SmoothMatters>
  ),
};

export const tinder: SlideDef = {
  content: (
    <SmoothMatters
      credit={
        <a href="https://giphy.com/gifs/phone-nyc-tinder-kqXjYWhmfto280HUan" target="_blank" rel="noreferrer">
          via GIPHY
        </a>
      }
    >
      <video src="/videos/tinder.mp4" autoPlay muted loop playsInline className="media square" />
    </SmoothMatters>
  ),
};

export const duolingo: SlideDef = {
  content: (
    <SmoothMatters>
      <video src="/duolingo.mp4" autoPlay muted loop playsInline className="media landscape" />
    </SmoothMatters>
  ),
};
