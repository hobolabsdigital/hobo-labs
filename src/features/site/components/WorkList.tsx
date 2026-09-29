'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { WORK } from '../content';

/**
 * The archive as a section view. On fine pointers a duotone preview trails the
 * cursor; on touch the thumbnail sits inline in each row (CSS decides). Rows
 * with a sheet of their own link to it; the lab is another app, so a plain <a>.
 */
export function WorkList() {
  const [active, setActive] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // The preview only chases the cursor while the pointer is over the list.
  useEffect(() => {
    const list = listRef.current;
    const el = previewRef.current;
    if (!list || !el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;
    const place = () => {
      el.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    };
    const tick = () => {
      const k = reduced ? 1 : 0.16;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      place();
      raf = requestAnimationFrame(tick);
    };
    const onEnter = (e: PointerEvent) => {
      target.x = pos.x = e.clientX;
      target.y = pos.y = e.clientY;
      place();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    list.addEventListener('pointerenter', onEnter);
    list.addEventListener('pointermove', onMove, { passive: true });
    list.addEventListener('pointerleave', onLeave);
    return () => {
      list.removeEventListener('pointerenter', onEnter);
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={listRef} className="work" onPointerLeave={() => setActive(null)}>
      <div className="work__head" aria-hidden="true">
        <span>Year</span>
        <span>Project</span>
        <span>Client · Role</span>
        <span>Outcome</span>
      </div>
      <ol className="work__list">
        {WORK.map((w, i) => {
          const inner = (
            <>
              <span className="work__years">{w.years}</span>
              <span className="work__title">
                {w.title}
                {w.href && <span className="work__arrow"> →</span>}
              </span>
              <span className="work__meta">
                <span>{w.client}</span>
                <span>{w.role}</span>
              </span>
              <span className="work__body">{w.body}</span>
              {w.image && (
                <span className="work__thumb">
                  <Image src={w.image} alt="" width={1920} height={1080} sizes="(max-width: 899px) 90vw, 1px" />
                </span>
              )}
            </>
          );
          return (
            <li
              key={w.title}
              className={`work__row${active === i ? ' is-active' : ''}`}
              data-reveal
              onPointerEnter={() => setActive(i)}
            >
              {w.href?.startsWith('/work/') ? (
                <Link className="work__link" href={w.href}>
                  {inner}
                </Link>
              ) : w.href ? (
                <a className="work__link" href={w.href}>
                  {inner}
                </a>
              ) : (
                <div className="work__link">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
      <div ref={previewRef} className={`work__preview${active !== null && WORK[active].image ? ' is-on' : ''}`} aria-hidden="true">
        {WORK.map((w, i) =>
          w.image ? (
            <div key={w.title} className={`work__preview-img plate--duotone${active === i ? ' is-current' : ''}`}>
              <Image src={w.image} alt="" width={1920} height={1080} sizes="420px" />
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
