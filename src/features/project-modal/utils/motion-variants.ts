import { type Variants } from 'framer-motion';
import { getMotion } from '@/core/theme/theme-motion';

export const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

/** Build Framer Motion item variants from the centralized motion config */
export function buildItemVariants(theme: string): Variants {
  const m = getMotion(theme).modal;
  if (m.type === 'tween') {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: m.enterDuration, ease: [0.16, 1, 0.3, 1] } },
      exit: { opacity: 0, transition: { duration: m.exitDuration } },
    };
  }
  return {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: m.stiffness, damping: m.damping } },
    exit: { opacity: 0, y: m.exitY, transition: { duration: m.exitDuration } },
  };
}
