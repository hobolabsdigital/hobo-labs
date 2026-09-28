import Image from 'next/image';
import { NUTRONS } from '../content';
import { ExtLink, Headline, SheetHead } from './Sheet';
import { Showreel } from './Showreel';

// Screens and comics carry fine line work; the default q75 smears it.
const WORK_QUALITY = 90;

// The live build (screens from portal.getnutrons.com), all 1041×778.
const SHIPPED = [
  { src: '/work/nutrons/run-junkropolis.webp', cap: 'Canopy Run, Junkropolis — hold to rise, release to dive; Ghost Glow active', area: 'a' },
  { src: '/work/nutrons/run-venus-city.webp', cap: 'Venus-City — world two, levels 6–10', area: 'b' },
  { src: '/work/nutrons/run-over.webp', cap: 'Run over — Seeds banked, chain bonus, one more run', area: 'c' },
  { src: '/work/nutrons/base-camp.webp', cap: 'Base Camp — XP, streaks, heroes, worlds and the community World Tree', area: 'd' },
  { src: '/work/nutrons/heroes.webp', cap: 'Heroes — four Nutrons, stats per hero', area: 'e' },
];

// The same product as designed in Figma.
const DESIGNED = [
  { src: '/work/nutrons/product.webp', w: 1728, h: 1163, cap: 'Product — halftone, starbursts, the pack as hero', area: 'a' },
  { src: '/work/nutrons/mobile-hero.webp', w: 393, h: 640, cap: 'Mobile 393', area: 'd' },
  { src: '/work/nutrons/crew.webp', w: 1728, h: 980, cap: 'The crew — four elements, four characters', area: 'b' },
  { src: '/work/nutrons/worlds.webp', w: 1728, h: 918, cap: 'Worlds of Nu-Terra — carousel', area: 'c' },
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
        <dl className="facts" data-reveal="stagger">
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
            width={1728}
            height={918}
            quality={WORK_QUALITY}
            sizes="(min-width: 1100px) 92vw, 100vw"
          />
        </div>
        <figcaption>
          <span>Fig. 2.0</span> Hub, desktop 1728 — built from the Nutrons design system v0.1
        </figcaption>
      </figure>

      <Showreel />

      <h4 className="caption-head" data-reveal>
        Shipped — early access, live now. Pick a hero, fly three worlds, bank Seeds, come back to Base Camp.
      </h4>
      <div className="shipped">
        {SHIPPED.map((g, i) => (
          <figure key={g.src} className={`plate shipped__${g.area}`} data-reveal>
            <div className="plate__img">
              <Image
                src={g.src}
                alt={g.cap}
                width={1041}
                height={778}
                quality={WORK_QUALITY}
                sizes={g.area === 'a' ? '(min-width: 900px) 62vw, 100vw' : '(min-width: 900px) 40vw, 100vw'}
              />
            </div>
            <figcaption>
              <span>Fig. 2.{i + 1}</span> {g.cap}
            </figcaption>
          </figure>
        ))}
      </div>

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

      <h4 className="caption-head" data-reveal>
        Designed — the hub in Figma, three breakpoints, one component library.
      </h4>
      <div className="gallery">
        {DESIGNED.map((g, i) => (
          <figure key={g.src} className={`plate gallery__${g.area}`} data-reveal>
            <div className="plate__img">
              <Image
                src={g.src}
                alt={g.cap}
                width={g.w}
                height={g.h}
                quality={WORK_QUALITY}
                sizes="(min-width: 900px) 50vw, 100vw"
              />
            </div>
            <figcaption>
              <span>Fig. 2.{i + 1 + SHIPPED.length}</span> {g.cap}
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
