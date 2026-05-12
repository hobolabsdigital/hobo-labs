"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";

export const ProjectNode = React.memo(function ProjectNode({ data, id }: { data: any, id: string }) {
  const title = data.title || "UNTITLED PROJECT";
  const summary = data.summary || "Project summary not provided.";
  const content = data.content;
  const role = data.role;
  const year = data.year;
  const image = data.image || null;
  const gallery = data.gallery || [];
  const techStack = data.techStack || [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -40 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-transparent origin-center flex flex-col gap-16"
        style={{ width: '900px' }}
      >
        {/* Floating Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="flex-1">
            <p className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase mb-6">
              {year ? `SELECTED WORK — ${year}` : 'SELECTED WORK'}
            </p>
            <h2 className="text-7xl md:text-8xl font-sans font-medium leading-[0.85] tracking-tighter uppercase break-words text-foreground">
              {title}
            </h2>
          </div>
          
          {(role || techStack.length > 0) && (
            <div className="flex flex-col gap-6 text-right pb-2">
              {role && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-foreground/30 mb-2">ROLE</p>
                  <p className="font-sans text-sm font-medium uppercase tracking-widest text-foreground">{role}</p>
                </div>
              )}
              {techStack.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2 max-w-[280px]">
                  {techStack.map((tech: string, i: number) => (
                    <span key={i} className="px-4 py-1.5 rounded-full border border-foreground/10 text-foreground/80 font-mono text-[9px] tracking-widest uppercase bg-foreground/5 backdrop-blur-md">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Floating Organic Image */}
        {image && (
          <div 
            className="w-full h-[500px] relative overflow-hidden shadow-2xl"
            style={{ borderRadius: "30% 70% 50% 50% / 50% 30% 70% 50%" }}
          >
            <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 hover:grayscale-0 grayscale transition-all duration-1000 ease-out" />
          </div>
        )}

        {/* Floating Asymmetric Text Columns */}
        <div className="grid grid-cols-12 gap-16 items-start">
          <div className="col-span-5">
            <h3 className="text-3xl md:text-4xl font-serif font-light text-foreground leading-[1.2] tracking-tight">
              {summary}
            </h3>
          </div>
          
          <div className="col-span-7">
             {content && (
                <div className="prose prose-invert max-w-none">
                  {content.split('\n\n').map((para: string, i: number) => (
                    <p key={i} className="font-sans text-lg text-foreground/70 leading-[1.8] mb-8 font-light">
                      {para}
                    </p>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Floating Asymmetric Gallery */}
        {gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-8 mt-12 mb-12">
            {gallery.map((img: string, i: number) => (
              <div 
                key={i} 
                className={`relative overflow-hidden shadow-xl aspect-[4/5] rounded-[2rem] ${i === 1 ? 'mt-24' : i === 2 ? 'mt-12' : ''}`}
              >
                <img src={img} alt={`Gallery ${i}`} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        )}

        {/* Connection Handles */}
        {['top', 'right', 'bottom', 'left'].map(pos => {
          const positionEnum = pos === 'top' ? Position.Top : pos === 'right' ? Position.Right : pos === 'bottom' ? Position.Bottom : Position.Left;
          return (
            <React.Fragment key={pos}>
              <Handle type="target" position={positionEnum} id={pos} className="opacity-0" />
              <Handle type="source" position={positionEnum} id={pos} className="opacity-0" />
            </React.Fragment>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
});
