import Image from 'next/image';
import { MONSTORYX } from '../content';
import { Pipeline } from './Pipeline';
import { ExtLink, Headline, SheetHead } from './Sheet';

export function Monstoryx() {
  return (
    <section id="monstoryx" className="section monstoryx" data-sheet="04" data-sheet-label="MonstoryX">
      <SheetHead n="03" title="The platform — MonstoryX" label={`${MONSTORYX.role} · ${MONSTORYX.years}`} />

      <Headline lines={MONSTORYX.title} as="h3" className="headline--section" />
      <div className="split">
        <div className="split__main" data-reveal>
          <p className="lede">{MONSTORYX.intro}</p>
        </div>
        <ul className="link-list" data-reveal>
          {MONSTORYX.links.map((l) => (
            <li key={l.href}>
              <ExtLink href={l.href} className="link-list__a">
                <span className="link-list__label">{l.label} ↗</span>
                <span className="link-list__note">{l.note}</span>
              </ExtLink>
            </li>
          ))}
          <li className="link-list__private">Repository private — I’ll screen-share any part of it.</li>
        </ul>
      </div>

      <h4 className="caption-head" data-reveal>
        Fig. 3.0 — Finale: a quest becomes a narrated film. Every hop an agent run, every gate code.
      </h4>
      <Pipeline />

      <div className="systems">
        {MONSTORYX.systems.map((s) => (
          <article key={s.id} className="system" data-reveal>
            <header className="system__head">
              <span className="system__id">{s.id}</span>
              <h4 className="system__title">{s.title}</h4>
            </header>
            <p className="system__body">{s.body}</p>
            <p className="system__stack">
              <span>Stack →</span> {s.stack}
            </p>
          </article>
        ))}
      </div>

      <div className="duo">
        {[
          { src: '/portfolio/monstory-04.png', alt: 'MonstoryX: the plasticine-sculpted monster cast in their 3D world.' },
          { src: '/portfolio/monstory-02.png', alt: 'MonstoryX website: “A place where language comes alive.”' },
        ].map((img, i) => (
          <figure key={img.src} className="plate plate--duotone" data-reveal>
            <div className="plate__img">
              <Image src={img.src} alt={img.alt} width={1920} height={1080} sizes="(min-width: 900px) 46vw, 100vw" />
            </div>
            <figcaption>
              <span>Fig. 3.{i + 1}</span> {i === 0 ? 'The cast — sculpted in plasticine, rigged in UE5' : 'Children speak. Monsters listen. Stories grow.'}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
