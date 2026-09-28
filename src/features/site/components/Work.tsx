import { ALSO, EDUCATION, PARTS } from '../content';
import { SheetHead } from './Sheet';
import { WorkList } from './WorkList';

export function Work() {
  return (
    <section id="work" className="section" data-sheet="07" data-sheet-label="Section view">
      <SheetHead n="06" title="Selected work 2016 — 2026" label="Section view" />
      <WorkList />
      <p className="footnote" data-reveal>
        {ALSO}
      </p>

      <div className="parts">
        <SheetHead n="07" title="Parts list" label="Tooling legend" />
        <table className="parts__table" data-reveal>
          <tbody>
            {PARTS.map((p) => (
              <tr key={p.k}>
                <th scope="row">{p.k}</th>
                <td>{p.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="footnote" data-reveal>
          {EDUCATION}
        </p>
      </div>
    </section>
  );
}
