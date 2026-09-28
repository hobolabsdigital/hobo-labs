'use client';

import { useRef, type ReactNode } from 'react';
import { FilterField } from '../gl/FilterField';

/** Tall scroll track with a pinned full-viewport frame; the shader lives in the frame. */
export function HeroStage({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLElement>(null);
  return (
    <section id="top" ref={trackRef} className="hero" aria-labelledby="hero-title" data-sheet="01" data-sheet-label="General arrangement">
      <div className="hero__frame">
        <FilterField trackRef={trackRef} />
        {children}
      </div>
    </section>
  );
}
