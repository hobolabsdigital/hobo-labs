import { ORCHESTRATION } from '../content';
import { Pipeline } from './Pipeline';
import { ExtLink, Headline, SheetHead } from './Sheet';

/**
 * One gauntlet, drawn: work goes out to a blind critic, the exact gaps come
 * back, and the third round passes. Unanimated, it rests on the final state
 * (two fails, one pass), which is what reduced motion sees.
 */
function Gauntlet() {
  return (
    <figure className="gauntlet" data-reveal>
      <div
        className="gauntlet__board"
        role="img"
        aria-label="The lead briefs a builder. The builder sends its work and gate totals to a blind critic; the critic sends back the exact gaps. Two rounds fail, the third passes, and the lead re-checks before it goes to merge."
      >
        <div className="gauntlet__lead">
          <span className="gauntlet__role">Lead</span>
          <span className="gauntlet__duty">decides · briefs · re-checks · never builds</span>
        </div>
        <div className="gauntlet__node gauntlet__node--builder">
          <span className="gauntlet__role">Builder</span>
          <span className="gauntlet__duty">one worktree, one branch</span>
        </div>
        <div className="gauntlet__wires">
          <div className="gauntlet__wire gauntlet__wire--out">
            <span className="gauntlet__label">work + gate totals →</span>
            <span className="gauntlet__carrier">
              <i />
            </span>
          </div>
          <div className="gauntlet__wire gauntlet__wire--back">
            <span className="gauntlet__label">← the exact gaps</span>
            <span className="gauntlet__carrier">
              <i />
            </span>
          </div>
        </div>
        <div className="gauntlet__node gauntlet__node--critic">
          <span className="gauntlet__role">Critic</span>
          <span className="gauntlet__duty">fresh context · blind</span>
          <span className="gauntlet__verdict gauntlet__verdict--fail">✕ gaps</span>
          <span className="gauntlet__verdict gauntlet__verdict--pass">✓ pass</span>
        </div>
        <ol className="gauntlet__rounds">
          <li className="gauntlet__round gauntlet__round--1" data-r="R1">
            R1
          </li>
          <li className="gauntlet__round gauntlet__round--2" data-r="R2">
            R2
          </li>
          <li className="gauntlet__round gauntlet__round--3" data-r="R3">
            R3
          </li>
          <li className="gauntlet__merge">→ merge</li>
        </ol>
      </div>
      <figcaption>
        <span>Fig. 5.1</span> One gauntlet. The critic never sees the builder’s own verdict, and the loop exits on evidence, not claims.
      </figcaption>
    </figure>
  );
}

export function Orchestration() {
  return (
    <section id="orchestration" className="section orchestration" data-sheet="06" data-sheet-label="Orchestration">
      <SheetHead n="05" title="Orchestration" label="How the agent team runs" />

      <Headline lines={ORCHESTRATION.title} as="h3" className="headline--section" />
      <div className="split">
        <div className="split__main" data-reveal>
          <p className="lede">{ORCHESTRATION.intro}</p>
        </div>
        <dl className="facts" data-reveal="stagger">
          {ORCHESTRATION.rig.map((r) => (
            <div key={r.k} className="facts__row">
              <dt>{r.k}</dt>
              <dd>{r.href ? <ExtLink href={r.href}>{r.v} ↗</ExtLink> : r.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <h4 className="caption-head" data-reveal>
        Fig. 5.0 — One change, ticket to main. Every hop leaves a record an agent can read.
      </h4>
      <Pipeline stages={ORCHESTRATION.flow} loops={ORCHESTRATION.flowLoops} className="pipeline--rig" />

      <div className="rig-duo">
        <Gauntlet />
        <dl className="rig-stats">
          {ORCHESTRATION.stats.map((s) => (
            <div key={s.label} className="rig-stat" data-reveal="content">
              <dt className="rig-stat__value">{s.value}</dt>
              <dd className="rig-stat__label">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="systems">
        {ORCHESTRATION.cards.map((c) => (
          <article key={c.id} className="system" data-reveal="content">
            <header className="system__head">
              <span className="system__id">{c.id}</span>
              <h4 className="system__title">{c.title}</h4>
            </header>
            <p className="system__body">{c.body}</p>
            <p className="system__stack">
              <span>Stack →</span> {c.stack}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
