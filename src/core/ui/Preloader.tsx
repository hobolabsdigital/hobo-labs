"use client";

import React from "react";
import { motion } from "framer-motion";

export function Preloader() {
  return (
    <div className="w-full h-screen bg-background flex flex-col items-center justify-center relative">
      <motion.div 
        animate={{ opacity: [1, 0, 1] }} 
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="font-ui text-sm tracking-widest uppercase text-foreground/50"
      >
        [ LOADING NEURAL MESH... ]
      </motion.div>
    </div>
  );
}
