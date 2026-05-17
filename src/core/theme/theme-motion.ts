/**
 * theme-motion.ts — Centralized animation config per theme.
 *
 * Components import `getMotion(theme)` instead of checking `isBrutalist`/`isRetro`.
 * Themes not listed fall through to `default`. Only themes with genuinely
 * different motion personality need their own entry.
 */

export interface HeroMotion {
  enterDuration: number;
  enterEase: string;
  exitDirection: 'left' | 'right' | 'up' | 'down';
  exitDuration: number;
  exitEase: string;
  holdDuration: number;
}

export interface IntroMotion {
  scaleDuration: number;
  scaleEase: string;
  boxDuration: number;
  boxEase: string;
  textStagger: number;
  textDuration: number;
  textEase: string;
  holdDuration: number;
  /** Exit style: 'slam' = hard down, 'float' = gentle rise, 'fade' = default cross-fade */
  exitStyle: 'slam' | 'float' | 'fade';
  exitDuration: number;
  exitEase: string;
}

export interface ModalMotion {
  /** Framer Motion transition type */
  type: 'spring' | 'tween';
  stiffness: number;
  damping: number;
  enterDuration: number;
  exitY: number;
  exitDuration: number;
}

export interface ThemeMotionConfig {
  hero: HeroMotion;
  intro: IntroMotion;
  modal: ModalMotion;
}

const defaultMotion: ThemeMotionConfig = {
  hero: {
    enterDuration: 1.4,
    enterEase: 'power3.out',
    exitDirection: 'left',
    exitDuration: 1.0,
    exitEase: 'power3.inOut',
    holdDuration: 1.5,
  },
  intro: {
    scaleDuration: 0.5,
    scaleEase: 'back.out(1.5)',
    boxDuration: 0.6,
    boxEase: 'power3.out',
    textStagger: 0.04,
    textDuration: 0.4,
    textEase: 'power2.out',
    holdDuration: 2.5,
    exitStyle: 'fade',
    exitDuration: 0.4,
    exitEase: 'power2.inOut',
  },
  modal: {
    type: 'spring',
    stiffness: 300,
    damping: 24,
    enterDuration: 0.15,
    exitY: -20,
    exitDuration: 0.2,
  },
};

const brutalistMotion: ThemeMotionConfig = {
  hero: {
    enterDuration: 0.1,
    enterEase: 'none',
    exitDirection: 'down',
    exitDuration: 0.1,
    exitEase: 'none',
    holdDuration: 0.8,
  },
  intro: {
    scaleDuration: 0.1,
    scaleEase: 'none',
    boxDuration: 0.1,
    boxEase: 'none',
    textStagger: 0,
    textDuration: 0.1,
    textEase: 'none',
    holdDuration: 1.0,
    exitStyle: 'slam',
    exitDuration: 0.1,
    exitEase: 'none',
  },
  modal: {
    type: 'tween',
    stiffness: 400,
    damping: 40,
    enterDuration: 0.05,
    exitY: 0,
    exitDuration: 0.05,
  },
};

const retroMotion: ThemeMotionConfig = {
  hero: {
    enterDuration: 1.8,
    enterEase: 'back.out(2.5)',
    exitDirection: 'up',
    exitDuration: 1.2,
    exitEase: 'power2.inOut',
    holdDuration: 2.0,
  },
  intro: {
    scaleDuration: 0.7,
    scaleEase: 'back.out(2.5)',
    boxDuration: 0.8,
    boxEase: 'power2.out',
    textStagger: 0.06,
    textDuration: 0.5,
    textEase: 'power2.out',
    holdDuration: 3.0,
    exitStyle: 'float',
    exitDuration: 0.6,
    exitEase: 'power2.inOut',
  },
  modal: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    enterDuration: 0.3,
    exitY: -15,
    exitDuration: 0.3,
  },
};

const motionMap: Record<string, ThemeMotionConfig> = {
  default: defaultMotion,
  light: defaultMotion,
  dark: defaultMotion,
  blueprint: defaultMotion,
  cyberpunk: defaultMotion,
  brutalist: brutalistMotion,
  retro: retroMotion,
};

/**
 * Get the motion config for a theme. Falls back to default for unknown themes.
 */
export function getMotion(theme: string): ThemeMotionConfig {
  return motionMap[theme] ?? defaultMotion;
}
