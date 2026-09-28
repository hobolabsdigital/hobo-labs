import { RECEIPTS } from '../content';
import { CountUp } from './CountUp';
import { SheetHead } from './Sheet';

export function Receipts() {
  return (
    <section id="receipts" className="section receipts" data-sheet="02" data-sheet-label="Receipts">
      <SheetHead n="01" title="Receipts" label="Measured, not claimed" />
      <p className="receipts__lede" data-reveal>
        AI made everything faster. It didn’t make anyone’s taste better — that part has to be built in on purpose, and
        building it in is what I do. Every figure below is measured from work I can open and walk you through.
      </p>
      <ul className="receipts__grid">
        {RECEIPTS.map((r) => (
          <li key={r.label} className="receipt" data-reveal>
            <span className="receipt__value">
              {r.display ?? <CountUp value={r.value} prefix={r.prefix} suffix={r.suffix} />}
            </span>
            <span className="receipt__label">{r.label}</span>
            <span className="receipt__src">src → {r.src}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
