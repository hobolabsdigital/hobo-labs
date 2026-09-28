import { CONTACT, SHEET_COUNT } from '../content';
import { ExtLink, Headline, TitleBlock } from './Sheet';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Contact() {
  return (
    <section id="contact" className="contact" data-sheet="08" data-sheet-label="Contact">
      <div className="contact__inner">
        <p className="contact__kicker" data-reveal>
          §08 — Open application, always
        </p>
        <Headline lines={['Send me the brief.', 'I’ll send back receipts.']} as="h2" className="headline--contact" />

        <a className="contact__email" href={`mailto:${CONTACT.email}`} data-reveal>
          {CONTACT.email}
        </a>

        <div className="contact__grid" data-reveal>
          <dl className="contact__facts">
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              </dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                <ExtLink href={CONTACT.linkedin}>{CONTACT.linkedinLabel} ↗</ExtLink>
              </dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>
                {CONTACT.base} · {CONTACT.zone}
              </dd>
            </div>
            <div>
              <dt>Languages</dt>
              <dd>{CONTACT.languages}</dd>
            </div>
          </dl>
          <div className="contact__cvs">
            {CONTACT.cvs.map((cv) => (
              <a key={cv.href} className="btn btn--invert" href={cv.href} download>
                {cv.label} ↓
              </a>
            ))}
            <p className="contact__small">Same person, two lenses. Both are A4 drawing sheets in the Blueprint theme.</p>
          </div>
        </div>

        <div className="contact__themes" data-reveal>
          <p className="contact__small">
            <strong>One design system, five themes.</strong> The CV is sheet 01, the letters are sheet 02. The other three
            are here — try them, the shader follows.
          </p>
          <ThemeSwitcher variant="deck" />
        </div>
      </div>

      <footer className="contact__footer">
        <TitleBlock
          cells={[
            { k: 'Document', v: 'Portfolio — Emile Harmel' },
            { k: 'Project', v: 'Hobo Labs' },
            { k: 'Scale', v: '1:1' },
            { k: 'Date', v: '2026-09' },
            { k: 'Sheet', v: `${SHEET_COUNT} / ${SHEET_COUNT}` },
          ]}
        />
        <p className="colophon">
          Built with Next.js 16 and a hand-written WebGL2 shader — one noise field, printed raw outside the lens and
          measured inside it. The previous site, an AI canvas, still runs in the <a href="/lab">lab →</a>
        </p>
      </footer>
    </section>
  );
}
