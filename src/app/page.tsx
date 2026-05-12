"use client";

import dynamic from "next/dynamic";
import { Preloader } from '@/core/ui/Preloader';

const EditorialCanvas = dynamic(() => import("@/features/canvas/components/EditorialCanvas"), {
  ssr: false,
  loading: () => <Preloader />,
});

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <EditorialCanvas />
    </main>
  );
}
