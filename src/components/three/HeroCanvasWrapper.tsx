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

	// 初期ロード（LoadingScreen等）が落ち着いてからCanvasをマウントする。
	// これはあくまでマウントの遅延であり、チャンクのダウンロード自体は止められない。
	// トップの初期HTMLに three-vendor が出力される原因は
	// AboutSection -> AboutThreeImage の静的インポート側にある（このファイルではない）。
	// 動的インポートを試したが、Canvas が描画されず About の背景が白くなるため戻した。
	// （2026-08 の調査。詳細は docs/superpowers/specs/2026-08-12-performance-fixes-design.md）
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
