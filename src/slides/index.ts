import type { SlideDef } from '../deck/types';
import title from './01-title';
import aboutMe from './02-about-me';
import architecture from './03-architecture';
import viewJourney from './04-view-journey';
import workletRuntime from './05-worklet-runtime';
import gestures from './06-gestures';
import quote from './07-quote';
import thanks from './08-thanks';

/** The running order. Each slide lives in its own file, with its speaker notes. */
export const slides: SlideDef[] = [
  title,
  aboutMe,
  architecture,
  viewJourney,
  workletRuntime,
  gestures,
  quote,
  thanks,
];
