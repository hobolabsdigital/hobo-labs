import { describe, expect, it } from 'vitest';
import { THEMES, THEME_BOOT_SCRIPT, isThemeId } from '../themes';
import { hexToRgb, mixPalette } from './filter-renderer';

describe('hexToRgb', () => {
  it('parses 6- and 3-digit hex, tolerating whitespace from getPropertyValue', () => {
    expect(hexToRgb(' #2a3db5')).toEqual([42 / 255, 61 / 255, 181 / 255]);
    expect(hexToRgb('#fff')).toEqual([1, 1, 1]);
  });

  it('falls back to black on garbage instead of feeding NaN to the shader', () => {
    expect(hexToRgb('')).toEqual([0, 0, 0]);
    expect(hexToRgb('rebeccapurple')).toEqual([0, 0, 0]);
  });
});

describe('mixPalette', () => {
  it('interpolates every channel of every slot', () => {
    const a = { paper: [0, 0, 0], ink: [1, 1, 1], signal: [0, 0.5, 1], accent: [0, 0, 0] };
    const b = { paper: [1, 1, 1], ink: [0, 0, 0], signal: [1, 0.5, 0], accent: [0.5, 0.5, 0.5] };
    expect(mixPalette(a, b, 0.5)).toEqual({
      paper: [0.5, 0.5, 0.5],
      ink: [0.5, 0.5, 0.5],
      signal: [0.5, 0.5, 0.5],
      accent: [0.25, 0.25, 0.25],
    });
  });
});

describe('themes', () => {
  it('only accepts registered theme ids', () => {
    expect(isThemeId('blueprint')).toBe(true);
    expect(isThemeId('comic-sans')).toBe(false);
    expect(isThemeId(null)).toBe(false);
  });

  it('boot script whitelists exactly the registered themes', () => {
    for (const t of THEMES) expect(THEME_BOOT_SCRIPT).toContain(`"${t.id}"`);
  });
});
