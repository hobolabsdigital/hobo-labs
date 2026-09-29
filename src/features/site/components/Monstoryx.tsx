import Image from 'next/image';
import { MONSTORYX } from '../content';
import { FinaleFilm } from './FinaleFilm';
import { Pipeline } from './Pipeline';
import { QuestSequence } from './QuestSequence';
import { ExtLink, Headline, SheetHead } from './Sheet';

// Stages whose gate can bounce work back once.
const FINALE_RETRIES = { Script: '↺ retry ×1', 'Vision QA': '↺ retry ×1', Render: '↺ retry ×1' };

export function Monstoryx() {
  return (
    <section id="monstoryx" className="section monstoryx">
      <SheetHead n="03" title="MonstoryX" label={`${MONSTORYX.role} · ${MONSTORYX.years}`} as="h1" />

      <Headline lines={MONSTORYX.title} as="h2" className="headline--section" />
      <div className="split">
        <div className="split__main" data-reveal>
          <p className="lede">{MONSTORYX.intro}</p>
        </div>
        <div className="split__side">
          <ExtLink href={MONSTORYX.summit.href} className="summit-stamp">
            <span className="summit-stamp__event" data-reveal="stamp">
              <span className="summit-stamp__top">{MONSTORYX.summit.event}</span>
              <span className="summit-stamp__tracks">{MONSTORYX.summit.tracks.join(' · ')}</span>
              <span className="summit-stamp__meta">{MONSTORYX.summit.dates} · Education · Austria</span>
            </span>
          </ExtLink>
          <ul className="link-list" data-reveal="stagger">
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
      </div>

      <QuestSequence />

      <h3 className="caption-head" data-reveal>
        Fig. 3.1 — The Finale pipeline: a mission’s quests become a narrated film. Every hop an agent run, every gate
        code.
      </h3>
      <Pipeline stages={MONSTORYX.pipeline} loops={FINALE_RETRIES} />
      <FinaleFilm />

      <div className="systems">
        {MONSTORYX.systems.map((s) => (
          <article key={s.id} className="system" data-reveal="content">
            <header className="system__head">
              <span className="system__id">{s.id}</span>
              <h3 className="system__title">{s.title}</h3>
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
              <span>Fig. 3.{i + 3}</span> {i === 0 ? 'The cast — sculpted in plasticine, rigged in UE5' : 'The front door — speak to play'}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
