import { ALSO, EDUCATION, PARTS } from '../content';
import { SheetHead } from './Sheet';
import { WorkList } from './WorkList';

export function Work() {
  return (
    <section id="archive" className="section">
      <SheetHead n="05" title="Selected work 2016 — 2026" label="Section view" as="h1" />
      <WorkList />
      <p className="footnote" data-reveal>
        {ALSO}
      </p>

      <div className="parts">
        <SheetHead n="05.1" title="Parts list" label="Tooling legend" />
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
