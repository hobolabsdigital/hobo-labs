import Link from 'next/link';
import { METHOD, SHEET_COUNT, sheet } from '../content';
import { SheetHead } from './Sheet';

const RIG = sheet('/orchestration');

export function Method() {
  return (
    <section id="method" className="section method">
      <SheetHead n="01.2" title="Method" label="How the work gets made" />
      <ol className="method__list">
        {METHOD.map((m, i) => (
          <li key={m.title} className="method__row" data-reveal>
            <span className="method__n" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="method__title">{m.title}</h3>
            <p className="method__body">{m.body}</p>
          </li>
        ))}
      </ol>
      <p className="method__more" data-reveal>
        <Link className="tag" href={RIG.href}>
          Sheet {RIG.n} / {SHEET_COUNT} → {RIG.label}: {RIG.note.toLowerCase()}
        </Link>
      </p>
    </section>
  );
}
