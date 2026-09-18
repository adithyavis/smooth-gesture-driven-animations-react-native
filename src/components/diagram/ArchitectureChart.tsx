import { Pill } from './Pill';
import './diagram.css';

/** The architecture chart. Pass `active` to dim everything except those ids;
 *  pass null for the plain, fully-lit version. */
export function ArchitectureChart({ active = null }: { active?: string[] | null }) {
  const on = (...ids: string[]) =>
    active === null || ids.some((id) => active.includes(id)) ? 1 : 0.16;
  // Entrance animation and per-step dimming both drive opacity, so only one
  // of them can be switched on at a time.
  const cls = (c: string) => (active === null ? c : undefined);

  return (
    <svg viewBox="0 0 1072 470" className="diagram" role="img"
      aria-label="React and types compile via Metro and Codegen into a JS bundle, which talks over JSI to the renderer and native modules on the UI thread. Yoga computes layout on the shadow thread. Reanimated's worklet runtime sits alongside, also on the UI thread.">
      <defs>
        <marker id="tip" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#9fb3c8" />
        </marker>
      </defs>

      <g className={cls('col c1')}>
        <g opacity={on('react')}>
          <rect x="0" y="210" width="170" height="58" rx="10" fill="#1b5fa8" />
          <text x="85" y="246" className="d-box" textAnchor="middle">React</text>
        </g>
        <g opacity={on('metro')}>
          <line x1="172" y1="245" x2="244" y2="245" stroke="#9fb3c8" strokeWidth="2"
            markerEnd="url(#tip)" />
          <Pill x={171} y={212} w={76} label="Metro" />
        </g>
      </g>

      <g className={cls('col c2')} opacity={on('bundle')}>
        <Pill x={297} y={168} w={86} label="JS thread" />
        <rect x="250" y="200" width="180" height="76" rx="10" fill="#2e9fe0" />
        <text x="340" y="246" className="d-box" textAnchor="middle">JS Bundle</text>
      </g>

      <g className={cls('col c2')} opacity={on('bundle', 'jsi')}>
        <line x1="434" y1="218" x2="506" y2="218" stroke="#9fb3c8" strokeWidth="2"
          markerStart="url(#tip)" markerEnd="url(#tip)" />
        <line x1="434" y1="250" x2="506" y2="250" stroke="#9fb3c8" strokeWidth="2"
          markerStart="url(#tip)" markerEnd="url(#tip)" />
      </g>

      <g className={cls('col c3')} opacity={on('yoga')}>
        <Pill x={595} y={0} w={140} label="Shadow thread" />
        <rect x="558" y="32" width="214" height="66" rx="10" fill="#f0c44a" />
        <text x="665" y="74" className="d-yoga" textAnchor="middle">Yoga</text>
        <line x1="665" y1="100" x2="665" y2="174" stroke="#9fb3c8" strokeWidth="2"
          markerStart="url(#tip)" markerEnd="url(#tip)" />
        <Pill x={680} y={142} w={96} label="UI thread" />
      </g>

      <g className={cls('col c4')}>
        <rect x="505" y="175" width="285" height="160" rx="14"
          fill="rgba(120,180,240,0.12)" stroke="rgba(120,180,240,0.3)"
          opacity={on('jsi', 'renderer', 'nativeModules')} />
        <g opacity={on('jsi')}>
          <rect x="512" y="185" width="36" height="140" rx="8" fill="#3e8fd0" />
          <text x="530" y="296" className="d-jsi" textAnchor="middle">JSI</text>
        </g>
        <g opacity={on('renderer')}>
          <rect x="558" y="188" width="214" height="62" rx="9" fill="#4a90d9" />
          <text x="665" y="226" className="d-box-sm" textAnchor="middle">Renderer</text>
        </g>
        <g opacity={on('nativeModules')}>
          <rect x="558" y="258" width="214" height="62" rx="9" fill="#4a90d9" />
          <text x="665" y="296" className="d-box-sm" textAnchor="middle">Native Modules</text>
        </g>
      </g>

      <g className={cls('col c5')}>
        <g opacity={on('nativeUI')}>
          <line x1="774" y1="219" x2="846" y2="219" stroke="#9fb3c8" strokeWidth="2"
            markerStart="url(#tip)" markerEnd="url(#tip)" />
        </g>
        <g opacity={on('nativeModules')}>
          <line x1="774" y1="289" x2="846" y2="289" stroke="#9fb3c8" strokeWidth="2"
            markerStart="url(#tip)" markerEnd="url(#tip)" />
        </g>
        <rect x="852" y="178" width="220" height="152" rx="14"
          fill="rgba(120,180,240,0.12)" stroke="rgba(120,180,240,0.3)"
          opacity={on('nativeUI', 'nativeModules')} />
        <g opacity={on('nativeUI')}>
          <rect x="858" y="188" width="208" height="62" rx="9" fill="#4a90d9" />
          <text x="962" y="226" className="d-box-sm" textAnchor="middle">Native UI</text>
        </g>
        <g opacity={on('nativeModules')}>
          <rect x="858" y="258" width="208" height="62" rx="9" fill="#4a90d9" />
          <text x="962" y="296" className="d-box-sm" textAnchor="middle">Native Modules</text>
        </g>
      </g>
    </svg>
  );
}
