"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, onSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[100] pointer-events-auto">
      <form 
        onSubmit={onSubmit}
        className="flex items-center gap-2 bg-background/95 backdrop-blur-2xl p-2 rounded-full shadow-2xl border border-border"
      >
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about my work, process, or vision..." 
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 text-base sm:text-lg"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="rounded-full shrink-0 h-10 w-10 bg-primary hover:bg-primary/90 transition-transform active:scale-95"
        >
          <SendIcon className="w-5 h-5 text-white" />
        </Button>
      </form>
    </div>
  );
}
