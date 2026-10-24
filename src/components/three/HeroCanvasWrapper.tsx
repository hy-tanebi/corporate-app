"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useHeroState } from "../../contexts/HeroStateContext";
import type { VideoSlide } from "../../types/content";

// Canvas が出るまでの間、body の白が見えないように宇宙空間と同じ黒で埋める
// （Canvas と同じ位置・重なり順。描画開始と同時に Canvas が上書きする）
const CanvasPlaceholder = () => (
	<div
		aria-hidden="true"
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			width: "100vw",
			height: "100dvh",
			zIndex: 0,
			background: "black",
		}}
	/>
);

// Dynamically import HeroCanvas with SSR disabled
const HeroCanvas = dynamic(() => import("./hero-canvas"), {
	ssr: false,
	loading: CanvasPlaceholder,
});

// ブラウザが忙しくても、この時間を過ぎたら Canvas をマウントする。
// 上限なしだと拡張機能の多いブラウザで開始が大きく遅れていた（2026-10 の調査）
const IDLE_TIMEOUT_MS = 1000;

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
			const id = window.requestIdleCallback(() => setReady(true), {
				timeout: IDLE_TIMEOUT_MS,
			});
			return () => window.cancelIdleCallback(id);
		}
		const timer = setTimeout(() => setReady(true), 100);
		return () => clearTimeout(timer);
	}, []);

	if (!ready) return <CanvasPlaceholder />;

	return <HeroCanvas videoSlides={videoSlides} heroState={heroState} />;
}
