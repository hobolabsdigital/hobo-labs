'use client';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTheme } from '@/core/theme/theme-provider';
import { getMotion } from '@/core/theme/theme-motion';

// Helper to split text into words for GSAP staggering
function SplitWords({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i} className={className} style={{ display: 'inline-block', opacity: 0, transform: 'translateY(20px)' }}>
          {word}
        </span>
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
    <div ref={containerRef} style={{ opacity: 0, fontWeight: 'var(--intro-weight, 800)' as any }} className="min-h-[500px] pointer-events-none relative flex w-full flex-col items-center justify-center px-6 text-4xl font-heading tracking-tight whitespace-normal text-[var(--foreground)] md:w-[60vw] md:px-0 md:text-6xl">
      
      {/* BLOCK 1 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
        <div className="anim-box-1 mx-8 max-w-[80vw] rotate-1 transform border-4 px-8 py-4 text-4xl shadow-xl md:text-5xl" style={{ background: 'var(--box-1-bg, linear-gradient(to bottom right, #60a5fa, #6366f1))', color: 'var(--box-text, #000)', borderColor: 'var(--box-border, #000)', borderRadius: 'var(--box-radius, 0.5rem)' }}>
          Systems Architect
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-y-6 gap-x-2 text-center">
          <SplitWords
            text="Conducting an orchestra of AI agents to eliminate the mechanical drag of modern development."
            className="word-1 inline-block px-1"
          />
        </div>
      </div>

      {/* BLOCK 2 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
        <div className="anim-box-2 mx-8 max-w-[80vw] -rotate-2 transform border-4 px-8 py-4 text-4xl shadow-xl md:text-5xl" style={{ background: 'var(--box-2-bg, linear-gradient(to bottom right, #f472b6, #f43f5e))', color: 'var(--box-2-text, var(--box-text, #000))', borderColor: 'var(--box-border, #000)', borderRadius: 'var(--box-radius, 0.5rem)' }}>
          Chief Creative Technologist
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-y-6 gap-x-2 text-center">
          <SplitWords
            text="Turning tangled pipelines into clean, living frameworks."
            className="word-2 inline-block px-1"
          />
        </div>
      </div>

      {/* BLOCK 3 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
        <div className="anim-box-3 mx-8 max-w-[80vw] rotate-2 transform border-4 px-8 py-4 text-4xl shadow-xl md:text-5xl" style={{ background: 'var(--box-3-bg, linear-gradient(to bottom right, #4ade80, #10b981))', color: 'var(--box-3-text, var(--box-text, #000))', borderColor: 'var(--box-border, #000)', borderRadius: 'var(--box-radius, 0.5rem)' }}>
          Systems Whisperer
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-y-6 gap-x-2 text-center">
          <SplitWords
            text="Architecting worlds where logic feels human and humanity feels designed."
            className="word-3 inline-block px-1"
          />
        </div>
      </div>

    </div>
  );
}
