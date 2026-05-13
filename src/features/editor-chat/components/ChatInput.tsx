"use client";

import { Button } from '@/core/ui/components/button';

import { SendIcon, SparklesIcon } from "lucide-react";
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { useBeeStore } from '@/features/swarm/store/useBeeStore';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useEditorialChat } from '@/features/editor-chat/hooks/useEditorialChat';

export function ChatInput() {
  const timeCursor = useCanvasStore((state) => state.timeCursor);
  const isHistoryMode = timeCursor !== null;
  const setIsSleeping = useBeeStore((state) => state.setIsSleeping);
  
  const { input, setInput, handleSend, status } = useEditorialChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    let mounted = true;
    fetch('/api/suggestions')
      .then(res => res.json())
      .then(data => {
        if (mounted && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(console.error);
    
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setIsSleeping(isLoading || input.length > 0);
  }, [isLoading, setIsSleeping]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setIsSleeping(isLoading || val.length > 0);
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[100] pointer-events-auto transition-all duration-300 flex flex-col gap-3">
      
      {/* Quick Prompt Suggestions */}
      {!isHistoryMode && input.length === 0 && !isLoading && suggestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-2"
        >
          <SparklesIcon className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
          {suggestions.map((suggestion, i) => (
            <Button
              key={i}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setInput(suggestion);
                setIsSleeping(true);
              }}
              className="rounded-full whitespace-nowrap text-xs font-normal"
            >
              {i === 0 && <span className="text-blue-400 mr-1.5">✨</span>}
              {suggestion}
            </Button>
          ))}
        </motion.div>
      )}

      <form 
        onSubmit={onSubmit}
        className={`flex items-center gap-2 p-2 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border transition-all duration-500 ease-out ${
          isHistoryMode 
            ? "bg-zinc-900/40 backdrop-blur-md border-white/10 opacity-80" 
            : "bg-zinc-900/95 backdrop-blur-2xl border-white/20"
        }`}
      >
        <input 
          value={input}
          onChange={handleInputChange}
          placeholder={isHistoryMode ? "Type to branch off from this point in time..." : "Ask me about my work, process, or vision..."} 
          disabled={false}
          className="flex-1 border-0 bg-transparent text-white outline-none focus:outline-none focus:ring-0 px-4 text-base sm:text-lg transition-opacity placeholder:text-zinc-400"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className={`rounded-full shrink-0 h-12 w-12 transition-all active:scale-95 ${
            isHistoryMode 
              ? "bg-zinc-700 text-white hover:bg-zinc-600" 
              : "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          }`}
        >
          {isHistoryMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
          ) : (
            <SendIcon className="w-5 h-5 ml-0.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
