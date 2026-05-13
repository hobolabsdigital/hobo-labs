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

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <ReactFlowProvider>
        <EditorialCanvas>
          <InteractiveGrid gap={24} size={2} color="var(--grid-color)" repelRadius={150} repelStrength={15} />
        </EditorialCanvas>
        
        {/* Swarm disabled temporarily to save GPU 
        <Swarm count={3} type="worker" />
        <Swarm count={3} type="soldier" />
        <SwarmTerminal />
        */}
        <DebugPanel />
        <TimelineScrubber />
        <FluidBackground />
        <ThemeToggle />
        <ChatInput />
      </ReactFlowProvider>
    </main>
  );
}
