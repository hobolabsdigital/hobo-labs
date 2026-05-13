'use client';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?';

export interface ScrambleLineProps {
  text: string;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
  onComplete?: () => void;
  splitMode?: boolean;
  charClassName?: string;
}

export function ScrambleLine({
  text,
  delay = 0,
  style,
  className,
  onComplete,
  splitMode = false,
  charClassName = '',
}: ScrambleLineProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const duration = 1.4;
      const chars = SCRAMBLE_CHARS.split('');
      const obj = { t: 0 };

      if (!splitMode) {
        el.textContent = text
          .split('')
          .map((c) => (c === ' ' ? '\u00a0' : chars[Math.floor(Math.random() * chars.length)]))
          .join('');
      }

      gsap.to(obj, {
        t: 1,
        duration,
        delay,
        ease: 'none',
        onUpdate() {
          if (!splitMode) {
            let out = '';
            for (let i = 0; i < text.length; i++) {
              if (text[i] === ' ') {
                out += '\u00a0';
              } else if (i / text.length < obj.t) {
                out += text[i];
              } else {
                out += chars[Math.floor(Math.random() * chars.length)];
              }
            }
            el.textContent = out;
          } else {
            for (let i = 0; i < text.length; i++) {
              const charNode = el.childNodes[i] as HTMLSpanElement;
              if (!charNode) continue;
              if (text[i] === ' ') {
                charNode.textContent = '\u00a0';
              } else if (i / text.length < obj.t) {
                charNode.textContent = text[i];
              } else {
                charNode.textContent = chars[Math.floor(Math.random() * chars.length)];
              }
            }
          }
        },
        onComplete() {
          if (!splitMode) {
            el.textContent = text;
          } else {
            for (let i = 0; i < text.length; i++) {
              const charNode = el.childNodes[i] as HTMLSpanElement;
              if (charNode) charNode.textContent = text[i];
            }
          }
          onComplete?.();
        },
      });
    },
    { dependencies: [text, delay, splitMode] },
  );

  return (
    <span ref={ref} className={className} style={style}>
      {splitMode
        ? text.split('').map((c, i) => (
            <span key={i} className={charClassName}>
              {c === ' ' ? '\u00a0' : c}
            </span>
          ))
        : text}
    </span>
  );
}

export function HeroText({
  isExiting,
  onScrambleComplete,
}: {
  isExiting?: boolean;
  onScrambleComplete?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      <ScrambleLine
        text="Welcome to"
        delay={0.3}
        className="welcome-to-text text-black/90 dark:text-white/80"
        style={{
          display: 'block',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(48px, 14vw, 280px)',
          fontWeight: 800,
          lineHeight: 0.9,
          letterSpacing: '-0.05em',
          whiteSpace: 'nowrap',
        }}
      />

      {/* Line 2 — "HOBOLABS" sleek gradient */}
      <ScrambleLine
        text="Hobo:labs"
        delay={1.0}
        splitMode={true}
        charClassName="hobo-labs-char"
        style={{
          display: 'block',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(60px, 17vw, 360px)',
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: '-0.06em',
          color: 'transparent',
          background: 'linear-gradient(90deg, #ff5c34, #ff007b)',
          WebkitBackgroundClip: 'text',
          whiteSpace: 'nowrap',
        }}
        onComplete={onScrambleComplete}
      />
    </div>
  );
}
