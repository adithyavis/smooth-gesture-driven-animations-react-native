import './diagram.css';

/** A small rounded label, used for thread names and edge labels. */
export function Pill({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={13} fill="#242c3a"
        stroke="rgba(120,180,240,0.28)" />
      <text x={x + w / 2} y={y + 18} className="d-pill" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
