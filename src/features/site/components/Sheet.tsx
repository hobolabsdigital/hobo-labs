import type { ReactNode } from 'react';

/**
 * Section header in the CV's drawing-sheet grammar: §NN TITLE ——— RIGHT LABEL.
 * A sheet's opening head is its page title (`as="h1"`).
 */
export function SheetHead({
  n,
  title,
  label,
  as: Tag = 'h2',
}: {
  n: string;
  title: string;
  label?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className="sheet-head" data-reveal="rule">
      <span className="sheet-head__n">§{n}</span>
      <Tag className="sheet-head__title">{title}</Tag>
      {label && <span className="sheet-head__label">{label}</span>}
    </div>
  );
}

type Cell = { k: string; v: ReactNode };

/** The CV's title block: DOCUMENT / PROJECT / SCALE / DATE / SHEET. */
export function TitleBlock({ cells, className = '' }: { cells: Cell[]; className?: string }) {
  return (
    <dl className={`title-block ${className}`}>
      {cells.map((c) => (
        <div key={c.k} className="title-block__cell">
          <dt>{c.k}</dt>
          <dd>{c.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Headline with the letter's move: last line knocked out in a solid bar.
 * Lines rise out of their own masks on reveal (`reveal={false}` for the hero,
 * which plays the same move on load instead of on scroll).
 */
export function Headline({
  lines,
  as: Tag = 'h3',
  className = '',
  knockLast = true,
  reveal = true,
  srPrefix,
  id,
}: {
  lines: readonly string[];
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  knockLast?: boolean;
  reveal?: boolean;
  srPrefix?: string;
  id?: string;
}) {
  return (
    <Tag className={`headline ${className}`} id={id} data-reveal={reveal ? 'lines' : undefined}>
      {srPrefix && <span className="sr-only">{srPrefix} </span>}
      {lines.map((l, i) => (
        <span
          key={l}
          className={`headline__line${knockLast && i === lines.length - 1 ? ' headline__line--knock' : ''}`}
          style={{ '--i': i } as React.CSSProperties}
        >
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function ExtLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
