"use client";

import { Button } from '@/core/ui/components/button';
import { SendIcon } from "lucide-react";
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { INTRO_REVEAL_CLASSES } from '@/features/canvas/constants';
import { useEditorialChat } from '@/features/editor-chat/hooks/useEditorialChat';

export function ChatInput() {
  const timeCursor = useCanvasStore((state) => state.timeCursor);
  const isHistoryMode = timeCursor !== null;

  const activeSuggestions = useCanvasStore((state) => state.activeSuggestions);
  const clearSuggestions = useCanvasStore((state) => state.clearSuggestions);

  const { input, setInput, handleSend, submitPrompt, status } = useEditorialChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSuggestionClick = (suggestion: string) => {
    submitPrompt(suggestion);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const isIntroAnimationFinished = useCanvasStore((state) => state.isIntroAnimationFinished);

  return (
    <div className={`bg-transparent absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-[100] pointer-events-auto ${INTRO_REVEAL_CLASSES} flex flex-col gap-3 items-center ${isIntroAnimationFinished ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'
      }`}>

      {activeSuggestions.length > 0 && (
        <div className="flex gap-2 justify-center overflow-x-auto scrollbar-none animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
          {activeSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className={[
                'whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                // Default (light/dark)
                'px-4 py-2 text-sm rounded-full border border-foreground/15 bg-foreground/5 text-foreground/80 hover:bg-foreground hover:text-background backdrop-blur-sm',
                // Blueprint: monospace technical pills
                'blueprint:rounded-none blueprint:px-3 blueprint:py-1.5 blueprint:text-[11px] blueprint:font-ui blueprint:uppercase blueprint:tracking-widest blueprint:border-foreground/40 blueprint:bg-transparent blueprint:hover:bg-foreground blueprint:hover:text-background',
                // Cyberpunk: hot fuchsia accent pills
                'cyberpunk:rounded-none cyberpunk:border-2 cyberpunk:border-primary/60 cyberpunk:bg-primary/10 cyberpunk:text-primary cyberpunk:hover:bg-primary cyberpunk:hover:text-background',
                // Brutalist: thick black border pills
                'brutalist:rounded-none brutalist:border-3 brutalist:border-foreground brutalist:bg-transparent brutalist:text-foreground brutalist:text-base brutalist:font-bold brutalist:hover:bg-[var(--brutalist-cyan)] brutalist:hover:text-background brutalist:hover:border-[var(--brutalist-cyan)]',
                // Retro: soft rounded pills
                'retro:rounded-full retro:border-primary/40 retro:bg-primary/10 retro:text-foreground retro:hover:bg-primary retro:hover:text-background',
              ].join(' ')}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={[
          'w-full max-w-2xl flex items-center gap-2 p-2 border transition-[background-color,border-color,opacity] duration-500 ease-out',
          // Default
          `rounded-[2rem] backdrop-blur-2xl ${isHistoryMode ? 'bg-background/40 border-foreground/10 opacity-80' : 'bg-background/95 border-foreground/20'}`,
          // Blueprint
          'blueprint:rounded-none blueprint:bg-background/90 blueprint:border-foreground/30 blueprint:backdrop-blur-md',
          // Cyberpunk
          'cyberpunk:rounded-none cyberpunk:border-2 cyberpunk:border-primary/40 cyberpunk:bg-background/90 cyberpunk:backdrop-blur-md',
          // Brutalist
          'brutalist:rounded-none brutalist:border-3 brutalist:border-foreground brutalist:bg-background/95',
          // Retro
          'retro:rounded-[2rem] retro:border-primary/30 retro:bg-background/90 retro:backdrop-blur-sm',
        ].join(' ')}
      >
        <label htmlFor="chat-input" className="sr-only">Chat message</label>
        <input
          id="chat-input"
          value={input}
          onChange={handleInputChange}
          placeholder={isHistoryMode ? "Type to branch off from this point in time..." : "Ask me about my work, process, or vision..."}
          disabled={false}
          className="flex-1 border-0 bg-transparent text-foreground outline-none focus:outline-none focus-visible:ring-0 rounded-none px-4 text-base sm:text-lg brutalist:text-lg brutalist:font-bold transition-opacity placeholder:text-foreground/40 font-body"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          aria-label={isHistoryMode ? "Branch off from this point" : "Send message"}
          className={[
            'shrink-0 h-12 w-12 transition-[transform,background-color,box-shadow] active:scale-95',
            // Default
            `rounded-full ${isHistoryMode ? 'bg-foreground/20 text-foreground hover:bg-foreground/30' : 'bg-foreground text-background hover:bg-primary shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`,
            // Blueprint
            'blueprint:rounded-none blueprint:bg-foreground blueprint:text-background blueprint:hover:bg-primary',
            // Cyberpunk
            'cyberpunk:rounded-none cyberpunk:bg-primary cyberpunk:text-background cyberpunk:hover:bg-primary/80',
            // Brutalist
            'brutalist:rounded-none brutalist:bg-primary brutalist:text-background brutalist:border-3 brutalist:border-foreground brutalist:hover:bg-foreground brutalist:hover:text-primary',
            // Retro
            'retro:rounded-full retro:bg-primary retro:text-background retro:hover:bg-primary/80 retro:shadow-sm',
          ].join(' ')}
        >
          {isHistoryMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" /></svg>
          ) : (
            <SendIcon className="w-5 h-5 ml-0.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
