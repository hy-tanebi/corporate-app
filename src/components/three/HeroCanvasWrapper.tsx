"use client";

import dynamic from "next/dynamic";
import { useHeroState } from "../../contexts/HeroStateContext";
import type { VideoSlide } from "../../types/content";

// Dynamically import HeroCanvas with SSR disabled
const HeroCanvas = dynamic(() => import("./hero-canvas"), {
	ssr: false,
});

interface HeroCanvasWrapperProps {
	// children removed from here as they are now rendered by HeroCanvasWithCMS
	videoSlides?: VideoSlide[];
}

export default function HeroCanvasWrapper({
	videoSlides,
}: HeroCanvasWrapperProps) {
	// Get state from the Provider (which must be higher up in the tree)
	const heroState = useHeroState();

	return <HeroCanvas videoSlides={videoSlides} heroState={heroState} />;
}
