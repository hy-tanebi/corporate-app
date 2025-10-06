// src/app/components/HomeClient.tsx
"use client";

import { useState, useEffect } from "react";
import { HeroActions } from "@/components/ui/hero-actions";
import { HeroActionButton } from "@/components/ui/hero-action-button";
import MissionSection from "./MissionSection";

export default function HomeClient() {
	const [scrollProgress, setScrollProgress] = useState(0);
	const [isCircleFullyExpanded, setIsCircleFullyExpanded] = useState(false);

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

	// 第2テキストの表示タイミング（60-65%でフェードイン、65-75%で表示、75-80%でフェードアウト）
	const text2FadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.6) * 20)); // 60-65%
	const text2FadeOut = Math.max(0, Math.min(1, (0.8 - scrollProgress) * 20)); // 75-80%
	const text2Opacity = Math.min(text2FadeIn, text2FadeOut);

	// 第3テキストの表示タイミング（80-82%でフェードイン、82-85%で表示、黒い円開始で消える）
	const text3FadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.8) * 50)); // 80-82%
	const text3FadeOut = Math.max(
		0,
		Math.min(1, (CIRCLE_START - scrollProgress) * 20),
	); // 黒い円開始で急速にフェードアウト
	const text3Opacity = Math.min(text3FadeIn, text3FadeOut);

	return (
		<>
			{/* 屋号を左上に固定配置 */}
			<div className="fixed top-8 left-8 z-10 pointer-events-none">
				<h1 className="text-2xl md:text-3xl font-bold text-white">
					TANEBI CREATIVE
				</h1>
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
					<h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
						デジタルの
						<br />
						<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
							困りごとに
						</span>
						<br />
						寄り添いサポート
					</h2>
					<p className="text-lg md:text-2xl text-white/70 leading-relaxed">
						Web / App / AI
						<br />
						<span className="text-white/90">次の時代の表現を、ともに創る</span>
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
					<h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
						現場が抱える
						<br />
						デジタルの悩みを、
						<br />
						もっと
						<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
							シンプル
						</span>
						に。
					</h2>
					<p className="text-base md:text-xl text-white/80 leading-relaxed space-y-2">
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

			{/* 第3テキスト: CTAメッセージ */}
			{!isCircleExpanded && (
				<div
					className="fixed left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out max-w-3xl pointer-events-none"
					style={{
						opacity: text3Opacity,
						transform: `translateY(-50%) translateX(${
							(1 - text3Opacity) * -20
						}px)`,
					}}
				>
					<h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
						あなたの
						<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
							"困った"
						</span>
						を、
						<br />
						今すぐ一緒にほどきませんか？
					</h2>
					<p className="text-xl md:text-2xl text-white/90 font-medium">
						まずはご相談ください。
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
			/>

			{/* スクロール可能なコンテンツエリア（透明） */}
			<div className="w-full pointer-events-none" style={{ height: "1000vh" }}>
				{/* 空のコンテンツでスクロールを可能にする */}
			</div>
		</>
	);
}
