import Link from 'next/link';
import { Logo } from '@/core/ui/Logo';
import { CONTACT, type SheetHref } from '../content';
import { NavIndex } from './NavIndex';
import { ThemeSwitcher } from './ThemeSwitcher';

const LINKS: { href: SheetHref; label: string }[] = [
  { href: '/work', label: 'Work' },
  { href: '/orchestration', label: 'Orchestration' },
];

/** Work stays lit on the case studies too: they are sheets under /work. */
function isCurrent(href: SheetHref, current: SheetHref) {
  return current === href || current.startsWith(`${href}/`);
}

export function Nav({ current }: { current: SheetHref }) {
  return (
    <header className="nav">
      {current === '/' ? (
        <a className="nav__logo chip" href="#top" aria-label="Hobo Labs — back to top">
          <Logo className="nav__logo-svg" />
        </a>
      ) : (
        <Link className="nav__logo chip" href="/" aria-label="Hobo Labs — front page">
          <Logo className="nav__logo-svg" />
        </Link>
      )}
      <nav className="nav__links" aria-label="Pages">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            className={`chip${isCurrent(l.href, current) ? ' is-current' : ''}`}
            href={l.href}
            aria-current={current === l.href ? 'page' : undefined}
          >
            {l.label}
          </Link>
        ))}
        <a className="chip" href="#contact">
          Contact
        </a>
      </nav>
      <NavIndex current={current} />
      <div className="nav__tools">
        <ThemeSwitcher />
        <a className="chip chip--signal" href={CONTACT.cvs[0].href} download>
          CV ↓
        </a>
      </div>
    </header>
  );
}
