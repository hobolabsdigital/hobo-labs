import { METHOD } from '../content';
import { SheetHead } from './Sheet';

export function Method() {
  return (
    <section id="method" className="section method" data-sheet="05" data-sheet-label="Method">
      <SheetHead n="04" title="Method" label="How the work gets made" />
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
    </section>
  );
}
