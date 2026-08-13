"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useHeroState } from "../../contexts/HeroStateContext";
import type { VideoSlide } from "../../types/content";

// Dynamically import HeroCanvas with SSR disabled
const HeroCanvas = dynamic(() => import("./hero-canvas"), {
	ssr: false,
});

interface HeroCanvasWrapperProps {
	videoSlides?: VideoSlide[];
}

export default function HeroCanvasWrapper({
	videoSlides,
}: HeroCanvasWrapperProps) {
	const heroState = useHeroState();
	const [ready, setReady] = useState(false);

	// 初期ロード（LoadingScreen等）が落ち着いてからCanvasをマウント
	// これによりThree.js初期化がメインスレッドの初期処理と競合しなくなり、TBTが改善
	useEffect(() => {
		if ("requestIdleCallback" in window) {
			const id = window.requestIdleCallback(() => setReady(true));
			return () => window.cancelIdleCallback(id);
		}
		const timer = setTimeout(() => setReady(true), 100);
		return () => clearTimeout(timer);
	}, []);

	if (!ready) return null;

	return <HeroCanvas videoSlides={videoSlides} heroState={heroState} />;
}
