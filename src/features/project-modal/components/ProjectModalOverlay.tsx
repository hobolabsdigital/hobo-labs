'use client';

import { useCallback, useEffect, useRef, useState, startTransition, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useProjectModalStore } from '../store/useProjectModalStore';
import Image from 'next/image';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { useTheme } from '@/core/theme/theme-provider';
import { getMotion } from '@/core/theme/theme-motion';

import { stagger, buildItemVariants } from '../utils/motion-variants';
import { ProjectDetails } from './ProjectDetails';
import { GallerySlider } from './GallerySlider';

function OverlayContent() {
  const { isOpen, activeNodeId, heroSrc, sourceRect, close } = useProjectModalStore();
  const projectData = useCanvasStore(state => state.nodes.find(n => n.id === activeNodeId)?.data);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const { resolvedTheme } = useTheme();
  const m = getMotion(resolvedTheme ?? 'light');
  const activeItem = useMemo(() => buildItemVariants(resolvedTheme ?? 'light'), [resolvedTheme]);
  const heroSlotRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const delay = sourceRect ? 800 : 0;
      const timer = setTimeout(() => setIsSettled(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, sourceRect]);

  useEffect(() => {
    if (isOpen && heroSlotRef.current && !targetRect) {
      // Use rAF to ensure layout has been computed
      requestAnimationFrame(() => {
        const rect = heroSlotRef.current?.getBoundingClientRect();
        if (rect) {
          setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      });
    }
    if (!isOpen && targetRect) {
      const timer = setTimeout(() => setTargetRect(null), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, targetRect]);

  const handleClose = useCallback(() => {
    setIsSettled(false);
    setCurrentIndex(0);
    // Give React a tiny tick to apply the false state (unmount slider, show layout image)
    // before AnimatePresence freezes the DOM tree for the exit animation.
    setTimeout(() => {
      startTransition(() => {
        close();
      });
    }, 20);
  }, [close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  if (!isOpen || !projectData) return null;

  const { title, year, role, problem, solution } = projectData;
  const quote = (projectData?.quote as string) || (projectData?.summary as string) || '';
  const techStack: string[] = Array.isArray(projectData?.techStack) ? projectData.techStack as string[] : [];

  const galleryRaw = Array.isArray(projectData?.gallery) ? projectData.gallery as string[] : [];
  const finalHeroSrc = heroSrc || galleryRaw[0] || '/portfolio/placeholder.png';
  const isStreaming = projectData?.isContextStreaming as boolean;
  
  // Bulletproof deduplication using word intersection for visually identical files
  const normalizedHeroSrc = finalHeroSrc.toLowerCase().trim();
  const getWords = (s: string) => s.split('/').pop()?.replace(/[^a-z0-9]/g, ' ').split(' ').filter(w => w.length > 2) || [];
  const heroWords = getWords(normalizedHeroSrc);
  
  const gallery = Array.from(new Set(galleryRaw.filter(Boolean))).filter((src) => {
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
            className="fixed inset-0 z-[10000] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* ── Flying hero image — animates from card position to modal hero slot ── */}
          {sourceRect && (
            <motion.img
              key="flying-hero"
              src={finalHeroSrc}
              alt={title as string}
              data-modal-image
              className="fixed object-cover z-[10002] shadow-2xl pointer-events-none"
              initial={{
                top: sourceRect.y,
                left: sourceRect.x,
                width: sourceRect.width,
                height: sourceRect.height,
                opacity: 1,
              }}
              animate={targetRect ? {
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                opacity: isSettled ? 0 : 1,
              } : {
                top: sourceRect.y,
                left: sourceRect.x,
                width: sourceRect.width,
                height: sourceRect.height,
                opacity: 1,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 30, mass: 0.8 }}
            />
          )}

          {/* Full-screen scrollable portal — the ProjectExpandedView layout */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-[10001] overflow-y-auto overflow-x-hidden"
          >
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              exit="exit"
              className="w-full max-w-5xl mx-auto px-8 md:px-16 pt-16 pb-24 flex flex-col gap-0"
            >
              {/* ── Title & meta ── */}
              <motion.header variants={activeItem} className="mb-10">
                <h1 className="text-4xl md:text-6xl mb-3 leading-tight font-heading brutalist:text-[var(--brutalist-cyan)]">{(title as string) || ''}</h1>
                <div className="flex gap-3 font-ui text-sm uppercase opacity-60">
                  {!!year && <span>{year as string}</span>}
                  {!!year && !!role && <span>•</span>}
                  {!!role && <span>{role as string}</span>}
                </div>
              </motion.header>

              {/* ── Hero image SLOT — visible once flying hero settles ── */}
              <motion.div
                ref={heroSlotRef}
                className="w-full shrink-0 aspect-video bg-transparent overflow-visible mb-12 relative"
              >
                <Image
                  src={finalHeroSrc}
                  alt={title as string}
                  fill
                  sizes="(max-width: 768px) 100vw, 1024px"
                  data-modal-image
                  className="object-cover shadow-2xl z-0"
                  style={{ opacity: 0 }}
                />

                {/* 2. The completely isolated, native dragging slider (Visible once settled) */}
                <GallerySlider 
                  isSettled={isSettled}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  imagesCount={imagesCount}
                  m={m}
                  finalHeroSrc={finalHeroSrc}
                  title={title as string}
                  gallery={gallery}
                />
              </motion.div>

              {/* ── Project Details ── */}
              <ProjectDetails 
                problem={problem as string | undefined}
                solution={solution as string | undefined}
                quote={quote}
                techStack={techStack}
                isStreaming={isStreaming}
                activeItem={activeItem}
              />
            </motion.div>
          </motion.div>

          {/* Close */}
          <motion.button
            key="close-btn"
            className={[
              'fixed top-5 right-6 z-[10002] font-ui uppercase tracking-widest text-[10px] transition-all',
              'px-3 py-1 border border-foreground/30 text-foreground/70 hover:text-foreground hover:border-foreground',
              'bg-background/70 backdrop-blur-sm',
              'brutalist:bg-foreground brutalist:text-background brutalist:border-foreground brutalist:hover:opacity-80 brutalist:backdrop-blur-none',
            ].join(' ')}
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
