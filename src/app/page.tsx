"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Preloader } from '@/core/ui/Preloader';
import { ReactFlowProvider } from '@xyflow/react';
import { useCrtStore } from '@/features/crt/store/useCrtStore';
import { useTheme } from '@/core/theme/theme-provider';

// UI Components
import { ChatInput } from '@/features/editor-chat/components/ChatInput';
import { DebugPanel } from '@/features/canvas/components/DebugPanel';
import { TimelineScrubber } from '@/features/timeline/components/TimelineScrubber';
import { FluidBackground } from '@/features/fluid-bg/components/FluidBackground';
import { InteractiveGrid } from '@/core/ui/InteractiveGrid';

import { CrtEffect } from '@/features/crt/components/CrtEffect';
import { ProjectModalOverlay } from '@/features/project-modal/components/ProjectModalOverlay';

const EditorialCanvas = dynamic(() => import("@/features/canvas/components/EditorialCanvas"), {
  ssr: false,
  loading: () => <Preloader />,
});

import { IntroNode } from '@/features/canvas/components/nodes/IntroNode';

export default function Home() {
  const crtMode = useCrtStore((s) => s.crtMode);
  const { resolvedTheme } = useTheme();
  const isExperimental = crtMode === "experimental";
  const isBrutalist = resolvedTheme === 'brutalist';
  const captureRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isExperimental) return;
    const el = captureRef.current;
    el?.setAttribute("layoutsubtree", "true");
    return () => {
      el?.removeAttribute("layoutsubtree");
    };
  }, [isExperimental]);

  // SVG chromatic aberration filter — disabled for brutalist (material honesty)
  const mainStyle = useMemo(
    () => (isExperimental || isBrutalist ? undefined : { filter: "url(#crt-barrel)" }),
    [isExperimental, isBrutalist]
  );

  /*
   * Shared page content — used in both modes.
   * In experimental mode, this is placed inside <canvas layoutsubtree>
   * so drawElementImage can capture it.
   */
  const pageContent = (
    <main
      id="crt-main"
      className="w-full h-screen overflow-hidden bg-transparent relative"
      style={mainStyle}
    >
      <IntroNode />
      <EditorialCanvas>
        <InteractiveGrid />
      </EditorialCanvas>
      <ChatInput />
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
          {isExperimental ? (
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
          )}
          <ProjectModalOverlay />
          <DebugPanel />
          <TimelineScrubber />
          <FluidBackground />

        </ReactFlowProvider>
      )}
    </>
  );
}
