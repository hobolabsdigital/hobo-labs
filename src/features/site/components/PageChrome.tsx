'use client';

import { useEffect, useState } from 'react';
import { SHEET_COUNT, type Sheet } from '../content';

/**
 * Page-level behaviour with no markup of its own beyond the sheet tab:
 * - reveals [data-reveal] elements as they enter the viewport
 * - shows this page's sheet in a mini title block, bottom-right, except
 *   while a [data-sheet-quiet] block (the hero, which carries its own title
 *   block) holds the middle of the screen
 */
export function PageChrome({ sheet, quietAtTop = false }: { sheet: Sheet; quietAtTop?: boolean }) {
  const [on, setOn] = useState(!quietAtTop);

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

    const quiet = new Set<Element>();
    const quietIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) quiet.add(e.target);
          else quiet.delete(e.target);
        }
        setOn(quiet.size === 0);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    document.querySelectorAll('[data-sheet-quiet]').forEach((el) => quietIO.observe(el));

    return () => {
      revealIO.disconnect();
      quietIO.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={`sheet-tab${on ? ' is-on' : ''}`} aria-hidden="true">
      <span className="sheet-tab__k">Sheet</span>
      <span className="sheet-tab__v">
        {sheet.n} / {SHEET_COUNT}
      </span>
      <span className="sheet-tab__label">{sheet.label}</span>
    </div>
  );
}
