import Image from 'next/image';
import { NUTRONS } from '../content';
import { ExtLink, Headline, SheetHead } from './Sheet';

const GALLERY = [
  { src: '/work/nutrons/product.webp', w: 1600, h: 1076, cap: 'Product — halftone, starbursts, the pack as hero', area: 'a' },
  { src: '/work/nutrons/crew.webp', w: 1600, h: 908, cap: 'The crew — four elements, four characters', area: 'b' },
  { src: '/work/nutrons/worlds.webp', w: 1600, h: 850, cap: 'Worlds of Nu-Terra — carousel', area: 'c' },
  { src: '/work/nutrons/mobile-hero.webp', w: 393, h: 640, cap: 'Mobile 393', area: 'd' },
  { src: '/work/nutrons/canopy-run.webp', w: 1600, h: 623, cap: 'Canopy Run — hold to rise, release to dive', area: 'e' },
  { src: '/work/nutrons/funnel.webp', w: 1600, h: 598, cap: 'Scan. Collect. Play. — the reward loop', area: 'f' },
];

export function Nutrons() {
  return (
    <section id="nutrons" className="section nutrons" data-sheet="03" data-sheet-label="Nutrons">
      <SheetHead n="02" title="Latest — Nutrons" label={`${NUTRONS.client} · ${NUTRONS.year}`} />

      <div className="nutrons__stripe" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <Headline lines={NUTRONS.title} as="h3" className="headline--section" />
      <div className="split">
        <div className="split__main" data-reveal>
          <p className="lede">{NUTRONS.intro}</p>
          <div className="live-links">
            {NUTRONS.live.map((l) => (
              <ExtLink key={l.href} href={l.href} className="tag tag--live">
                Live → {l.label}
              </ExtLink>
            ))}
          </div>
        </div>
        <dl className="facts" data-reveal>
          {NUTRONS.facts.map((f) => (
            <div key={f.k} className="facts__row">
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <figure className="plate plate--hero" data-reveal>
        <div className="plate__img">
          <Image
            src="/work/nutrons/hub-hero.webp"
            alt="Nutrons hub hero: four nut superheroes surf leaves past the World Tree of Nu-Terra under the Nutrons logo."
            width={1600}
            height={850}
            sizes="(min-width: 1100px) 92vw, 100vw"
          />
        </div>
        <figcaption>
          <span>Fig. 2.0</span> Hub, desktop 1728 — built from the Nutrons design system v0.1
        </figcaption>
      </figure>

      <ol className="trail">
        {NUTRONS.trail.map((s) => (
          <li key={s.n} className="trail__row" data-reveal>
            <span className="trail__n">{s.n}</span>
            <h4 className="trail__title">{s.title}</h4>
            <div className="trail__body">
              <p>{s.body}</p>
              <div className="trail__links">
                {s.links.map((l) => (
                  <ExtLink key={l.href} href={l.href} className={`tag${'live' in l && l.live ? ' tag--live' : ''}`}>
                    {l.label}
                  </ExtLink>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="gallery">
        {GALLERY.map((g, i) => (
          <figure key={g.src} className={`plate gallery__${g.area}`} data-reveal>
            <div className="plate__img">
              <Image src={g.src} alt={g.cap} width={g.w} height={g.h} sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
            <figcaption>
              <span>Fig. 2.{i + 1}</span> {g.cap}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="footnote" data-reveal>
        {NUTRONS.coaching}
      </p>
    </section>
  );
}
