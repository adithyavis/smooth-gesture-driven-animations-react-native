import type { ReactNode } from 'react';
import './layouts.css';

/* Text layouts: use these to build simple slides quickly. */

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="layout-title">
      <h1>{children}</h1>
      {sub && <p className="sub">{sub}</p>}
    </div>
  );
}

export function Bullets({ heading, items }: { heading: ReactNode; items: ReactNode[] }) {
  return (
    <div className="layout-bullets">
      <h2>{heading}</h2>
      <ul>
        {items.map((item, i) => (
          <li key={i} style={{ animationDelay: `${120 + i * 90}ms` }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Statement({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="layout-statement">
      <p className="big">{children}</p>
      {note && <p className="note">{note}</p>}
    </div>
  );
}

export function Quote({ children, by }: { children: ReactNode; by?: ReactNode }) {
  return (
    <div className="layout-quote">
      <blockquote>{children}</blockquote>
      {by && <cite>— {by}</cite>}
    </div>
  );
}

export function Columns({ children }: { children: ReactNode }) {
  return <div className="layout-columns">{children}</div>;
}
