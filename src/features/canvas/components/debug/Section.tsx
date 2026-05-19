"use client";

import { useState } from 'react';

export function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--foreground)]/30 pb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs uppercase tracking-wider font-bold py-1 cursor-pointer hover:opacity-70 transition-opacity"
      >
        <span>{title}</span>
        <span className="text-[10px] opacity-50">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="flex flex-col gap-2 mt-2">{children}</div>}
    </div>
  );
}
