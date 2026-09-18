import type { ReactNode, Ref } from 'react';
import './touch.css';
import './Phone.css';

/** Same footprint as VolumeSlider, so every demo lines up on a slide. */
export const STAGE_W = 220;
export const STAGE_H = 420;
const PHONE_W = 200;
const PHONE_H = 410;
const BEZEL = 6;
/** Where the screen's top-left corner sits inside the stage. */
export const SCREEN_X = (STAGE_W - PHONE_W) / 2 + BEZEL;
export const SCREEN_Y = (STAGE_H - PHONE_H) / 2 + BEZEL;
export const SCREEN_W = PHONE_W - BEZEL * 2;
export const SCREEN_H = PHONE_H - BEZEL * 2;
export const FINGER = 40;

/** Moves the fingertip to a point in screen coordinates. */
export function placeFinger(el: HTMLElement, x: number, y: number, tap: { opacity: number; pressed: boolean }) {
  el.style.left = `${SCREEN_X + x - FINGER / 2}px`;
  el.style.top = `${SCREEN_Y + y - FINGER / 2}px`;
  el.style.opacity = String(tap.opacity);
  el.style.transform = `scale(${tap.pressed ? 0.86 : 1})`;
}

/** A phone frame with a status bar. Children are the screen, in screen coordinates. */
export function Phone({
  playing,
  fingerRef,
  children,
}: {
  playing: boolean;
  /** Leave out for demos with no finger. */
  fingerRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div className={`phone-stage ${playing ? '' : 'idle'}`} style={{ width: STAGE_W, height: STAGE_H }}>
      <div className="phone"
        style={{ width: PHONE_W, height: PHONE_H, left: (STAGE_W - PHONE_W) / 2, top: (STAGE_H - PHONE_H) / 2, borderWidth: BEZEL }}>
        <div className="phone-screen">
          <div className="phone-status">9:41</div>
          {children}
        </div>
      </div>
      {playing && fingerRef && (
        <div ref={fingerRef} className="touch-finger" style={{ width: FINGER, height: FINGER, opacity: 0 }} />
      )}
    </div>
  );
}
