"use client";

import dynamic from "next/dynamic";
import { Preloader } from "@/components/Preloader";

const EditorialCanvas = dynamic(() => import("@/components/EditorialCanvas"), {
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
