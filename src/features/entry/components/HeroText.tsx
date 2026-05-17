'use client';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTheme } from '@/core/theme/theme-provider';
import { getMotion } from '@/core/theme/theme-motion';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?';

export function HeroText({
  onSequenceComplete,
}: {
  onSequenceComplete?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const { resolvedTheme } = useTheme();

  const text1 = "Welcome to";
  const text2 = "Hobo:labs";

  useGSAP(() => {
    if (!containerRef.current || !line1Ref.current || !line2Ref.current) return;

    const m = getMotion(resolvedTheme ?? 'light');
    const chars = SCRAMBLE_CHARS.split('');
    const tl = gsap.timeline({
      onComplete: () => {
        if (onSequenceComplete) onSequenceComplete();
      }
    });

    const state = {
      t1: 0,
      t2: 0,
    };

    // Pre-fill with random chars for line 1
    line1Ref.current.textContent = text1.split('').map(c => c === ' ' ? '\u00a0' : chars[Math.floor(Math.random() * chars.length)]).join('');

    // --- PLAY IN ---
    tl.to(state, {
      t1: 1,
      duration: m.hero.enterDuration,
      ease: 'none',
      onUpdate() {
        let out = '';
        for (let i = 0; i < text1.length; i++) {
          if (text1[i] === ' ') out += '\u00a0';
          else if (i / text1.length < state.t1) out += text1[i];
          else out += chars[Math.floor(Math.random() * chars.length)];
        }
        if (line1Ref.current) line1Ref.current.textContent = out;
      },
      onComplete() {
        if (line1Ref.current) line1Ref.current.textContent = text1;
      }
    }, 0.3);

    tl.to(state, {
      t2: 1,
      duration: m.hero.enterDuration,
      ease: 'none',
      onUpdate() {
        for (let i = 0; i < text2.length; i++) {
          const charNode = line2Ref.current?.childNodes[i] as HTMLSpanElement;
          if (!charNode) continue;
          if (text2[i] === ' ') charNode.textContent = '\u00a0';
          else if (i / text2.length < state.t2) charNode.textContent = text2[i];
          else charNode.textContent = chars[Math.floor(Math.random() * chars.length)];
        }
      },
      onComplete() {
        for (let i = 0; i < text2.length; i++) {
          const charNode = line2Ref.current?.childNodes[i] as HTMLSpanElement;
          if (charNode) charNode.textContent = text2[i];
        }
      }
    }, 1.0);

    // --- HOLD ---
    tl.to({}, { duration: m.hero.holdDuration });

    // --- PLAY OUT (direction-driven, not theme-name-driven) ---
    const exitProps: Record<string, gsap.TweenVars> = {
      left:  { x: '-100vw', opacity: 0, duration: m.hero.exitDuration, ease: m.hero.exitEase },
      right: { x: '100vw',  opacity: 0, duration: m.hero.exitDuration, ease: m.hero.exitEase },
      up:    { y: '-50vh',  opacity: 0, duration: m.hero.exitDuration, ease: m.hero.exitEase },
      down:  { y: '100vh',  opacity: 0, duration: m.hero.exitDuration, ease: m.hero.exitEase },
    };

    const exit = exitProps[m.hero.exitDirection] ?? exitProps.left;

    tl.to(line1Ref.current, exit, '>');
    tl.to(line2Ref.current, exit, '<0.1');

    // Fade entire container out smoothly at the end
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    }, '<0.5');

  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 0.5vw',
        pointerEvents: 'none',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Line 1 — "WELCOME TO" */}
      <span
        ref={line1Ref}
        className="welcome-to-text text-[var(--foreground)] opacity-90 font-heading"
        style={{
          display: 'block',
          fontSize: 'clamp(48px, 14vw, 280px)',
          fontWeight: 'var(--hero-weight-line1, 800)' as any,
          lineHeight: 0.9,
          letterSpacing: '-0.05em',
          whiteSpace: 'nowrap',
        }}
      >
        {text1}
      </span>

      {/* Line 2 — "HOBOLABS" sleek gradient */}
      <span
        ref={line2Ref}
        className="font-heading"
        style={{
          display: 'block',
          fontSize: 'clamp(60px, 17vw, 360px)',
          fontWeight: 'var(--hero-weight-line2, 900)' as any,
          lineHeight: 0.9,
          letterSpacing: '-0.06em',
          color: 'var(--foreground)',
          background: 'var(--hero-gradient, linear-gradient(90deg, #ff5c34, #ff007b))',
          WebkitBackgroundClip: 'var(--hero-clip, text)',
          WebkitTextFillColor: 'var(--hero-fill, transparent)',
          whiteSpace: 'nowrap',
        }}
      >
        {text2.split('').map((c, i) => (
          <span key={i} className="hobo-labs-char">
            {c === ' ' ? '\u00a0' : c}
          </span>
        ))}
      </span>
    </div>
  );
}
