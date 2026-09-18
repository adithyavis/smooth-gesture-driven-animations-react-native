import type { ReactNode } from 'react';
import './diagram.css';

/** A diagram that builds up one arrow press at a time: the current step's
 *  caption and sub-line, over the diagram itself. */
export function Walkthrough({
  step,
  caption,
  sub,
  children,
}: {
  step: number;
  caption: ReactNode;
  sub: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="layout-threads journey">
      {/* Keyed by step so the caption replays its entrance on every press. */}
      <h2 key={`c${step}`}>{caption}</h2>
      <p className="journey-sub" key={`s${step}`}>{sub}</p>
      {children}
    </div>
  );
}
