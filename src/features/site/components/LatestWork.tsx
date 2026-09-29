import Image from 'next/image';
import Link from 'next/link';
import { CASES, INTRO, SHEET_COUNT, sheet } from '../content';
import { SheetHead } from './Sheet';

/**
 * The front page's work: one card per case study, each a way into its own
 * sheet. The title carries the link; the whole card is its hit area.
 */
export function LatestWork() {
  return (
    <section id="work" className="section selected">
      <SheetHead n="01.1" title="Latest work" label="Two products, both live" />
      <p className="selected__lede" data-reveal>
        {INTRO.lede}
      </p>
      <ul className="cases">
        {CASES.map((c) => (
          <li key={c.href} className="case" data-reveal>
            <div className="plate__img case__img">
              <Image
                src={c.image.src}
                alt={c.image.alt}
                width={c.image.w}
                height={c.image.h}
                quality={90}
                sizes="(min-width: 900px) 46vw, 100vw"
              />
            </div>
            <p className="case__meta">
              <span>
                Sheet {sheet(c.href).n} / {SHEET_COUNT}
              </span>
              <span>{c.meta}</span>
            </p>
            <h3 className="case__title">
              <Link className="case__link" href={c.href}>
                {c.title}
              </Link>
            </h3>
            <p className="case__kind">{c.kind}</p>
            <p className="case__body">{c.body}</p>
            <p className="case__foot">
              <span className="case__stamp">{c.stamp}</span>
              <span className="case__cta" aria-hidden="true">
                Open the case study →
              </span>
            </p>
          </li>
        ))}
      </ul>
      <p className="selected__earlier" data-reveal>
        {INTRO.earlier} <Link href="/work">All work, 2016 — 2026 →</Link>
      </p>
    </section>
  );
}
