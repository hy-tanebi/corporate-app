// src/app/components/HomeClient.tsx
"use client";

import { useState, useEffect } from "react";
import { HeroActions } from "@/components/ui/hero-actions";
import { HeroActionButton } from "@/components/ui/hero-action-button";
import { AudioControlButton } from "@/components/ui/audio-control-button";
import MissionSection from "./MissionSection";
import ContactSection from "./ContactSection";

export default function HomeClient() {
	const [scrollProgress, setScrollProgress] = useState(0);
	const [isCircleFullyExpanded, setIsCircleFullyExpanded] = useState(false);
	const [missionSectionProgress, setMissionSectionProgress] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const scrolled = scrollTop / docHeight;
			setScrollProgress(scrolled); // 1以上も許可（MISSIONセクションで100%超のスクロールを使用）
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// 黒い円の開始タイミング（hero-canvas.tsxのCIRCLE_SCROLL_STARTと同期）
	const CIRCLE_START = 0.86;
	const CIRCLE_SCROLL_END = 0.95; // hero-canvas.tsxのCIRCLE_SCROLL_END
	const CIRCLE_ACTUAL_END = 0.98; // 慣性を考慮した実際の完全拡大タイミング（CIRCLE_SMOOTH_EXPAND = 0.25を考慮）

	// 黒い円が完全に拡大したらフラグを立てる（戻る時はfalseに戻す）
	useEffect(() => {
		if (scrollProgress >= CIRCLE_ACTUAL_END) {
			if (!isCircleFullyExpanded) {
				setIsCircleFullyExpanded(true);
				console.log("Circle fully expanded at scrollProgress:", scrollProgress);
			}
		} else {
			// スクロールを戻して黒い円が縮小したらフラグをfalseに戻す
			if (isCircleFullyExpanded) {
				setIsCircleFullyExpanded(false);
				console.log("Circle shrinking at scrollProgress:", scrollProgress);
			}
		}
	}, [scrollProgress, CIRCLE_ACTUAL_END, isCircleFullyExpanded]);

	// 黒い円が拡大中はすべてのUI要素を非表示
	const isCircleExpanded = scrollProgress >= CIRCLE_SCROLL_END;

	// 第1テキストの表示タイミング（0-30%でフェードイン、30-45%で表示、45-55%でフェードアウト）
	const text1FadeIn = Math.max(0, Math.min(1, scrollProgress * 3.333)); // 0-30%
	const text1FadeOut = Math.max(0, Math.min(1, (0.55 - scrollProgress) * 10)); // 45-55%
	const text1Opacity = Math.min(text1FadeIn, text1FadeOut);

	// 第2テキストの表示タイミング（60-65%でフェードイン、65-82%で表示、82-86%でフェードアウト）
	const text2FadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.6) * 20)); // 60-65%
	const text2FadeOut = Math.max(0, Math.min(1, (0.86 - scrollProgress) * 25)); // 82-86%
	const text2Opacity = Math.min(text2FadeIn, text2FadeOut);

	return (
		<>
			{/* 屋号とサウンドコントロールを左上に固定配置 */}
			<div className="fixed top-8 left-8 z-10 flex items-center gap-4">
				<h1 className="text-2xl md:text-3xl font-bold text-white pointer-events-none">
					TANEBI CREATIVE
				</h1>
				<div className="pointer-events-auto">
					<AudioControlButton />
				</div>
			</div>

			{/* 第1テキスト: 最初のキャッチコピー */}
			{!isCircleExpanded && (
				<div
					className="fixed left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out max-w-4xl pointer-events-none"
					style={{
						opacity: text1Opacity,
						transform: `translateY(-50%) translateX(${
							(1 - text1Opacity) * -20
						}px)`,
					}}
				>
					<h2
						className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
						style={{
							textShadow:
								"0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
						}}
					>
						WEBの
						<br />
						<span
							className="font-extrabold"
							style={{
								color: "#60d5fa",
							}}
						>
							困りごとに
						</span>
						<br />
						寄り添いサポート
					</h2>
					<p
						className="text-base md:text-xl text-white/80 leading-relaxed space-y-2"
						style={{
							textShadow:
								"0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
						}}
					>
						<span className="block">ホームページ制作 / ECサイト制作</span>
						<span className="block">アプリ制作 / AI業務効率化 /</span>
						<span className="block">時代はSEOからLLMOへ</span>
						<span className="block">課題解決に向けてAI時代の最適な制作を</span>
					</p>
				</div>
			)}

			{/* 第2テキスト: 詳細メッセージ */}
			{!isCircleExpanded && (
				<div
					className="fixed left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out max-w-4xl pointer-events-none"
					style={{
						opacity: text2Opacity,
						transform: `translateY(-50%) translateX(${
							(1 - text2Opacity) * -20
						}px)`,
					}}
				>
					<h2
						className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
						style={{
							textShadow:
								"0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
						}}
					>
						現場が抱える
						<br />
						デジタルの悩みを、
						<br />
						もっと
						<span
							className="font-extrabold"
							style={{
								color: "#fbbf24",
							}}
						>
							シンプル
						</span>
						に。
					</h2>
					<p
						className="text-base md:text-xl text-white/80 leading-relaxed space-y-2"
						style={{
							textShadow:
								"0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
						}}
					>
						<span className="block">
							わかりやすく、運用まで一緒に支えるWeb。
						</span>
						<span className="block">
							使いやすく、日々の業務を軽くするアプリ。
						</span>
						<span className="block">身近に活かせるAI。</span>
						<span className="block mt-4 text-white/90 font-medium">
							そのすべてを、伴走しながら実現します。
						</span>
					</p>
				</div>
			)}

			{/* アクションボタン群 */}
			{!isCircleExpanded && (
				<HeroActions scrollProgress={scrollProgress} position="right">
					<HeroActionButton
						href="/blog"
						label="ブログを見る"
						variant="primary"
					/>
					<HeroActionButton href="/about" label="About" variant="secondary" />
					<HeroActionButton
						href="/contact"
						label="お問い合わせ"
						variant="secondary"
					/>
				</HeroActions>
			)}

			{/* MISSIONセクション */}
			<MissionSection
				scrollProgress={scrollProgress}
				isCircleFullyExpanded={isCircleFullyExpanded}
				onProgressChange={setMissionSectionProgress}
			/>

			{/* CONTACTセクション */}
			<ContactSection
				scrollProgress={scrollProgress}
				missionSectionProgress={missionSectionProgress}
			/>

			{/* スクロール可能なコンテンツエリア（透明） */}
			<div className="w-full pointer-events-none" style={{ height: "1200vh" }}>
				{/* 空のコンテンツでスクロールを可能にする */}
			</div>
		</>
	);
}
