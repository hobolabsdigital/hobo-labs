'use client';

import { useEffect, useState } from 'react';
import { SHEET_COUNT } from '../content';

/**
 * Page-level behaviour with no markup of its own beyond the sheet tab:
 * - reveals [data-reveal] elements as they enter the viewport
 * - tracks which [data-sheet] section is current and shows it in a mini
 *   title block, bottom-right (hidden while the hero is on screen)
 */
export function PageChrome() {
  const [sheet, setSheet] = useState<{ n: string; label: string } | null>(null);

  useEffect(() => {
    const timers: number[] = [];
    const revealIO = new IntersectionObserver(
      (entries) => {
        // Everything that arrives in one batch cascades in DOM order, so a
        // grid row or a list lands as a sequence rather than all at once.
        let k = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const delay = Math.min(k++, 6) * 85;
          el.style.setProperty('--reveal-delay', `${delay}ms`);
          // An attribute, not a class: React rewrites className on re-render
          // (e.g. WorkList's hover state) and would silently un-reveal the row.
          el.setAttribute('data-revealed', '');
          revealIO.unobserve(el);
          // Drop the delay once it has played, so hover transitions aren't late.
          timers.push(window.setTimeout(() => el.style.removeProperty('--reveal-delay'), delay + 1600));
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => revealIO.observe(el));

    const sheets = Array.from(document.querySelectorAll<HTMLElement>('[data-sheet]'));
    const sheetIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setSheet(el.dataset.sheet === '01' ? null : { n: el.dataset.sheet ?? '', label: el.dataset.sheetLabel ?? '' });
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    sheets.forEach((el) => sheetIO.observe(el));

    return () => {
      revealIO.disconnect();
      sheetIO.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={`sheet-tab${sheet ? ' is-on' : ''}`} aria-hidden="true">
      <span className="sheet-tab__k">Sheet</span>
      <span className="sheet-tab__v">{sheet ? `${sheet.n} / ${SHEET_COUNT}` : `01 / ${SHEET_COUNT}`}</span>
      <span className="sheet-tab__label">{sheet?.label ?? 'General arrangement'}</span>
    </div>
  );
}
