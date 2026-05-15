'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useProjectModalStore } from '../store/useProjectModalStore';
import { X } from 'lucide-react';

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -20 }
};

function OverlayContent() {
  const { isOpen, projectData, close } = useProjectModalStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setIsSettled(false);
    } else {
      const timer = setTimeout(() => setIsSettled(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsSettled(false);
    // Give React a tiny tick to apply the false state (unmount slider, show layout image)
    // before AnimatePresence freezes the DOM tree for the exit animation.
    setTimeout(() => {
      close();
    }, 20);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  if (!isOpen || !projectData) return null;

  const { id, title, year, role, problem, solution } = projectData;
  const quote = (projectData?.quote as string) || (projectData?.summary as string) || '';
  const techStack: string[] = Array.isArray(projectData?.techStack) ? projectData.techStack as string[] : [];

  const galleryRaw = Array.isArray(projectData?.gallery) ? projectData.gallery as string[] : [];
  const heroSrc = (projectData?.heroSrc as string) || galleryRaw[0] || '/portfolio/placeholder.png';
  
  // Bulletproof deduplication using word intersection for visually identical files (e.g. my-mazda.png vs Find-My-Mazda-01.png)
  const normalizedHeroSrc = heroSrc.toLowerCase().trim();
  const getWords = (s: string) => s.split('/').pop()?.replace(/[^a-z0-9]/g, ' ').split(' ').filter(w => w.length > 2) || [];
  const heroWords = getWords(normalizedHeroSrc);
  
  const gallery = Array.from(new Set(galleryRaw.filter(Boolean))).filter((src, idx) => {
    const normSrc = src.toLowerCase().trim();
    if (normSrc === normalizedHeroSrc) return false;
    
    if (normSrc.match(/[-_]0?1\.[a-z]+$/)) {
      const srcWords = getWords(normSrc);
      const shared = heroWords.filter(w => srcWords.includes(w));
      if (shared.length > 0) return false;
    }
    
    return true;
  });
  
  const imagesCount = 1 + gallery.length;

  return (
    <AnimatePresence>
      {isOpen && projectData && (
        <>
          {/* Backdrop — solid, hides the canvas entirely */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[200] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* Full-screen scrollable portal — the ProjectExpandedView layout */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-[201] overflow-y-auto overflow-x-hidden"
          >
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              exit="exit"
              className="w-full max-w-5xl mx-auto px-8 md:px-16 pt-16 pb-24 flex flex-col gap-0"
            >
              {/* ── Title & meta ── */}
              <motion.header variants={item} className="mb-10">
                <h1 className="text-4xl md:text-6xl font-mono mb-3 leading-tight">{title}</h1>
                <div className="flex gap-3 font-mono text-sm uppercase opacity-60">
                  {year && <span>{year}</span>}
                  {year && role && <span>•</span>}
                  {role && <span>{role}</span>}
                </div>
              </motion.header>

              {/* ── Hero image SLOT ── */}
              <motion.div
                className="w-full shrink-0 aspect-video bg-transparent overflow-visible mb-12 relative"
              >
                {/* 1. The pristine layoutId hero image (Hidden once settled) */}
                <motion.img
                  layoutId={`project-hero-${id}`}
                  src={heroSrc}
                  alt={title}
                  className="w-full h-full object-cover shadow-2xl block relative z-0"
                  transition={{ type: 'spring', stiffness: 280, damping: 32, mass: 0.8 }}
                  style={{ opacity: isSettled ? 0 : 1 }}
                />

                {/* 2. The completely isolated, native dragging slider (Visible once settled) */}
                {isSettled && (
                  <motion.div
                    className="absolute inset-0 w-full h-full z-10"
                    animate={{ x: `calc(-${currentIndex * 100}% - ${currentIndex * 32}px)` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    drag={imagesCount > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x + velocity.x * 0.2;
                      if (swipe < -50) {
                        setCurrentIndex(i => Math.min(imagesCount - 1, i + 1));
                      } else if (swipe > 50) {
                        setCurrentIndex(i => Math.max(0, i - 1));
                      }
                    }}
                    style={{ cursor: imagesCount > 1 ? 'grab' : 'auto' }}
                    whileTap={{ cursor: imagesCount > 1 ? 'grabbing' : 'auto' }}
                  >
                    {/* The Swapped Hero Image (Index 0) */}
                    <motion.img
                      draggable={false}
                      src={heroSrc}
                      alt={title}
                      className="absolute top-0 left-0 w-full h-full object-cover shadow-2xl block cursor-pointer"
                      animate={{ opacity: currentIndex === 0 ? 1 : 0.3 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => setCurrentIndex(0)}
                    />

                    {/* Gallery Images (Index 1+) */}
                    {gallery.map((src, i) => {
                      const index = i + 1;
                      return (
                        <motion.img
                          key={src}
                          draggable={false}
                          src={src}
                          alt={`${title} gallery ${index}`}
                          className="absolute top-0 w-full h-full object-cover shadow-2xl cursor-pointer"
                          style={{ left: `calc(${index * 100}% + ${index * 32}px)` }}
                          animate={{ opacity: currentIndex === index ? 1 : 0.3 }}
                          whileHover={{ opacity: 1 }}
                          onClick={() => setCurrentIndex(index)}
                        />
                      );
                    })}
                  </motion.div>
                )}

                {/* Dot Navigation */}
                {isSettled && imagesCount > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-10 left-0 right-0 flex justify-center gap-3 z-20"
                  >
                    {Array.from({ length: imagesCount }).map((_, i) => (
                      <button
                        key={`dot-${i}`}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentIndex ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/20 hover:bg-foreground/50'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* ── Problem / Solution ── */}
              {(problem || solution) && (
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                  {problem && (
                    <div className="border-t border-foreground/15 pt-5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">Problem</p>
                      <p className="text-sm text-foreground/70 leading-relaxed">{problem}</p>
                    </div>
                  )}
                  {solution && (
                    <div className="border-t border-foreground/15 pt-5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">Solution</p>
                      <p className="text-sm text-foreground/70 leading-relaxed">{solution}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Pull quote ── */}
              {quote && (
                <motion.div variants={item} className="border-l-2 border-foreground/20 pl-6 mb-12">
                  <p className="text-xl md:text-3xl font-light text-foreground/75 leading-snug italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                </motion.div>
              )}

              {/* ── Tech stack ── */}
              {techStack.length > 0 && (
                <motion.div variants={item} className="flex flex-wrap gap-2">
                  {techStack.map((tech, i) => (
                    <span key={i} className="px-2 py-1 border border-foreground/15 font-mono text-[10px] uppercase tracking-wider text-foreground/50">
                      {tech}
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Close */}
          <motion.button
            key="close-btn"
            className="fixed top-5 right-6 z-[203] font-mono text-[10px] uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            [ ✕ CLOSE ]
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}

export function ProjectModalOverlay() {
  if (typeof document === 'undefined') return null;
  return createPortal(<OverlayContent />, document.body);
}
