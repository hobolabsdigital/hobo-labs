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


  const { input, setInput, handleSend, submitPrompt, status, messages } = useEditorialChat();
  const isLoading = status === 'submitted' || status === 'streaming';
  
  // Visual representation of context bloat
  const contextLoad = messages.length;
  const maxContext = 20; // Soft visual limit
  const loadPercentage = Math.min((contextLoad / maxContext) * 100, 100);
  const getLoadColor = () => {
    if (loadPercentage < 50) return 'bg-[var(--brutalist-cyan)]';
    if (loadPercentage < 80) return 'bg-yellow-400';
    return 'bg-red-500';
  };

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
    <div className={`fixed md:absolute bottom-0 md:bottom-10 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-4xl z-[200] pointer-events-auto transition-all duration-700 ${INTRO_REVEAL_CLASSES} bg-background/40 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t md:border-t-0 border-foreground/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none pt-4 pb-6 md:p-0 flex flex-col gap-3 items-center ${isIntroAnimationFinished ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'
      }`}>

      {activeSuggestions.length > 0 && (
        <div
          className="relative w-full max-md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)] max-md:[mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]"
        >
          <div className="flex gap-2 justify-start md:justify-center w-full overflow-x-auto scrollbar-none animate-in fade-in slide-in-from-bottom-4 duration-500 px-8 md:px-2 pb-2 snap-x">
            {activeSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className={[
                  'whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  // Default (light/dark)
                  'px-4 py-2 text-sm rounded-full border border-foreground/15 bg-foreground/5 text-foreground/80 hover:bg-foreground hover:text-background',
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
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={[
          'mx-4 md:mx-0 w-[calc(100%-2rem)] md:w-full max-w-2xl flex items-center gap-2 p-2 border transition-[background-color,border-color,opacity] duration-500 ease-out',
          // Default
          `rounded-[2rem] ${isHistoryMode ? 'bg-background/20 md:bg-background/40 border-foreground/10 opacity-80' : 'bg-background/20 md:bg-background/95 border-foreground/20'}`,
          // Blueprint
          'blueprint:rounded-none blueprint:bg-background/90 blueprint:border-foreground/30',
          // Cyberpunk
          'cyberpunk:rounded-none cyberpunk:border-2 cyberpunk:border-primary/40 cyberpunk:bg-background/90',
          // Brutalist
          'brutalist:rounded-none brutalist:border-3 brutalist:border-foreground brutalist:bg-background/95',
          // Retro
          'retro:rounded-[2rem] retro:border-primary/30 retro:bg-background/90',
        ].join(' ')}
      >
        <label htmlFor="chat-input" className="sr-only">Chat message</label>
        <input
          id="chat-input"
          value={input}
          onChange={handleInputChange}
          placeholder={isHistoryMode ? "Type to branch off from this point in time..." : "Ask me about my work, process, or vision..."}
          disabled={false}
          className="flex-1 border-0 bg-transparent text-foreground outline-none focus:outline-none focus-visible:ring-0 rounded-none px-4 text-base md:text-lg brutalist:text-lg brutalist:font-bold transition-opacity placeholder:text-foreground/40 font-body"
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

      {/* Context Bloat Indicator */}
      <div className="w-[calc(100%-2rem)] md:w-full max-w-2xl px-4 flex items-center justify-between gap-4 opacity-50 transition-opacity hover:opacity-100">
        <div className="font-ui text-[10px] uppercase tracking-widest text-foreground/70 whitespace-nowrap">
          Context Load
        </div>
        <div className="flex-1 h-0.5 bg-foreground/10 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${getLoadColor()}`}
            style={{ width: `${loadPercentage}%` }}
          />
        </div>
        <div className="font-ui text-[10px] uppercase tracking-widest text-foreground/70 whitespace-nowrap">
          {contextLoad} MSG
        </div>
      </div>
    </div>
  );
}
