import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { Code } from '../components/Code';
import type { SlideDef } from '../deck/types';
import './google-photos.css';

const POINTS = [
  <>3 different lists for concurrent rendering of the grids in different zoom settings.</>,
  <>On list position change, synchronize the different list positions using synchronous <code>scrollTo</code>.</>,
  <>Precompute row heights and provide them to <code>getItemLayout</code>, so that scrub to scroll is accurate.</>,
];

/** A grid is a list of rows: a date header, or a row of photos. */
type Row = { header: string } | { photos: number };

const SECTIONS = ['June 2026', 'May 2026', 'Apr 2025', 'Mar 2025', 'Feb 2025', 'Jan 2025', 'Dec 2024', 'Nov 2024'];
const HEADER_H = 22;
const GRID_W = 150;

/** Each month gets a header and two rows of photos, at any column count. */
const rowsFor = (columns: number): Row[] =>
  SECTIONS.flatMap((header) => [{ header }, { photos: columns }, { photos: columns }]);

const rowHeight = (row: Row, columns: number) => ('header' in row ? HEADER_H : GRID_W / columns);

/** Where each row starts: the running total of the heights before it. */
const offsetsFor = (rows: Row[], columns: number) =>
  rows.reduce<number[]>((acc, row, i) => [...acc, acc[i] + rowHeight(row, columns)], [0]);

const TILE_COLORS = ['#5b7c99', '#8a6f5a', '#4f6b58', '#9b8a6e', '#6d5c7e', '#3f5f7a', '#a0786a', '#58707a', '#7a8a5c'];

/** A small photo grid. `mark` highlights the header row with that label;
 *  `contentRef` is the scrolling content, for demos that move it; `overlay`
 *  sits on top and doesn't scroll. */
function MiniGrid({ columns, height, active, dim, mark, contentRef, overlay }: {
  columns: number;
  height: number;
  active?: boolean;
  dim?: boolean;
  mark?: string;
  contentRef?: Ref<HTMLDivElement>;
  overlay?: ReactNode;
}) {
  const rows = rowsFor(columns);
  let tile = 0;
  return (
    <div className={`gp-grid ${active ? 'active' : ''} ${dim ? 'dim' : ''}`} style={{ width: GRID_W, height }}>
      <div ref={contentRef}>
      {rows.map((row, i) =>
        'header' in row ? (
          <div key={i} className={`gp-header ${mark === row.header ? 'mark' : ''}`} style={{ height: HEADER_H }}>
            {row.header}
          </div>
        ) : (
          <div key={i} className="gp-photos" style={{ height: GRID_W / columns }}>
            {Array.from({ length: row.photos }, () => (
              <span key={tile} style={{ background: TILE_COLORS[tile++ % TILE_COLORS.length] }} />
            ))}
          </div>
        ),
      )}
      </div>
      {overlay}
    </div>
  );
}

const ZOOMS = [
  { columns: 1, label: '1 column' },
  { columns: 3, label: '3 columns', active: true },
  { columns: 5, label: '5 columns' },
];

/** Step 1: all three mounted at once; only the current zoom is visible. */
function ThreeLists() {
  return (
    <div className="gp-lists">
      {ZOOMS.map((z) => (
        <figure key={z.columns} className="gp-list">
          <MiniGrid columns={z.columns} height={300} active={z.active} dim={!z.active} />
        </figure>
      ))}
    </div>
  );
}

const SYNC_CODE = `const onScroll = useAnimatedScrollHandler((e) => {
  // Which month is at the top, and how far into it
  const at = positionIn(offsets[3], e.contentOffset.y);
  scrollTo(list1Ref, 0, offsetAt(offsets[1], at), false);
  scrollTo(list5Ref, 0, offsetAt(offsets[5], at), false);
});`;

/** Where each month starts, and how tall it is, at a column count. */
const sectionsFor = (columns: number) => {
  const offsets = offsetsFor(rowsFor(columns), columns);
  return SECTIONS.map((_, k) => ({ start: offsets[k * 3], height: offsets[k * 3 + 3] - offsets[k * 3] }));
};

