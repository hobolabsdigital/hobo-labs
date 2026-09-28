import { CONTACT, HERO } from '../content';
import { HeroStage } from './HeroStage';
import { Headline, TitleBlock } from './Sheet';

export function Hero() {
  return (
    <HeroStage>
      <span className="reg reg--tl" aria-hidden="true" />
      <span className="reg reg--tr" aria-hidden="true" />
      <span className="reg reg--bl" aria-hidden="true" />
      <span className="reg reg--br" aria-hidden="true" />

      {/* Rides along with the lens (positions come from --lens-x/y/r set by the shader loop). */}
      <div className="lens-tag" aria-hidden="true">
        <span className="lens-tag__title">Judge / 01 · trait check</span>
        <span className="lens-tag__coords">
          x <b data-readout="x">0.000</b> y <b data-readout="y">0.000</b>
        </span>
      </div>

      <div className="hero__meter" aria-hidden="true">
        <span>
          Generated <b data-readout="gen">0</b>
        </span>
        <span>
          On brand <b data-readout="brand">0</b>
        </span>
      </div>

      <div className="hero__copy">
        <p className="hero__kicker">
          <span className="dot" aria-hidden="true" /> {HERO.kicker} · Available for the right brief
        </p>
        <Headline
          id="hero-title"
          lines={HERO.lines}
          as="h1"
          className="headline--hero"
          srPrefix="Emile Harmel, creative technologist and senior engineer:"
        />
        <div className="hero__aside">
          <p className="hero__intro hero__intro--long">{HERO.intro}</p>
          <p className="hero__intro hero__intro--short">{HERO.introShort}</p>
          <div className="hero__ctas">
            <a className="btn btn--ink" href="#nutrons">
              See the work ↓
            </a>
            <a className="btn" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </div>
        </div>
      </div>

      <TitleBlock
        className="hero__title-block"
        cells={[
          { k: 'Document', v: 'Portfolio — Emile Harmel' },
          { k: 'Discipline', v: HERO.roles.slice(0, 2).join(' · ') },
          { k: 'Base', v: `${CONTACT.base} · CET` },
          { k: 'Date', v: '2026-09' },
          { k: 'Sheet', v: '01 / 07' },
        ]}
      />
    </HeroStage>
  );
}
