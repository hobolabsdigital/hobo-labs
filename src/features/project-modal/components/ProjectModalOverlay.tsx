'use client';

import { useCallback, useEffect, useRef, useState, startTransition, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
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
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // Focus management: on open remember the trigger and move focus into the
  // modal; on close return focus to the triggering element.
  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const raf = requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      triggerRef.current?.focus();
      triggerRef.current = null;
    };
  }, [isOpen]);

  // Minimal focus trap: Tab / Shift+Tab wrap within the dialog.
  const handleTrapKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusables = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const { title, year, role, problem, solution } = (projectData ?? {}) as Record<string, unknown>;
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
          <div
            key="dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onKeyDown={handleTrapKeyDown}
            className="contents"
          >
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
                <h1 id="project-modal-title" className="text-4xl md:text-6xl mb-3 leading-tight font-heading brutalist:text-[var(--brutalist-cyan)]">{(title as string) || ''}</h1>
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

          {/* Close — ≥44px hit target; visual chip stays small via inner span */}
          <motion.button
            key="close-btn"
            ref={closeBtnRef}
            type="button"
            aria-label="Close project details"
            className="group fixed top-2 right-3 z-[10002] flex min-h-11 min-w-11 items-center justify-center p-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <span
              className={[
                'font-ui uppercase tracking-widest text-[10px] transition-all',
                'px-3 py-1 border border-foreground/30 text-foreground/70 group-hover:text-foreground group-hover:border-foreground',
                'bg-background/70 backdrop-blur-sm',
                'brutalist:bg-foreground brutalist:text-background brutalist:border-foreground brutalist:group-hover:opacity-80 brutalist:backdrop-blur-none',
              ].join(' ')}
            >
              [ ✕ CLOSE ]
            </span>
          </motion.button>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ProjectModalOverlay() {
  if (typeof document === 'undefined') return null;
  return createPortal(<OverlayContent />, document.body);
}
