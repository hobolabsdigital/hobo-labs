import { Logo } from '@/core/ui/Logo';
import { CONTACT } from '../content';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Nav() {
  return (
    <header className="nav">
      <a className="nav__logo chip" href="#top" aria-label="Hobo Labs — back to top">
        <Logo className="nav__logo-svg" />
      </a>
      <nav className="nav__links" aria-label="Sections">
        <a className="chip" href="#nutrons">Work</a>
        <a className="chip" href="#method">Method</a>
        <a className="chip" href="#contact">Contact</a>
      </nav>
      <div className="nav__tools">
        <ThemeSwitcher />
        <a className="chip chip--signal" href={CONTACT.cvs[0].href} download>
          CV ↓
        </a>
      </div>
    </header>
  );
}
