export type PipelineStage = { stage: string; gate: string };

/**
 * A process as a drawing: a packet travels the rail, each node lights as it
 * passes. Pure CSS timing — node i fires at i/(n-1) of the loop. `loops` marks
 * the stages whose gate can bounce work back (the dashed retry label).
 */
export function Pipeline({
  stages,
  loops = {},
  className = '',
}: {
  stages: readonly PipelineStage[];
  loops?: Record<string, string>;
  className?: string;
}) {
  return (
    <div className={`pipeline ${className}`} style={{ '--n': stages.length } as React.CSSProperties} data-reveal>
      <div className="pipeline__rail" aria-hidden="true">
        <span className="pipeline__packet" />
      </div>
      <ol className="pipeline__stages">
        {stages.map((s, i) => (
          <li key={s.stage} className="pipeline__stage" style={{ '--i': i } as React.CSSProperties}>
            <span className="pipeline__node" aria-hidden="true" />
            {loops[s.stage] && (
              <span className="pipeline__retry" aria-hidden="true">
                {loops[s.stage]}
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
