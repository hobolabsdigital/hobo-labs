'use client';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

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

  useGSAP(() => {
    if (!containerRef.current) return;

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
      tl.to(boxClass, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' });
      
      // 2. Box moves up while words animate in
      tl.to(boxClass, { y: 0, duration: 0.6, ease: 'power3.out' }, '+=0.2');
      tl.to(wordClass, {
        opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out'
      }, '<0.1');

      // 3. Hold so the user can read it
      tl.to({}, { duration: 2.5 });

      // 4. Fly away (dead drop style)
      tl.to([boxClass, wordClass], {
        y: '50vh', 
        opacity: 0, 
        duration: 0.4, 
        stagger: { amount: 0.1, from: 'random' },
        ease: 'power4.in'
      });
    };

    buildSequence('.anim-box-1', '.word-1');
    buildSequence('.anim-box-2', '.word-2');
    buildSequence('.anim-box-3', '.word-3');

  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ opacity: 0 }} className="min-h-[500px] pointer-events-none relative flex w-full flex-col items-center justify-center px-6 text-4xl font-extrabold font-sans tracking-tight whitespace-normal text-zinc-900 md:w-[60vw] md:px-0 md:text-6xl dark:text-zinc-100">
      
      {/* BLOCK 1 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
        <div className="anim-box-1 mx-8 max-w-[80vw] rotate-1 transform rounded-2xl border-4 border-black bg-gradient-to-br from-blue-400 to-indigo-500 px-8 py-4 text-4xl text-black shadow-xl md:text-5xl dark:border-white/20">
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
        <div className="anim-box-2 mx-8 max-w-[80vw] -rotate-2 transform rounded-2xl border-4 border-black bg-gradient-to-br from-pink-400 to-rose-500 px-8 py-4 text-4xl text-black shadow-xl md:text-5xl dark:border-white/20">
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
        <div className="anim-box-3 mx-8 max-w-[80vw] rotate-2 transform rounded-2xl border-4 border-black bg-gradient-to-br from-green-400 to-emerald-500 px-8 py-4 text-4xl text-black shadow-xl md:text-5xl dark:border-white/20">
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
