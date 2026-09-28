/**
 * One design system, five themes. The CV is sheet 01 (Blueprint), the cover
 * letters are sheet 02 (Signal). Tokens live in site.css under
 * [data-theme="…"]; this file is the registry the switcher and the pre-paint
 * script read from.
 */
export const THEMES = [
  { id: 'blueprint', name: 'Blueprint', note: 'the CV', paper: '#f0ede6', ink: '#2a3db5', signal: '#e8200e' },
  { id: 'signal', name: 'Signal', note: 'the letter', paper: '#e8200e', ink: '#f5f0e8', signal: '#0a0a0a' },
  { id: 'ink', name: 'Ink', note: 'after dark', paper: '#0a0a0c', ink: '#f4f4f5', signal: '#5e9bff' },
  { id: 'neon', name: 'Neon', note: 'night shift', paper: '#0c0612', ink: '#e8e0f0', signal: '#ff2d7b' },
  { id: 'sunset', name: 'Sunset', note: 'soft edges', paper: '#f0d8c0', ink: '#3d2b1f', signal: '#e8668a' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const DEFAULT_THEME: ThemeId = 'blueprint';
export const THEME_STORAGE_KEY = 'hl-theme';

/** Tells the hero shader to hold still: a canvas redrawing every frame can stall a view transition's capture. */
export const FREEZE_EVENT = 'hl:freeze';

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

/**
 * Runs before first paint: restores the saved theme and flags that JS is
 * available (reveal animations only hide content when this flag is set).
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('${THEME_STORAGE_KEY}');var ok=${JSON.stringify(
  THEMES.map((t) => t.id),
)};if(ok.indexOf(t)>-1){d.setAttribute('data-theme',t)}}catch(e){}})();`;
