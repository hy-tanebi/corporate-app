// src/app/components/HeroCanvasClient.tsx
"use client";

import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("@/components/three/hero-canvas"), {
  ssr: false,
});

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
