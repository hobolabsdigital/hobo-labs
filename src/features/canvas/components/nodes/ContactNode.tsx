"use client";

import React from 'react';
import { NodeHandles } from './NodeHandles';
import { motion, AnimatePresence, Variants } from "framer-motion";
import type { ContactNodeData } from '@/lib/ai/types';

export const ContactNode = React.memo(function ContactNode({ data }: { data: ContactNodeData }) {
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
        className="relative flex flex-col bg-background/80 backdrop-blur-md border-2 border-foreground/10 p-8 w-[400px] origin-left"
        style={{ borderRadius: "2px" }}
      >
        <NodeHandles />
        
        <motion.div variants={itemVariants} className="mb-6">
          <p className="font-ui text-xs text-[var(--brutalist-cyan)] uppercase tracking-widest mb-1">[CONTACT]</p>
          <h2 className="text-3xl font-heading font-bold text-foreground leading-none uppercase tracking-tighter">
            Let&apos;s Talk
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col space-y-4 font-body">
          <div className="flex flex-col">
            <span className="text-xs text-foreground/50 uppercase tracking-widest mb-1">Email</span>
            <a 
              href={`mailto:${data.email || 'hello@hobolabs.digital'}`} 
              className="text-lg text-foreground hover:text-[var(--brutalist-cyan)] transition-colors"
            >
              {data.email || 'hello@hobolabs.digital'}
            </a>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-foreground/50 uppercase tracking-widest mb-1">Phone</span>
            <a 
              href={`tel:${data.phone || '00436801542697'}`} 
              className="text-lg text-foreground hover:text-[var(--brutalist-cyan)] transition-colors"
            >
              {data.phone || '00436801542697'}
            </a>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 pt-4 border-t-2 border-foreground/10">
          <p className="font-ui text-sm text-foreground italic">
            &quot;{data.tagline || 'I build worlds that make logic feel human.'}&quot;
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
