"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Preloader } from '@/core/ui/Preloader';
import { ReactFlowProvider } from '@xyflow/react';
import { useCrtStore } from '@/features/crt/store/useCrtStore';
import { useTheme } from '@/core/theme/theme-provider';

// UI Components
import { ChatInput } from '@/features/editor-chat/components/ChatInput';
import { DebugPanel } from '@/features/canvas/components/DebugPanel';
import { TimelineScrubber } from '@/features/timeline/components/TimelineScrubber';

import { InteractiveGrid } from '@/core/ui/InteractiveGrid';
import { MobileHeader } from '@/core/ui/MobileHeader';
import { FerrofluidCanvas } from '@/features/ferrofluid/components/FerrofluidCanvas';
import { FluidBackground } from "@/features/fluid-bg/components/FluidBackground";
import { CrtEffect } from '@/features/crt/components/CrtEffect';
import { ProjectModalOverlay } from '@/features/project-modal/components/ProjectModalOverlay';
import { RetroGradient } from '@/core/ui/RetroGradient';
import { ThemeIntro } from '@/core/ui/ThemeIntro';

const EditorialCanvas = dynamic(() => import("@/features/canvas/components/EditorialCanvas"), {
  ssr: false,
  loading: () => <Preloader />,
});

import { IntroNode } from '@/features/canvas/components/nodes/IntroNode';
import { useMediaQuery } from '@/core/hooks/useMediaQuery';
import { MobileStreamView } from '@/features/canvas/components/MobileStreamView';

export default function Home() {
  const crtMode = useCrtStore((s) => s.crtMode);
  const { resolvedTheme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isMounted, setIsMounted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const isExperimental = crtMode === "experimental";
  const isBrutalist = resolvedTheme === 'brutalist';
  const captureRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isExperimental) return;
    const el = captureRef.current;
    el?.setAttribute("layoutsubtree", "true");
    return () => {
      el?.removeAttribute("layoutsubtree");
    };
  }, [isExperimental]);

  /*
   * Shared page content — used in both modes.
   * In experimental mode, this is placed inside <canvas layoutsubtree>
   * so drawElementImage can capture it.
   */
  const pageContent = isMobile ? (
    <main
      id="crt-main"
      className="w-full h-[100dvh] overflow-hidden bg-transparent relative"
    >
      {introComplete && <IntroNode />}
      <MobileStreamView />
      {introComplete && <ChatInput />}
    </main>
  ) : (
    <main
      id="crt-main"
      className="w-full h-[100dvh] overflow-hidden bg-transparent relative"
    >
      {introComplete && <IntroNode />}
      <EditorialCanvas>
        <InteractiveGrid />
      </EditorialCanvas>
      {introComplete && <ChatInput />}
    </main>
  );

  return (
    <>
      {/* CRT mode selector + effects — always rendered */}
      <CrtEffect />
      {/* Page content only mounts after user selects a CRT mode.
          This ensures the intro animation doesn't start until the
          mode selector popup is dismissed. */}
      {crtMode !== null && (
        <ReactFlowProvider>
          {isMounted && !introComplete && <ThemeIntro onComplete={() => setIntroComplete(true)} />}

          {isMounted && (
            isExperimental ? (
              <canvas
                id="crt-capture"
                ref={captureRef}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                }}
              >
                {pageContent}
              </canvas>
            ) : (
              pageContent
            )
          )}
          
          {isMounted && introComplete && <ProjectModalOverlay />}
          {isMounted && introComplete && <div className="md:hidden"><MobileHeader /></div>}
          {isMounted && introComplete && <div className="hidden md:block"><DebugPanel /></div>}
          {isMounted && introComplete && <div className="hidden md:block"><TimelineScrubber /></div>}
          {isMounted && <RetroGradient />}
          
          {isMounted && <FerrofluidCanvas />}
          {isMounted && <FluidBackground />}

        </ReactFlowProvider>
      )}
    </>
  );
}
