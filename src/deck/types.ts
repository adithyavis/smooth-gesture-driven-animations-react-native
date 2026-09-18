import type { ReactNode } from 'react';

export type SlideDef = {
  /** A function receives the current sub-step, for slides that build up. */
  content: ReactNode | ((step: number) => ReactNode);
  /** How many arrow-key presses this slide takes before moving on. */
  steps?: number;
  notes?: string;
};
