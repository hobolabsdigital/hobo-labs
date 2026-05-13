'use client';
import React, { useRef } from 'react';
import { Code2, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Helper to split text into words for GSAP staggering
function SplitWords({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i} className={className} style={{ opacity: 0, transform: 'translateY(20px)' }}>
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
    gsap.set('.anim-box, .anim-tag-1, .anim-tag-2', { opacity: 0, scale: 0.8, y: 20 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onAnimationComplete) onAnimationComplete();
      }
    });

    // 1. Box pop in
    tl.to('.anim-box', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.5)',
    });

    // 2. Part 1 text stagger
    tl.to('.anim-word-1', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
    }, "-=0.2");

    // 3. Tag 1 pop
    tl.to('.anim-tag-1', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(2)',
    }, "-=0.1");

    // 4. Part 2 text stagger
    tl.to('.anim-word-2', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
    }, "-=0.1");

    // 5. Tag 2 pop
    tl.to('.anim-tag-2', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(2)',
    }, "-=0.1");

    // 6. Final word
    tl.to('.anim-word-3', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, "-=0.1");

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pointer-events-none flex w-full flex-col items-center gap-16 px-6 pb-32 text-4xl font-extrabold tracking-tight whitespace-normal text-zinc-900 md:w-max md:flex-row md:gap-0 md:px-12 md:pb-0 md:text-7xl md:whitespace-nowrap dark:text-zinc-100">
      {/* Box 1: Systems Whisperer */}
      <div className="anim-box mx-8 max-w-[80vw] -rotate-3 transform rounded-2xl border-4 border-black bg-gradient-to-br from-green-400 to-green-600 px-8 py-4 text-4xl text-black shadow-xl md:text-5xl dark:border-white/20">
        Systems Whisperer
      </div>

      <div className="flex max-w-[90vw] flex-wrap items-center justify-center gap-y-6 text-center md:max-w-none md:flex-nowrap md:gap-y-0 md:text-left">
        {/* PART 1 */}
        <SplitWords
          text="Architecting systems with soul."
          className="anim-word-1 inline-block px-1"
        />
        <span className="mx-2 md:mx-4" />

        <SplitWords
          text="I craft"
          className="anim-word-1 inline-block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text px-1 text-transparent"
        />
        <span className="mx-2 md:mx-4" />

        {/* Floating Tag embedded inline */}
        <span className="anim-tag-1 mx-4 flex w-max rotate-2 transform items-center justify-center gap-2 rounded-full border-2 border-black bg-[#FF90E8] px-6 py-2 text-3xl font-bold text-black shadow-lg">
          <Sparkles size={28} /> Plushcore
        </span>

        <span className="mx-2 md:mx-4" />

        {/* PART 2 */}
        <SplitWords
          text="web experiences that react to your presence."
          className="anim-word-2 inline-block px-1"
        />
        <span className="mx-2 md:mx-4" />

        <SplitWords
          text="No sterile templates."
          className="anim-word-2 inline-block px-1 text-zinc-400"
        />
        <span className="mx-2 md:mx-4" />

        <SplitWords text="Just" className="anim-word-2 inline-block px-1" />
        <span className="mx-2 md:mx-4" />

        <span className="anim-tag-2 mx-4 flex w-max -rotate-1 transform items-center justify-center gap-2 rounded-full border-2 border-black bg-[#38bdf8] px-6 py-2 text-3xl font-bold text-black shadow-lg">
          <Code2 size={28} /> Hand-crafted
        </span>

        <span className="mx-2 md:mx-4" />
        <SplitWords text="magic." className="anim-word-3 inline-block px-1" />
      </div>
    </div>
  );
}
