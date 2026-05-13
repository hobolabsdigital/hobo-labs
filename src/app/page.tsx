"use client";

import dynamic from "next/dynamic";
import { Preloader } from '@/core/ui/Preloader';
import { ReactFlowProvider } from '@xyflow/react';

// UI Components
import { ChatInput } from '@/features/editor-chat/components/ChatInput';
import { DebugPanel } from '@/features/canvas/components/DebugPanel';
import { TimelineScrubber } from '@/features/timeline/components/TimelineScrubber';
import { FluidBackground } from '@/features/fluid-bg/components/FluidBackground';
import { InteractiveGrid } from '@/core/ui/InteractiveGrid';
import { ThemeToggle } from '@/core/ui/ThemeToggle';
import { Swarm } from '@/features/swarm/components/Swarm';
import { SwarmTerminal } from '@/features/swarm/components/SwarmTerminal';

const EditorialCanvas = dynamic(() => import("@/features/canvas/components/EditorialCanvas"), {
  ssr: false,
  loading: () => <Preloader />,
});

import { IntroNode } from '@/features/canvas/components/nodes/IntroNode';

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-white dark:bg-black relative">
      <IntroNode />
      <ReactFlowProvider>
        <EditorialCanvas>
          <InteractiveGrid gap={24} size={2} color="var(--grid-color)" repelRadius={150} repelStrength={15} />
        </EditorialCanvas>
        
        <DebugPanel />
        <TimelineScrubber />
        <FluidBackground />
        <ThemeToggle />
        <ChatInput />
      </ReactFlowProvider>
    </main>
  );
}
