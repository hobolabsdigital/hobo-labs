"use client";

import * as React from "react";
import { useTheme } from '@/core/theme/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 left-4 z-50 bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-mono hover:bg-opacity-80 transition-opacity uppercase"
    >
      [ THEME: {theme} ]
    </button>
  );
}
