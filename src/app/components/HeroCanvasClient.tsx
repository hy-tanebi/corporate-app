// src/app/components/HeroCanvasClient.tsx

"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

const HeroCanvas = dynamic(
  () =>
    import("@/components/three/hero-canvas").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-500 to-purple-600" />
    ),
  }
);

interface HeroCanvasClientProps {
  children: ReactNode;
}

export default function HeroCanvasClient({ children }: HeroCanvasClientProps) {
  return <HeroCanvas>{children}</HeroCanvas>;
}
