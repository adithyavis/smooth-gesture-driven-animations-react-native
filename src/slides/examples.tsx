import { useEffect, useRef } from 'react';
import { Code } from '../components/Code';
import type { SlideDef } from '../deck/types';
import './examples.css';

/** One screen recording per slide, under the same title position as the other slides. */
function Example({ title, src }: { title: string; src: string }) {
  return (
    <div className="layout-threads layout-fill">
      <h2>{title}</h2>
      <figure className="ex-figure">
        <video src={src} autoPlay muted loop playsInline className="ex-video" />
      </figure>
    </div>
  );
}

export const example1: SlideDef = {
  content: <Example title="Example 1" src="/videos/x.mp4" />,
};

/** Where the X profile header is at each scroll offset. */
const SNAPSHOTS = [0, 50, 100, 200];

/** Each part of the header animates over its own slice of the scroll, one after
 *  another. `from` and `to` index into SNAPSHOTS. */
const RANGES: { label: string; from: number; to: number; color: string }[] = [
  { label: 'Avatar shrinks', from: 0, to: 1, color: '#6ea8fe' },
  { label: 'Banner blurs', from: 1, to: 2, color: '#56c596' },
  { label: 'Title slides in', from: 2, to: 3, color: '#e8a33d' },
];

/** Column geometry, shared by the screenshots and the chart under them. */
const ROW_W = 1072;
const GAP = 24;
const COL_W = (ROW_W - GAP * (SNAPSHOTS.length - 1)) / SNAPSHOTS.length;
const colCentre = (i: number) => i * (COL_W + GAP) + COL_W / 2;

function ScrollRanges() {
  const barY = (i: number) => 36 + i * 40;
  return (
    <svg viewBox={`0 0 ${ROW_W} 150`} className="diagram" role="img"
      aria-label="A scroll axis at y = 0, 50, 100 and 200. The avatar shrinks from 0 to 50, the banner blurs from 50 to 100, and the title slides in from 100 to 200: one after another.">
      {SNAPSHOTS.map((y, i) => (
        <g key={y}>
          <text x={colCentre(i)} y="18" className="ex-tick" textAnchor="middle">y = {y}</text>
          <line x1={colCentre(i)} y1="28" x2={colCentre(i)} y2="146"
            stroke="rgba(159,179,200,0.45)" strokeWidth="1.5" strokeDasharray="3 4" />
        </g>
      ))}
      {RANGES.map((r, i) => (
        <g key={r.label}>
          <rect x={colCentre(r.from)} y={barY(i)} width={colCentre(r.to) - colCentre(r.from)}
            height="32" rx="8" fill={r.color} />
          <text x={(colCentre(r.from) + colCentre(r.to)) / 2} y={barY(i) + 22}
            className="ex-range" textAnchor="middle">
            {r.label} · {SNAPSHOTS[r.from]} → {SNAPSHOTS[r.to]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ScrollSequence() {
  return (
    <div className="layout-threads layout-fill">
      <h2>Example 1</h2>
      <div className="ex-sequence">
        <div className="ex-shots">
          {SNAPSHOTS.map((y) => (
            <div key={y} className="ex-shot">
              <img src={`/y=${y}.png`} alt={`The profile header scrolled to y = ${y}`} />
            </div>
          ))}
        </div>
        <ScrollRanges />
        <p className="ex-takeaway">
          One scroll value drives everything. Each animation gets its own range, so they play one after another.
        </p>
      </div>
    </div>
  );
}

export const example1Sequence: SlideDef = {
  content: <ScrollSequence />,
  notes: `The same X profile header, frozen at four scroll positions.

y = 0 — the full header: banner, big avatar, name.
y = 50 — the avatar has shrunk and tucked behind the banner.
y = 100 — the banner has stopped scrolling and is blurring; the name is starting to fade into the header.
y = 200 — the collapsed header: blurred banner, name and post count, and the tabs pinned underneath.

THE TRICK — it's one shared value, the scroll offset, from useAnimatedScrollHandler. Every piece has its own useAnimatedStyle that interpolates that same value over its own range, clamped: the avatar over 0 to 50, the blur over 50 to 100, the title over 100 to 200. Outside its range each piece just holds still.

So you don't orchestrate a sequence or chain callbacks. You pick the ranges, and the sequence falls out of the scroll position. Scroll back up and it all plays in reverse, for free, on the UI thread.`,
};

const TAB_BAR_CODE = `const scrollY = useSharedValue(0);

const onScroll = useAnimatedScrollHandler((e) => {
  scrollY.value = e.contentOffset.y;
});

// Moves with the scroll, then cancels it out past STICK_AT
const tabBarStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: Math.max(0, scrollY.value - STICK_AT) }],
}));

<Animated.ScrollView onScroll={onScroll}>
  <Header />
  <Animated.View style={tabBarStyle}><Tabs /></Animated.View>
  <Posts />
</Animated.ScrollView>`;

/** Plays `src` forward from `start` seconds to the end, then backward to `start`,
 *  forever. Browsers won't play video in reverse, so the backward half seeks
 *  frame by frame, keeping real-time speed and skipping frames if a seek is slow. */
function PingPongVideo({ src, start, rate = 1, className }: {
  src: string;
  start: number;
  /** Playback speed, both ways. */
  rate?: number;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let raf = 0;
    let seeking = false;
    const onSeeked = () => { seeking = false; };

    const forward = () => {
      cancelAnimationFrame(raf);
      video.currentTime = start;
      video.playbackRate = rate;
      void video.play().catch(() => {});
    };

    const backward = () => {
      video.pause();
      const end = video.duration;
      const began = performance.now();
      const step = (now: number) => {
        const t = end - ((now - began) / 1000) * rate;
        if (t <= start) {
          forward();
          return;
        }
        if (!seeking) {
          seeking = true;
          video.currentTime = t;
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('ended', backward);
    if (video.readyState >= 1) forward();
    else video.addEventListener('loadedmetadata', forward, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('ended', backward);
      video.removeEventListener('loadedmetadata', forward);
    };
  }, [start, rate]);

  return <video ref={ref} src={src} className={className} muted playsInline preload="auto" />;
}

function TabBarSnap() {
  return (
    <div className="layout-threads layout-fill layout-tabbar">
      <h2>Example 1</h2>
      <div className="ex-row">
        <div className="ex-left"><Code lang="jsx" mark={[[7, 10]]}>{TAB_BAR_CODE}</Code></div>
        <PingPongVideo src="/videos/x.mp4" start={3.5} rate={3} className="ex-video" />
      </div>
    </div>
  );
}

export const example1TabBar: SlideDef = {
  content: <TabBarSnap />,
  notes: `How the tab bar snaps under the header, with no sticky-header library and no re-render.

THE SCROLL — one shared value, the scroll offset, written by useAnimatedScrollHandler on the UI thread.

THE TAB BAR (highlighted) — it lives inside the scroll view, so it scrolls up with the content. Until scrollY reaches STICK_AT, the translate is 0 and it just scrolls. Past STICK_AT, translateY is exactly how far we've scrolled beyond it: the content moves it up by N, the translate moves it down by N. They cancel, so it stays pinned under the header.

STICK_AT is the tab bar's distance from the top of the content, minus the collapsed header height.

THE VIDEO — from here on, watch the tabs: they stay put while the posts slide underneath. It's the same frame as the scroll, because it's the same shared value, on the same thread. Scroll back up and max(0, …) hands it back to the content.`,
};
