// src/app/components/HeroCanvasClient.tsx

"use client";

import dynamic from "next/dynamic";

const HeroCanvas = dynamic(
  () => import("@/components/three/hero-canvas").then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-500 to-purple-600" />,
  }
);

export default function HeroCanvasClient() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    >
      <HeroCanvas />
    </div>
  );
}
