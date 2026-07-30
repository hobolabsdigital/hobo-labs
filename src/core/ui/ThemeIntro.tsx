"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, AppTheme } from "@/core/theme/theme-provider";
import { useFerrofluidStore } from "@/features/ferrofluid/store/useFerrofluidStore";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeIntroProps {
  onComplete: () => void;
}

const THEMES: { id: AppTheme; label: string }[] = [
  { id: "light", label: "¯\\_(ツ)_/¯" },
  { id: "dark", label: "¯\\_( -_•ิ )_/¯" },
  { id: "blueprint", label: "┌───[ ⌀ _ ⌀ ]───┐" },
  { id: "cyberpunk", label: "⚡ ¯\\_( ✖ _ ⚙ )_/¯" },
  { id: "brutalist", label: "▄█▀ [ ▬▬ ] ▀█▄" },
  { id: "retro", label: "░▒▓█ ¯\\_( ⌐■_■ )_/¯ █▓▒░" },
];

const INTRO_MESSAGES = [
  "What’s the vibe today?",
  "How is your world spinning?",
  "Where is your head at today?",
  "How are things tracking?"
];

export function ThemeIntro({ onComplete }: ThemeIntroProps) {
  const { theme, setTheme } = useTheme();
  // Default to brutalist or whatever the current theme is
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(
    (theme as AppTheme) || "brutalist"
  );
  const [isExiting, setIsExiting] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % INTRO_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (t: AppTheme) => {
    setSelectedTheme(t);
    setTheme(t);
  };

  const handleComplete = () => {
    if (isExiting || !containerRef.current) return;
    setIsExiting(true);

    const ferrofluidStore = useFerrofluidStore.getState();
    const startZ = ferrofluidStore.config.cameraZ;
    const proxy = { cameraZ: startZ };

    const tl = gsap.timeline();

    // 1. Blocks animate away
    tl.to(containerRef.current.children, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.in",
    });

    // 2. Camera zooms out
    tl.to(
      proxy,
      {
        cameraZ: 14.0, // zoom out
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: () => {
          ferrofluidStore.setConfig({ cameraZ: proxy.cameraZ });
        },
      },
      "<0.2" // start slightly after the blocks start fading
    );

    // 3. Intro anim start (mounts the rest of the app)
    tl.call(() => {
      onComplete();
    });

    // 4. Camera settles back in
    tl.to(proxy, {
      cameraZ: startZ,
      duration: 2.5,
      ease: "power3.out",
      onUpdate: () => {
        ferrofluidStore.setConfig({ cameraZ: proxy.cameraZ });
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-[100] flex flex-col items-center justify-center p-4 pt-16 md:pt-4 font-mono select-none ${isExiting ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      <div aria-live="polite" className="h-[80px] md:h-[60px] mb-6 md:mb-10 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-xl md:text-3xl font-heading font-bold uppercase tracking-widest text-[var(--foreground)] drop-shadow-md text-center px-4 max-w-[80vw]"
          >
            {INTRO_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 mb-8 md:mb-12 w-full max-w-sm">
        {THEMES.map((t) => {
          const isSelected = selectedTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`
                px-4 py-3 text-center transition-all duration-200 uppercase tracking-widest text-sm
                border-2 border-[var(--foreground)]
                ${isSelected
                  ? "bg-[var(--foreground)] text-[var(--background)] scale-105"
                  : "bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] opacity-70 hover:opacity-100"
                }
              `}
              style={{
                boxShadow: isSelected ? "4px 4px 0 var(--foreground)" : "none",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleComplete}
        className="px-8 py-3 border-2 border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors uppercase tracking-widest text-2xl font-bold"
        style={{ boxShadow: "4px 4px 0 var(--foreground)" }}
      >
        (↵)
      </button>
    </div>
  );
}
