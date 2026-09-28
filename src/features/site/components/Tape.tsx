import { Fragment } from 'react';

/**
 * A full-bleed band of display type between sheets. Decorative (the words
 * appear elsewhere on the page), so it's hidden from assistive tech. Three
 * identical runs let the track loop seamlessly or slide with the scroll.
 */
export function Tape({ items, reverse = false }: { items: readonly string[]; reverse?: boolean }) {
  return (
    <div className={`tape${reverse ? ' tape--reverse' : ''}`} aria-hidden="true">
      <div className="tape__band">
        <div className="tape__track">
          {[0, 1, 2].map((run) => (
            <span key={run}>
              {items.map((t) => (
                <Fragment key={t}>
                  {t}
                  <i>✦</i>
                </Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
