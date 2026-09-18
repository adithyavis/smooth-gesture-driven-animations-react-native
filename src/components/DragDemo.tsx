import { FINGER, Phone, SCREEN_H, SCREEN_W } from './Phone';
import './DragDemo.css';

const BOX_W = 112;
const BOX_H = 67;

/** A finger drags a card around the phone, lets go, and the card springs back.
 *  CSS animations, so the browser runs them off the main thread too. */
export function DragDemo() {
  return (
    <Phone playing>
      <div className="drag-box"
        style={{ width: BOX_W, height: BOX_H, left: (SCREEN_W - BOX_W) / 2, top: (SCREEN_H - BOX_H) / 2 }} />
      <div className="touch-finger drag-finger"
        style={{ width: FINGER, height: FINGER, left: (SCREEN_W - FINGER) / 2, top: (SCREEN_H - FINGER) / 2 }} />
    </Phone>
  );
}
