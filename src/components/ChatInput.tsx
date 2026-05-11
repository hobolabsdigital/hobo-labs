"use client";

import { Button } from "@/components/ui/button";

import { SendIcon, LockIcon } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, onSubmit, isLoading }: ChatInputProps) {
  const timeCursor = useCanvasStore((state) => state.timeCursor);
  const isHistoryMode = timeCursor !== null;

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[100] pointer-events-auto transition-all duration-300">
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
          onChange={(e) => setInput(e.target.value)}
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
