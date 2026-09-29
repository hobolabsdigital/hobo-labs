import Link from 'next/link';
import type { ReactNode } from 'react';
import { nextSheet, SHEET_COUNT, type Sheet } from '../content';
import { Contact } from './Contact';
import { Nav } from './Nav';
import { PageChrome } from './PageChrome';

/** The hand-on at the foot of a sheet: the next page in the set, as one big link. */
function NextSheet({ current }: { current: Sheet }) {
  const next = nextSheet(current);
  if (!next) return null;
  return (
    // The reveal sits on the wrapper: on the link it would override the hover transition.
    <nav className="next-sheet" aria-label="Next sheet" data-reveal>
      <Link className="next-sheet__link" href={next.href}>
        <span className="next-sheet__k">
          Next sheet · {next.n} / {SHEET_COUNT}
        </span>
        <span className="next-sheet__title">{next.label} →</span>
        <span className="next-sheet__note">{next.note}</span>
      </Link>
    </nav>
  );
}

/**
 * Every page is one sheet of the set: nav, the sheet's content, a hand-on to
 * the next sheet, and the contact block with this sheet's title block.
 * `hero` opens the sheet with its own title block, so the sheet tab waits
 * until it has scrolled away.
 */
export function SiteShell({ sheet, hero, children }: { sheet: Sheet; hero?: ReactNode; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="scroll-meter" aria-hidden="true" />
      <Nav current={sheet.href} />
      <main>
        {hero}
        <div id="content" className="sheet-body">
          {children}
        </div>
        <NextSheet current={sheet} />
        <Contact sheet={sheet} />
      </main>
      {/* Keyed so each sheet re-arms its reveals after a client-side navigation. */}
      <PageChrome key={sheet.n} sheet={sheet} quietAtTop={Boolean(hero)} />
    </>
  );
}
