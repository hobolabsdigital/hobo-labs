'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { CONTACT, SHEETS, type SheetHref } from '../content';

/**
 * Small screens: the set's sheet index in place of the nav links, and the
 * CVs in place of the nav's CV chip. A plain <details>, so it opens without
 * JS; with JS it also closes once a link is taken (the in-page Contact jump
 * would otherwise leave it hanging open).
 */
export function NavIndex({ current }: { current: SheetHref }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute('open');
  return (
    <details
      ref={ref}
      className="nav__index"
      onKeyDown={(e) => {
        if (e.key === 'Escape') close();
      }}
    >
      <summary className="chip">Sheets</summary>
      <ol className="nav__index-panel" onClick={(e) => (e.target as Element).closest('a') && close()}>
        {SHEETS.map((s) => (
          <li key={s.n}>
            <Link href={s.href} aria-current={current === s.href ? 'page' : undefined}>
              <span className="nav__index-n">{s.n}</span>
              <span className="nav__index-label">{s.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <a href="#contact">
            <span className="nav__index-n">→</span>
            <span className="nav__index-label">Contact</span>
          </a>
        </li>
        {CONTACT.cvs.map((cv) => (
          <li key={cv.href} className="nav__index-cv">
            <a href={cv.href} download>
              <span className="nav__index-n">↓</span>
              <span className="nav__index-label">{cv.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
