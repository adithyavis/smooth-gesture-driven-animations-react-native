import type { ReactNode } from 'react';
import './layouts.css';

type Lang = 'jsx' | 'swift';

const KEYWORDS: Record<Lang, Set<string>> = {
  jsx: new Set(['const', 'let', 'function', 'return', 'true', 'false', 'null']),
  swift: new Set(['let', 'var', 'func', 'return', 'self', 'true', 'false', 'nil']),
};

/** Comments, strings, numbers, identifiers; everything between is punctuation. */
const TOKEN = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/gm;

/** Just enough highlighting for short slide snippets, without a dependency. */
function highlight(src: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN)) {
    const i = m.index;
    if (i > last) out.push(src.slice(last, i));
    const [text, comment, string, number, ident] = m;
    let cls = '';
    if (comment) cls = 'tok-comment';
    else if (string) cls = 'tok-string';
    else if (number) cls = 'tok-number';
    else if (ident) {
      const next = src.slice(i + text.length).match(/^\s*(\S)/)?.[1];
      if (KEYWORDS[lang].has(text)) cls = 'tok-keyword';
      else if (/^[A-Z]/.test(text)) cls = 'tok-type';
      else if (next === ':' || (lang === 'jsx' && next === '=')) cls = 'tok-prop';
      else if (next === '(') cls = 'tok-fn';
      else if (src[i - 1] === '.') cls = 'tok-member';
    }
    out.push(cls ? <span key={i} className={cls}>{text}</span> : text);
    last = i + text.length;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
}

export function Code({
  lang,
  mark,
  children,
}: {
  lang: Lang;
  /** Line ranges to highlight, 1-based and inclusive: [[from, to], ...]. */
  mark?: [number, number][];
  children: string;
}) {
  return (
    <div className="layout-code">
      <pre>
        <code>
          {mark?.map(([from, to], i) => (
            <span key={from} className="code-mark" aria-hidden="true"
              style={{
                top: `${from - 1}lh`,
                height: `${to - from + 1}lh`,
                animationDelay: `${500 + i * 180}ms`,
              }} />
          ))}
          {highlight(children, lang)}
        </code>
      </pre>
    </div>
  );
}
