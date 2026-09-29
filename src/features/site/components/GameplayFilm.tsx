'use client';

import { useEffect, useRef } from 'react';
import { NUTRONS } from '../content';

const G = NUTRONS.gameplay;

/**
 * The shipped game, played. Silent, so it loops muted while at least half is
 * on screen and pauses off it; nothing loads until then. Under reduced motion
 * it never starts on its own: poster plus native controls.
 */
export function GameplayFilm({ fig }: { fig: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="plate plate--film" data-reveal>
      <div className="plate__img">
        <video
          ref={videoRef}
          src={G.src}
          poster={G.poster}
          width={G.width}
          height={G.height}
          preload="none"
          controls
          muted
          loop
          playsInline
          aria-label={G.label}
        />
      </div>
      <figcaption>
        <span>Fig. {fig}</span> {G.caption}
      </figcaption>
    </figure>
  );
}
