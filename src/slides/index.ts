import type { SlideDef } from '../deck/types';
import title from './title';
import aboutMe from './about-me';
import * as smoothMatters from './smooth-matters';
import * as principles from './principles';
import architecture from './architecture';
import viewJourney from './view-journey';
import workletRuntime from './worklet-runtime';
import gestures from './gestures';
import quote from './quote';
import thanks from './thanks';

/** The running order lives here, not in file names, so slides can be inserted
 *  anywhere. Each slide lives in its own file, with its speaker notes. */
export const slides: SlideDef[] = [
  title,
  aboutMe,
  smoothMatters.amazon,
  smoothMatters.tinder,
  smoothMatters.duolingo,
  principles.followFinger,
  principles.rubberBand,
  architecture,
  viewJourney,
  workletRuntime,
  gestures,
  quote,
  thanks,
];