/** How far the 3-column list scrolls in step 2. */
const SCROLL_TO = sectionsFor(3)[4].start;

/** Slowly down, a pause, slowly back up, a pause: 0 → 1 → 0, forever. */
const SCROLL_MS = 7000;
const HOLD_MS = 800;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
function pingPong(elapsed: number) {
  const t = elapsed % (2 * (SCROLL_MS + HOLD_MS));
  const down = t < SCROLL_MS + HOLD_MS;
  const leg = Math.min((down ? t : t - SCROLL_MS - HOLD_MS) / SCROLL_MS, 1);
  return easeInOut(down ? leg : 1 - leg);
}

/** Scrolls the visible 3-column list down and back, forever, and keeps the other
 *  two on the same month: same section at the top, same fraction of the way into it. */
function useSyncedScroll(followers: number[]) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [section, setSection] = useState(0);

  useEffect(() => {
    const lead = sectionsFor(3);
    const others = followers.map(sectionsFor);
    const began = performance.now();
    let raf = 0;
    let shown = 0;

    const frame = (now: number) => {
      const y = SCROLL_TO * pingPong(now - began);

      // The same mapping as the scroll handler on the slide.
      let k = lead.findLastIndex((s) => s.start <= y);
      k = Math.max(k, 0);
      const into = (y - lead[k].start) / lead[k].height;

      refs.current[0]?.style.setProperty('transform', `translateY(${-y}px)`);
      others.forEach((sections, i) => {
        const yi = sections[k].start + into * sections[k].height;
        refs.current[i + 1]?.style.setProperty('transform', `translateY(${-yi}px)`);
      });
      if (k !== shown) setSection((shown = k));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [followers]);

  return { refs, section };
}

/** Lead first, then the lists that follow it. */
const FOLLOWERS = [1, 5];

/** Step 2: the visible list scrolls, and pulls the other two to the same date. */
function SyncedLists() {
  const { refs, section } = useSyncedScroll(FOLLOWERS);
  // refs[0] is the 3-column lead; refs[1] and refs[2] follow it.
  const refIndex = (columns: number) => (columns === 3 ? 0 : FOLLOWERS.indexOf(columns) + 1);
  return (
    <div>
      <div className="gp-lists synced">
        {ZOOMS.map((z, i) => (
          <div key={z.columns} className="gp-sync-cell">
            {i === 1 && <div className="gp-arrow left"><span>scrollTo</span></div>}
            <figure className="gp-list">
              <MiniGrid columns={z.columns} height={250} active={z.active} dim={!z.active}
                mark={SECTIONS[section]} contentRef={(el) => { refs.current[refIndex(z.columns)] = el; }} />
            </figure>
            {i === 1 && <div className="gp-arrow right"><span>scrollTo</span></div>}
          </div>
        ))}
      </div>
      <Code lang="jsx">{SYNC_CODE}</Code>
    </div>
  );
}

const LAYOUT_CODE = `// Known before render: headers are fixed,
// photo rows are width / columns.
const offsets = precompute(sections, columns);

<Animated.FlatList
  getItemLayout={(_, index) => ({
    length: offsets[index + 1] - offsets[index],
    offset: offsets[index],
    index,
  })}
/>

// Scrubbing: thumb position → exact offset
const offset = thumbY * scale;
list.scrollToOffset({ offset, animated: false });
label = monthAt(offsets, offset);`;

/** How much of the grid step 3 shows. */
const RULER_H = 340;
const THUMB_H = 30;

/** Step 3's grid, worked out once so the animation effect never restarts. */
const SCRUB_COLUMNS = 3;
const SCRUB_ROWS = rowsFor(SCRUB_COLUMNS);
const SCRUB_OFFSETS = offsetsFor(SCRUB_ROWS, SCRUB_COLUMNS);
const SCRUB_SECTIONS = sectionsFor(SCRUB_COLUMNS);
const SCRUB_MAX = SCRUB_OFFSETS[SCRUB_ROWS.length] - RULER_H;

/** Step 3: the scrubber drags down and back; the grid scrolls with it, and the
 *  pill's month, the top header and the bold offset always agree. */
function RowOffsets() {
  const gridRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);

  useEffect(() => {
    const began = performance.now();
    let raf = 0;
    let shown = 0;
    const frame = (now: number) => {
      const f = pingPong(now - began);
      const y = f * SCRUB_MAX;
      const move = `translateY(${-y}px)`;
      gridRef.current?.style.setProperty('transform', move);
      rulerRef.current?.style.setProperty('transform', move);
      scrubRef.current?.style.setProperty('top', `${f * (RULER_H - THUMB_H)}px`);
      const k = Math.max(SCRUB_SECTIONS.findLastIndex((sec) => sec.start <= y), 0);
      if (k !== shown) setSection((shown = k));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const markRow = section * 3;
  return (
    <div className="gp-offsets">
      <div className="gp-ruler-wrap">
        <MiniGrid columns={SCRUB_COLUMNS} height={RULER_H} active mark={SECTIONS[section]} contentRef={gridRef}
          overlay={
            // The scrubber, on the grid's right edge: a date label and the handle the finger drags.
            <div ref={scrubRef} className="gp-scrub" style={{ height: THUMB_H }}>
              <span className="gp-scrub-label">{SECTIONS[section]}</span>
              <span className="gp-scrub-thumb" />
            </div>
          } />
        <div className="gp-ruler" style={{ height: RULER_H }}>
          <div ref={rulerRef}>
            {SCRUB_ROWS.map((row, i) => (
              <span key={i} className={i === markRow ? 'mark' : ''}
                style={{ top: SCRUB_OFFSETS[i], height: rowHeight(row, SCRUB_COLUMNS) }}>
                {SCRUB_OFFSETS[i]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Code lang="jsx">{LAYOUT_CODE}</Code>
    </div>
  );
}

const VISUALS = [<ThreeLists />, <SyncedLists />, <RowOffsets />];

function GooglePhotos({ step }: { step: number }) {
  const current = Math.min(step, POINTS.length - 1);
  return (
    <div className="layout-threads layout-fill layout-google-photos">
      <h2>Example 2</h2>
      <div className="gp-row">
        <ol className="gp-points">
          {POINTS.map((point, i) => (
            <li key={i} className={i === current ? 'current' : ''}>{point}</li>
          ))}
        </ol>
        <div className="gp-visual" key={current}>{VISUALS[current]}</div>
      </div>
    </div>
  );
}

const slide: SlideDef = {
  content: (step: number) => <GooglePhotos step={step} />,
  steps: POINTS.length,
  notes: `How the Google Photos style pinch-to-zoom grid is put together. Three presses.

1. THREE LISTS — one list per zoom level: 1, 3 and 5 columns. All three are mounted and rendered at the same time. Only the current one is visible; the others sit underneath at opacity 0. So when you pinch, there is nothing to render. We only cross-fade and scale between lists that already exist.

2. SYNC WITH scrollTo — when the visible list scrolls, the other two must show the same date, or the zoom would jump to a different month. Watch the demo: the 3-column list scrolls, and the 1- and 5-column lists follow, always on the same month. The scroll handler is a worklet. It finds which month is at the top and how far into it, then calls Reanimated's scrollTo on the other two lists with the matching position in their own offsets. scrollTo runs on the UI thread and is synchronous, so all three lists move in the same frame.

3. PRECOMPUTED ROW HEIGHTS — every row's height is known before rendering: headers have a fixed height, and a photo row is the screen width divided by the column count. We add them up once into an offsets array and give it to getItemLayout. Now the list never has to measure.
Watch the demo: the date scrubber is dragged down and back. The thumb position becomes an exact offset, the list scrolls there, and the month label comes from the same offsets array. So the label on the pill, the month at the top, and the bold offset always agree. Without getItemLayout, the list has to guess the heights of rows it has not rendered yet, so scrubbing lands on the wrong month and the label is wrong.`,
};

export default slide;
