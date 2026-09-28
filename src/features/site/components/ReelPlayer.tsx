'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ReelClip = {
  slug: string;
  title: string;
  note: string;
  src: string;
  poster: string;
  width: number;
  height: number;
  duration: number;
  audio: boolean;
};

const FPS = 25;
const pad = (n: number) => String(n).padStart(2, '0');
const timecode = (s: number) =>
  `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * FPS))}`;
const mmss = (s: number) => `${Math.floor(s / 60)}:${pad(Math.round(s) % 60)}`;

/**
 * The reel is a playlist, not one long file: clips play back to back, the
 * timecode and the segmented bar run across the whole reel. Autoplays muted
 * while on screen (never under reduced motion); sound is one click away.
 */
export function ReelPlayer({ clips, label }: { clips: ReelClip[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const fillsRef = useRef<(HTMLElement | null)[]>([]);
  const wantPlay = useRef(true);
  const inView = useRef(false);

  const starts = useMemo(() => clips.reduce<number[]>((acc, c, i) => [...acc, i ? acc[i - 1] + clips[i - 1].duration : 0], []), [clips]);
  const portrait = clips.filter((c) => c.height > c.width).length > clips.length / 2;
  const clip = clips[index];

  const tryPlay = useCallback(() => {
    const v = videoRef.current;
    if (v && wantPlay.current && inView.current) v.play().catch(() => setPlaying(false));
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    const stage = stageRef.current;
    if (!v || !stage) return;
    v.muted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) wantPlay.current = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (e.isIntersecting) tryPlay();
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, [tryPlay]);

  // A new src loads on its own; carry on playing if we were.
  useEffect(() => {
    tryPlay();
  }, [index, tryPlay]);

  // Timecode + segment fills: rAF while playing, a single paint otherwise.
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      const t = videoRef.current?.currentTime ?? 0;
      if (tcRef.current) tcRef.current.textContent = timecode(starts[index] + t);
      fillsRef.current.forEach((el, i) => {
        if (!el) return;
        const r = i < index ? 1 : i > index ? 0 : Math.min(1, t / Math.max(clips[i].duration, 0.01));
        el.style.transform = `scaleX(${r})`;
      });
      if (playing) raf = requestAnimationFrame(paint);
    };
    paint();
    return () => cancelAnimationFrame(raf);
  }, [playing, index, starts, clips]);

  const go = (i: number) => {
    wantPlay.current = true;
    inView.current = true;
    const next = (i + clips.length) % clips.length;
    if (next === index && videoRef.current) {
      videoRef.current.currentTime = 0;
      tryPlay();
    } else setIndex(next);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      wantPlay.current = true;
      inView.current = true;
      tryPlay();
    } else {
      wantPlay.current = false;
      v.pause();
    }
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) togglePlay();
  };

  return (
    <div className={`reel${portrait ? ' reel--portrait' : ''}`}>
      <div ref={stageRef} className="reel__stage">
        <div className="reel__backdrop" style={{ backgroundImage: `url(${clip.poster})` }} aria-hidden="true" />
        <video
          ref={videoRef}
          className="reel__video"
          src={clip.src}
          poster={clip.poster}
          muted
          playsInline
          preload="metadata"
          loop={clips.length === 1}
          aria-label={`${label}: ${clip.title}`}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => go(index + 1)}
          onClick={togglePlay}
        />
        <div className="reel__hud" aria-hidden="true">
          <span className="reel__tag">{label}</span>
          <span className="reel__tc" ref={tcRef}>
            00:00:00:00
          </span>
        </div>
        {!playing && (
          <button type="button" className="reel__big-play" onClick={togglePlay}>
            ▶ Play reel
          </button>
        )}
      </div>

      <div className="reel__side">
        <div className="reel__segments" aria-hidden="true">
          {clips.map((c, i) => (
            <span key={c.slug} style={{ flexGrow: c.duration }}>
              <i ref={(el) => void (fillsRef.current[i] = el)} />
            </span>
          ))}
        </div>
        <div className="reel__controls">
          <button type="button" className="chip" onClick={() => go(index - 1)} aria-label="Previous clip">
            ◀◀
          </button>
          <button type="button" className="chip" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <button type="button" className="chip" onClick={() => go(index + 1)} aria-label="Next clip">
            ▶▶
          </button>
          <button type="button" className="chip chip--signal reel__sound" onClick={toggleSound} aria-pressed={!muted}>
            {muted ? 'Sound off' : 'Sound on'}
          </button>
        </div>
        <p className="reel__now">
          <span>
            {pad(index + 1)} / {pad(clips.length)}
          </span>{' '}
          {clip.title}
          {clip.note && <span className="reel__note"> — {clip.note}</span>}
        </p>

        <ol className="reel__list">
          {clips.map((c, i) => (
            <li key={c.slug}>
              <button type="button" className="reel__item" aria-current={i === index} onClick={() => go(i)}>
                <span className="reel__thumb">
                  <Image src={c.poster} alt="" width={c.width} height={c.height} sizes="160px" />
                </span>
                <span className="reel__item-text">
                  <span className="reel__item-n">{pad(i + 1)}</span>
                  <span className="reel__item-title">{c.title}</span>
                  <span className="reel__item-dur">{mmss(c.duration)}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
