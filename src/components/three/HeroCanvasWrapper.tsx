"use client";

import dynamic from 'next/dynamic';
import type { VideoSlide } from "../../types/content";

// Use dynamic import with ssr: false inside this Client Component
const HeroCanvas = dynamic(() => import('./hero-canvas'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black -z-10" />
});

interface HeroCanvasWrapperProps {
  videoSlides?: VideoSlide[];
}

export default function HeroCanvasWrapper(props: HeroCanvasWrapperProps) {
  return <HeroCanvas {...props} />;
}
