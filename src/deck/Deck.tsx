import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { SlideDef } from './types';
import './deck.css';

/** Slides are authored against a fixed stage, then scaled to fit the window.
 *  That way font sizes and spacing mean the same thing on any screen. */
const STAGE_W = 1280;
const STAGE_H = 720;
/** Height left for the slide when the notes panel is open. */
const STAGE_SHARE_WITH_NOTES = 0.58;

export default function Deck({ slides }: { slides: SlideDef[] }) {
  const [index, setIndex] = useState(() => {
    const fromHash = Number(window.location.hash.slice(1));
    return Number.isInteger(fromHash) && fromHash > 0 ? Math.min(fromHash - 1, slides.length - 1) : 0;
  });
  const [direction, setDirection] = useState<1 | -1>(1);
  const [step, setStep] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [scale, setScale] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);

  const stepsOf = useCallback((i: number) => slides[i]?.steps ?? 1, [slides]);

  const go = useCallback(
    (next: number, dir: 1 | -1, atStep?: number) => {
      const clamped = Math.min(Math.max(next, 0), slides.length - 1);
      if (clamped === index) return;
      setDirection(dir);
      setIndex(clamped);
      // Walking backwards lands you on the last build of the previous slide.
      setStep(atStep ?? (dir === 1 ? 0 : stepsOf(clamped) - 1));
    },
    [index, slides.length, stepsOf]
  );

  /** Advance the build first; only move slides once it's exhausted. */
  const forward = useCallback(() => {
    if (step < stepsOf(index) - 1) setStep(step + 1);
    else go(index + 1, 1);
  }, [go, index, step, stepsOf]);

  const back = useCallback(() => {
    if (step > 0) setStep(step - 1);
    else go(index - 1, -1);
  }, [go, index, step]);

  // Keep the URL in sync so you can reload straight back to a slide.
  useEffect(() => {
    window.history.replaceState(null, '', `#${index + 1}`);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          forward();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          back();
          break;
        case 'Home':
          go(0, -1, 0);
          break;
        case 'End':
          go(slides.length - 1, 1, 0);
          break;
        case 'n':
          setShowNotes((v) => !v);
          break;
        case 'f':
          if (document.fullscreenElement) document.exitFullscreen();
          else rootRef.current?.requestFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back, forward, go, slides.length]);

  useLayoutEffect(() => {
    const fit = () => {
      const usableHeight = window.innerHeight * (showNotes ? STAGE_SHARE_WITH_NOTES : 1);
      setScale(Math.min(window.innerWidth / STAGE_W, usableHeight / STAGE_H));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [showNotes]);

  return (
    <div className={`deck ${showNotes ? 'with-notes' : ''}`} ref={rootRef}>
      <div
        className="stage"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          top: showNotes ? `${(STAGE_SHARE_WITH_NOTES / 2) * 100}%` : '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div
          key={index}
          className={`slide ${direction === 1 ? 'from-right' : 'from-left'}`}
        >
          {typeof slides[index].content === 'function'
            ? (slides[index].content as (s: number) => ReactNode)(step)
            : slides[index].content}
        </div>
      </div>

      <div className="chrome">
        <button onClick={back} disabled={index === 0 && step === 0} aria-label="Previous">
          ‹
        </button>
        <span className="counter">
          {index + 1} / {slides.length}
          {stepsOf(index) > 1 && ` · ${step + 1}/${stepsOf(index)}`}
        </span>
        <button
          onClick={forward}
          disabled={index === slides.length - 1 && step === stepsOf(index) - 1}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {showNotes && (
        <aside className="notes">
          <header>
            Speaker notes · slide {index + 1}
            <button onClick={() => setShowNotes(false)} aria-label="Hide notes">×</button>
          </header>
          <pre>{slides[index].notes?.trim() || 'No notes for this slide.'}</pre>
        </aside>
      )}

      <div className="progress" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />
    </div>
  );
}
