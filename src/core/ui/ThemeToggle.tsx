"use client";

import * as React from "react";
import { useTheme } from '@/core/theme/theme-provider';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { INTRO_REVEAL_CLASSES } from '@/features/canvas/constants';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const themes = ["light", "dark", "blueprint", "cyberpunk", "brutalist", "retro"] as const;
    const currentIndex = themes.indexOf((theme as typeof themes[number]) || "light");
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-4 left-4 z-50 bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-ui uppercase hover:opacity-80 transition-opacity ${INTRO_REVEAL_CLASSES} ${
        isIntroAnimationFinished ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {theme === 'blueprint' ? '[ BLUEPRINT // REAL ]' : theme === 'cyberpunk' ? '[ CYBER // PUNK ]' : theme === 'brutalist' ? '[ BRUT // AL ]' : theme === 'retro' ? '[ RETRO // 70s ]' : theme === 'dark' ? '[ DARK ]' : '[ LIGHT ]'}
    </button>
  );
}
