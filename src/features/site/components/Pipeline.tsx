import { MONSTORYX } from '../content';

// Stages whose gate can bounce work back once (the dashed retry loop).
const RETRY = new Set(['Script', 'Vision QA', 'Render']);

/**
 * The Finale pipeline as a drawing: a packet travels the rail, each node
 * lights as it passes. Pure CSS timing — node i fires at i/(n-1) of the loop.
 */
export function Pipeline() {
  const stages = MONSTORYX.pipeline;
  return (
    <div className="pipeline" data-reveal>
      <div className="pipeline__rail" aria-hidden="true">
        <span className="pipeline__packet" />
      </div>
      <ol className="pipeline__stages" style={{ '--n': stages.length } as React.CSSProperties}>
        {stages.map((s, i) => (
          <li key={s.stage} className="pipeline__stage" style={{ '--i': i } as React.CSSProperties}>
            <span className="pipeline__node" aria-hidden="true" />
            {RETRY.has(s.stage) && (
              <span className="pipeline__retry" aria-hidden="true">
                ↺ retry ×1
              </span>
            )}
            <span className="pipeline__idx">{String(i + 1).padStart(2, '0')}</span>
            <span className="pipeline__name">{s.stage}</span>
            <span className="pipeline__gate">{s.gate}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
