'use client';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTheme } from '@/core/theme/theme-provider';
import { getMotion } from '@/core/theme/theme-motion';

// Helper to split text into words for GSAP staggering
function SplitWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span className={className} style={{ display: 'inline-block', opacity: 0, transform: 'translateY(20px)' }}>
            {word}
          </span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </>
  );
}

export function EnterLab({ onAnimationComplete }: { onAnimationComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useGSAP(() => {
    if (!containerRef.current) return;

    const m = getMotion(resolvedTheme ?? 'light');

    // We set initial state in inline styles to prevent FOUC, but GSAP takes over here
    gsap.set(containerRef.current, { opacity: 1 });
    gsap.set('.anim-box-1, .anim-box-2, .anim-box-3', { opacity: 0, scale: 0.8, y: 60 });
    gsap.set('.word-1, .word-2, .word-3', { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onAnimationComplete) onAnimationComplete();
      }
    });

    const buildSequence = (boxClass: string, wordClass: string) => {
      // 1. Box pops into the middle
      tl.to(boxClass, {
        opacity: 1,
        scale: 1,
        duration: m.intro.scaleDuration,
        ease: m.intro.scaleEase,
      });

      // 2. Box moves up while words animate in
      tl.to(boxClass, { y: 0, duration: m.intro.boxDuration, ease: m.intro.boxEase }, '+=0.2');
      tl.to(wordClass, {
        opacity: 1, y: 0,
        duration: m.intro.textDuration,
        stagger: m.intro.textStagger,
        ease: m.intro.textEase,
      }, '<0.1');

      // 3. Hold so the user can read it
      tl.to({}, { duration: m.intro.holdDuration });

      // 4. Exit (driven by exitStyle config, not theme name)
      if (m.intro.exitStyle === 'float') {
        // Smooth upward float with gentle scale-down
        tl.to([boxClass, wordClass], {
          y: '-30vh',
          scale: 0.9,
          opacity: 0,
          duration: m.intro.exitDuration,
          stagger: { amount: 0.15, from: 'start' },
          ease: m.intro.exitEase,
        });
      } else {
        // 'slam' or 'fade': dead drop / fast exit
        tl.to([boxClass, wordClass], {
          y: '50vh',
          opacity: 0,
          duration: m.intro.exitDuration,
          stagger: { amount: 0.1, from: 'random' },
          ease: m.intro.exitEase,
        });
      }
    };

    buildSequence('.anim-box-1', '.word-1');
    buildSequence('.anim-box-2', '.word-2');
    buildSequence('.anim-box-3', '.word-3');

  }, { scope: containerRef, dependencies: [resolvedTheme] });

  return (
    <div ref={containerRef} style={{ opacity: 0, fontWeight: 'var(--intro-weight, 800)' as React.CSSProperties['fontWeight'] }} className="absolute inset-0 pointer-events-none flex w-full h-full flex-col justify-center overflow-hidden text-[var(--foreground)] font-heading">

      {/* BLOCK 1 */}
      <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 pl-16 pr-6 md:pl-24 md:pr-12 lg:pl-32 lg:pr-20">
        <div className="anim-box-1 text-left text-4xl tracking-tighter uppercase md:text-7xl text-[var(--foreground)]">
          Systems Architect
        </div>
        <div className="w-full max-w-3xl text-left text-xl md:text-3xl font-medium leading-tight md:leading-normal opacity-90">
          <SplitWords
            text="Conducting an orchestra of AI agents to eliminate the mechanical drag of modern development."
            className="word-1"
          />
        </div>
      </div>

      {/* BLOCK 2 */}
      <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 pl-16 pr-6 md:pl-24 md:pr-12 lg:pl-32 lg:pr-20">
        <div className="anim-box-2 text-left text-4xl tracking-tighter uppercase md:text-7xl text-[var(--foreground)]">
          Chief Creative Technologist
        </div>
        <div className="w-full max-w-3xl text-left text-xl md:text-3xl font-medium leading-tight md:leading-normal opacity-90">
          <SplitWords
            text="Turning tangled pipelines into clean, living frameworks."
            className="word-2"
          />
        </div>
      </div>

      {/* BLOCK 3 */}
      <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 pl-16 pr-6 md:pl-24 md:pr-12 lg:pl-32 lg:pr-20">
        <div className="anim-box-3 text-left text-4xl tracking-tighter uppercase md:text-7xl text-[var(--foreground)]">
          Systems Whisperer
        </div>
        <div className="w-full max-w-3xl text-left text-xl md:text-3xl font-medium leading-tight md:leading-normal opacity-90">
          <SplitWords
            text="Architecting worlds where logic feels human and humanity feels designed."
            className="word-3"
          />
        </div>
      </div>

    </div>
  );
}
