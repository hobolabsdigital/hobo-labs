import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  /** Milliseconds per character (default: 30) */
  speed?: number;
  /** Whether the typewriter effect is active (default: true) */
  enabled?: boolean;
  /** Callback when typing completes */
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  /** The currently visible portion of text */
  displayText: string;
  /** Whether all characters have been revealed */
  isComplete: boolean;
  /** Blinking cursor visibility state (toggles every 500ms) */
  cursorVisible: boolean;
}

/**
 * MS-DOS style typewriter effect.
 * Reveals text character-by-character at a configurable speed.
 */
export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const { speed = 30, enabled = true, onComplete } = options;
  const [charIndex, setCharIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset when text changes
  useEffect(() => {
    if (enabled) {
      setCharIndex(0);
    }
  }, [text, enabled]);

  // Character reveal loop
  useEffect(() => {
    if (!enabled || charIndex >= text.length) {
      if (enabled && charIndex >= text.length && text.length > 0) {
        onCompleteRef.current?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCharIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, text.length, speed, enabled]);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const isComplete = !enabled || charIndex >= text.length;
  const displayText = enabled ? text.slice(0, charIndex) : text;

  return { displayText, isComplete, cursorVisible };
}
