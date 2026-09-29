'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { QUEST } from '../content';

const STEPS = QUEST.steps;
const N = STEPS.length;
const MOTION_OK = '(prefers-reduced-motion: no-preference)';

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(MOTION_OK);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/**
 * Fig. 3.0 — a pinned, scroll-scrubbed sequence: the teacher's five screens
 * are dealt onto a drafting-table stack, then the child's game takes over.
 *
 * Layout is decided by CSS alone (pinned under `.js` + no-preference, a plain
 * grid otherwise), so nothing shifts at hydration. JS only feeds `--p` (0→1,
 * eased) and the current step, and plays the video while it's the top card.
 */
export function QuestSequence() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const live = useSyncExternalStore(subscribeMotion, () => window.matchMedia(MOTION_OK).matches, () => false);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !live) return;
    const stage = track.firstElementChild as HTMLElement;
    let raf = 0;
    let shown = 0;
    let last = -1;
    const frame = () => {
      const r = track.getBoundingClientRect();
      const span = r.height - stage.offsetHeight;
      const target = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      // A little inertia so the stack settles rather than snaps.
      shown += (target - shown) * 0.16;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      track.style.setProperty('--p', shown.toFixed(4));
      // Captions switch as the next card is most of the way in.
      const s = Math.min(N - 1, Math.floor(shown * N + 0.25));
      if (s !== last) {
        last = s;
        setStep(s);
        setReached((m) => Math.max(m, s));
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(track);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [live]);

  // The film plays only while it's the top card and on screen.
  const playing = live && inView && step === N - 1;
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (playing) v.play().catch(() => {});
    else if (live) v.pause();
  }, [playing, muted, live]);

  // Don't pull 21 MB for visitors who never get near the end.
  const loadVideo = !live || reached >= N - 3;

  return (
    <figure className="quest">
      <figcaption className="caption-head" data-reveal>
        {QUEST.caption}
      </figcaption>
      <div ref={trackRef} className="quest__track" style={{ '--n': N } as React.CSSProperties}>
        <div className="quest__stage">
          <ol className="quest__rail" aria-label="Steps">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className="quest__rail-item"
                aria-current={i === step ? 'step' : undefined}
                data-done={i < step ? '' : undefined}
              >
                <span className="quest__rail-n">{s.n}</span>
                <span className="quest__rail-label">{s.label}</span>
              </li>
            ))}
          </ol>

          <div className="quest__deck">
            {STEPS.map((s, i) =>
              s.src ? (
                <div key={s.n} className="quest__card" style={{ '--i': i } as React.CSSProperties}>
                  <Image
                    src={s.src}
                    alt={s.alt ?? ''}
                    width={1800}
                    height={955}
                    quality={90}
                    sizes="(min-width: 1000px) 62vw, 100vw"
                  />
                  <span className="quest__card-n">{s.n}</span>
                </div>
              ) : (
                <div key={s.n} className="quest__card quest__card--play" style={{ '--i': i } as React.CSSProperties}>
                  <video
                    ref={videoRef}
                    className="quest__video"
                    src={loadVideo ? QUEST.video.src : undefined}
                    poster={QUEST.video.poster}
                    width={QUEST.video.width}
                    height={QUEST.video.height}
                    preload={live ? 'auto' : 'none'}
                    controls={!live}
                    muted
                    loop
                    playsInline
                    aria-label="MonstoryX student game: a child plays a quest in a world of clay monsters"
                  />
                  <span className="quest__card-n">{s.n}</span>
                  <span className="quest__tag">{QUEST.video.label}</span>
                  {live && (
                    <button type="button" className="chip quest__sound" onClick={() => setMuted((m) => !m)}>
                      {muted ? 'Sound on' : 'Sound off'}
                    </button>
                  )}
                </div>
              ),
            )}
          </div>

          <div className="quest__captions">
            {STEPS.map((s, i) => (
              <div key={s.n} className="quest__caption" data-active={i === step ? '' : undefined}>
                <span className="quest__caption-n">
                  {s.n} / {String(N).padStart(2, '0')} · {s.label}
                </span>
                <h3 className="quest__caption-title">{s.title}</h3>
                <p className="quest__caption-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
