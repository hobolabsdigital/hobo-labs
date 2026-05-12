"use client";

import { motion } from "framer-motion";

export function IrisText({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const characters = text.split("");
  return (
    <span className={`inline-block ${className}`}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ clipPath: "circle(0% at 50% 50%)" }}
          animate={{ clipPath: "circle(150% at 50% 50%)" }}
          transition={{ duration: 0.8, delay: delay + i * 0.05, ease: "easeOut" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
