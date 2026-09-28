'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { MONSTORYX } from '../content';

const F = MONSTORYX.finale;

function shotAt(t: number) {
  let i = 0;
  for (let k = 0; k < F.shots.length; k++) if (t >= F.shots[k].at) i = k;
  return i;
}

/**
 * Fig. 3.2 — the film beside its storyboard. The cut list under the player
 * and the shot the film is on stay in step with playback; any shot seeks.
 * Plays muted while on screen (unless reduced motion), with a sound toggle.
 */
export function FinaleFilm() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shot, setShot] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    const root = rootRef.current;
    if (!v || !root) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const tick = () => {
      root.style.setProperty('--t', String(v.currentTime / (v.duration || F.duration)));
      setShot(shotAt(v.currentTime));
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => {
      cancelAnimationFrame(raf);
      tick();
      cancelAnimationFrame(raf);
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('seeked', onPause);
    const io = new IntersectionObserver(
      ([e]) => {
        if (calm) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('seeked', onPause);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const seek = (i: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = F.shots[i].at + 0.05;
    v.play().catch(() => {});
  };

  return (
    <figure ref={rootRef} className="finale">
      <figcaption className="caption-head" data-reveal>
        {F.caption}
      </figcaption>
      <div className="finale__grid">
        <div className="finale__screen" data-reveal>
          <video
            ref={videoRef}
            className="finale__video"
            src={F.src}
            poster={F.poster}
            width={1280}
            height={720}
            preload="metadata"
            controls
            muted
            loop
            playsInline
            aria-label="Learning Shapes: the Finale film the pipeline rendered, with Blorp, Lopsy and the Trio"
          />
          <button type="button" className="chip finale__sound" onClick={() => setMuted((m) => !m)}>
            {muted ? 'Sound on' : 'Sound off'}
          </button>
          {/* The edit: one segment per shot, sized by its length, with a playhead. */}
          <div className="finale__cuts" aria-hidden="true">
            {F.shots.map((s, i) => {
              const end = F.shots[i + 1]?.at ?? F.duration;
              return (
                <span key={s.at} style={{ flexGrow: end - s.at }} data-on={i === shot ? '' : undefined}>
                  {i + 1}
                </span>
              );
            })}
            <i className="finale__playhead" />
          </div>
        </div>
        <ol className="finale__shots" data-reveal="stagger">
          {F.shots.map((s, i) => (
            <li key={s.at}>
              <button type="button" className="finale__shot" aria-current={i === shot ? 'true' : undefined} onClick={() => seek(i)}>
                <span className="finale__thumb">
                  <Image src={s.src} alt="" width={960} height={540} sizes="(min-width: 1000px) 140px, 45vw" />
                </span>
                <span className="finale__text">
                  <span className="finale__who">
                    {String(i + 1).padStart(2, '0')} · {s.kind ? `${s.kind} · ` : ''}
                    {s.who}
                  </span>
                  <span className="finale__line">“{s.line}”</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
