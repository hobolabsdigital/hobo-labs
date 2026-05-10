"use client";

import { motion } from "framer-motion";

export function AnnotationText({
  children,
  type = "circle",
  color = "var(--color-accent-lime)",
  delay = 0
}: {
  children: React.ReactNode;
  type?: "circle" | "underline";
  color?: string;
  delay?: number;
}) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        {type === "circle" && (
          <motion.path
            d="M 5,50 C 15, -10 95, -10 95, 50 C 95, 110 5, 110 5, 50 Z"
            fill="transparent"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay, ease: "easeInOut" }}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {type === "underline" && (
          <motion.path
            d="M -5,95 Q 50,110 105,90"
            fill="transparent"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </span>
  );
}
