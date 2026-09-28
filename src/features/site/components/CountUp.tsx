'use client';

import { useEffect, useRef } from 'react';

const fmt = new Intl.NumberFormat('en-GB');

/**
 * Server renders the final figure (so crawlers and no-JS readers get the real
 * number); on the client it rolls up from zero the first time it scrolls in.
 */
export function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1300;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = `${prefix}${fmt.format(Math.round(value * eased))}${suffix}`;
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        el.textContent = `${prefix}0${suffix}`;
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, prefix, suffix]);

  return (
    <span ref={ref}>
      {prefix}
      {fmt.format(value)}
      {suffix}
    </span>
  );
}
