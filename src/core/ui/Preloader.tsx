"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="w-full h-screen bg-background flex flex-col items-center justify-center relative">
      <motion.div
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }}
        transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="font-ui text-sm tracking-widest uppercase text-foreground/60"
      >
        [ LOADING NEURAL MESH... ]
      </motion.div>
    </div>
  );
}
