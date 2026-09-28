'use client';

import { useSyncExternalStore, type MouseEvent } from 'react';
import { DEFAULT_THEME, FREEZE_EVENT, THEMES, THEME_STORAGE_KEY, isThemeId, type ThemeId } from '../themes';

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => mo.disconnect();
}
function getSnapshot(): ThemeId {
  const t = document.documentElement.getAttribute('data-theme');
  return isThemeId(t) ? t : DEFAULT_THEME;
}
const getServerSnapshot = (): ThemeId => DEFAULT_THEME;

const freeze = (on: boolean) => window.dispatchEvent(new CustomEvent(FREEZE_EVENT, { detail: on }));

function applyTheme(id: ThemeId, e?: MouseEvent<HTMLElement>) {
  const root = document.documentElement;
  if (root.getAttribute('data-theme') === id) return;
  const commit = () => {
    if (root.getAttribute('data-theme') === id) return;
    root.setAttribute('data-theme', id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* private mode — the theme still applies for this visit */
    }
    const paper = THEMES.find((t) => t.id === id)?.paper;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta && paper) meta.content = paper;
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) return commit();
  const x = e ? e.clientX : window.innerWidth / 2;
  const y = e ? e.clientY : window.innerHeight / 2;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  freeze(true);
  const vt = document.startViewTransition(commit);
  // If the capture never lands (seen with software GL), don't leave the page behind an overlay.
  const bail = window.setTimeout(() => {
    vt.skipTransition();
    commit();
  }, 400);
  vt.updateCallbackDone.finally(() => window.clearTimeout(bail));
  vt.finished.finally(() => freeze(false));
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [theme, applyTheme] as const;
}

type Props = { variant?: 'compact' | 'deck' };

/**
 * Five themes of one design system. Compact = swatches in the nav;
 * deck = labelled cards in the footer.
 */
export function ThemeSwitcher({ variant = 'compact' }: Props) {
  const [theme, setTheme] = useTheme();
  return (
    <div className={`themes themes--${variant}`} role="group" aria-label="Theme">
      {THEMES.map((t, i) => (
        <button
          key={t.id}
          type="button"
          className="themes__item"
          aria-pressed={theme === t.id}
          aria-label={`Theme ${String(i + 1).padStart(2, '0')}: ${t.name} — ${t.note}`}
          title={`${t.name} — ${t.note}`}
          onClick={(e) => setTheme(t.id, e)}
          style={{ '--sw-paper': t.paper, '--sw-ink': t.ink, '--sw-signal': t.signal } as React.CSSProperties}
        >
          <span className="themes__swatch" aria-hidden="true" />
          {variant === 'deck' && (
            <span className="themes__text">
              <span className="themes__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="themes__name">{t.name}</span>
              <span className="themes__note">{t.note}</span>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
