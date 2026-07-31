"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Preloader } from '@/core/ui/Preloader';
import { ReactFlowProvider } from '@xyflow/react';
import { useTheme } from '@/core/theme/theme-provider';

// UI Components
import { ChatInput } from '@/features/editor-chat/components/ChatInput';
import { DebugPanel } from '@/features/canvas/components/DebugPanel';
import { TimelineScrubber } from '@/features/timeline/components/TimelineScrubber';

import { InteractiveGrid } from '@/core/ui/InteractiveGrid';
import { MobileHeader } from '@/core/ui/MobileHeader';
import { ProjectModalOverlay } from '@/features/project-modal/components/ProjectModalOverlay';
import { RetroGradient } from '@/core/ui/RetroGradient';
import { ThemeIntro } from '@/core/ui/ThemeIntro';

const EditorialCanvas = dynamic(() => import("@/features/canvas/components/EditorialCanvas"), {
  ssr: false,
  loading: () => <Preloader />,
});

// Heavy WebGL components — client-only, code-split out of the initial bundle.
// Mount order / z-index behavior is unchanged (same JSX positions as before).
const FerrofluidCanvas = dynamic(
  () => import('@/features/ferrofluid/components/FerrofluidCanvas').then((m) => m.FerrofluidCanvas),
  { ssr: false }
);
const FluidBackground = dynamic(
  () => import('@/features/fluid-bg/components/FluidBackground').then((m) => m.FluidBackground),
  { ssr: false }
);
const CrtEffect = dynamic(
  () => import('@/features/crt/components/CrtEffect').then((m) => m.CrtEffect),
  { ssr: false }
);

import { IntroNode } from '@/features/canvas/components/nodes/IntroNode';
import { useMediaQuery } from '@/core/hooks/useMediaQuery';
import { MobileStreamView } from '@/features/canvas/components/MobileStreamView';

export default function Home() {
  const { resolvedTheme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isMounted, setIsMounted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const isBrutalist = resolvedTheme === 'brutalist';

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

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
      {/* CRT effects — always rendered */}
      <CrtEffect />
      <ReactFlowProvider>
        {isMounted && !introComplete && <ThemeIntro onComplete={() => setIntroComplete(true)} />}

        {isMounted && pageContent}

        {isMounted && introComplete && <ProjectModalOverlay />}
        {isMounted && introComplete && <div className="md:hidden"><MobileHeader /></div>}
        {isMounted && introComplete && <div className="hidden md:block"><DebugPanel /></div>}
        {isMounted && introComplete && <div className="hidden md:block"><TimelineScrubber /></div>}
        {isMounted && <RetroGradient />}

        {isMounted && <FerrofluidCanvas />}
        {isMounted && <FluidBackground />}

      </ReactFlowProvider>
    </>
  );
}
