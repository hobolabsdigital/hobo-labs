"use client";

import * as React from "react";
import { useTheme } from '@/core/theme/theme-provider';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { INTRO_REVEAL_CLASSES } from '@/features/canvas/constants';
import { Logo } from '@/core/ui/Logo';

export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) return null;

  const themes = ["light", "dark", "blueprint", "cyberpunk", "brutalist", "retro"] as const;

  return (
    <header 
      ref={headerRef}
      className={`fixed md:hidden top-0 left-0 w-full z-[10000] flex items-center justify-between px-4 py-4 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--border)] transition-opacity duration-700 ${INTRO_REVEAL_CLASSES} ${
        isIntroAnimationFinished ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center relative z-[100] text-[var(--foreground)]">
         <Logo className="w-24 h-auto" />
      </div>

      {/* Theme Switcher Dropdown */}
      <div className="relative z-[100]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 rounded-full border border-[var(--foreground)] flex items-center justify-center text-[var(--foreground)] transition-colors ${isOpen ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--background)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'}`}
          aria-label="Toggle Theme"
        >
          {/* Minimalist half-moon/circle icon */}
          <div className="w-4 h-4 rounded-full border-[1.5px] border-current shadow-[inset_3px_0_0_current]"></div>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-3 w-40 bg-[var(--background)] border-2 border-[var(--foreground)] shadow-xl flex flex-col font-ui text-sm uppercase">
            {themes.map(t => (
              <button 
                key={t}
                onClick={() => {
                  setTheme(t);
                  setIsOpen(false);
                }}
                className={`text-left px-4 py-3 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors border-b-2 border-[var(--foreground)] last:border-0 ${theme === t ? 'font-bold before:content-[">_"] before:mr-2' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
