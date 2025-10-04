// src/app/components/HomeClient.tsx
"use client";

import { useState, useEffect } from "react";
import { HeroActions } from "@/components/ui/hero-actions";
import { HeroActionButton } from "@/components/ui/hero-action-button";

export default function HomeClient() {
	const [scrollProgress, setScrollProgress] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const scrolled = scrollTop / docHeight;
			setScrollProgress(Math.min(scrolled, 1));
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// 黒い円の開始タイミング（hero-canvas.tsxのCIRCLE_SCROLL_STARTと同期）
	const CIRCLE_START = 0.86;

	// 第1テキストの表示タイミング（0-30%でフェードイン、30-45%で表示、45-55%でフェードアウト）
	const text1FadeIn = Math.max(0, Math.min(1, scrollProgress * 3.333)); // 0-30%
	const text1FadeOut = Math.max(0, Math.min(1, (0.55 - scrollProgress) * 10)); // 45-55%
	const text1Opacity = Math.min(text1FadeIn, text1FadeOut);

	// 第2テキストの表示タイミング（60-70%でフェードイン、70-85%で表示、黒い円開始で消える）
	const text2FadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.6) * 10)); // 60-70%
	const text2FadeOut = Math.max(
		0,
		Math.min(1, (CIRCLE_START - scrollProgress) * 20),
	); // 黒い円開始で急速にフェードアウト
	const text2Opacity = Math.min(text2FadeIn, text2FadeOut);

	return (
		<>
			{/* 屋号を左上に固定配置 */}
			<div className="fixed top-8 left-8 z-10">
				<h1 className="text-2xl md:text-3xl font-bold text-white">
					TANEBI CREATIVE
				</h1>
			</div>

			{/* 第1テキスト: 最初のキャッチコピー */}
			<div
				className="fixed left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out max-w-4xl"
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

			{/* 第2テキスト: 詳細メッセージ */}
			<div
				className="fixed left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out max-w-4xl"
				style={{
					opacity: text2Opacity,
					transform: `translateY(-50%) translateX(${
						(1 - text2Opacity) * -20
					}px)`,
				}}
			>
				<h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
					中小企業が抱える
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
					<span className="block">わかりやすく、運用まで一緒に支えるWeb。</span>
					<span className="block">
						使いやすく、日々の業務を軽くするアプリ。
					</span>
					<span className="block">身近に活かせるAI。</span>
					<span className="block mt-4 text-white/90 font-medium">
						そのすべてを、伴走しながら実現します。
					</span>
				</p>
			</div>

			{/* アクションボタン群 */}
			<HeroActions scrollProgress={scrollProgress} position="right">
				<HeroActionButton href="/blog" label="ブログを見る" variant="primary" />
				<HeroActionButton href="/about" label="About" variant="secondary" />
				<HeroActionButton
					href="/contact"
					label="お問い合わせ"
					variant="secondary"
				/>
			</HeroActions>

			{/* スクロール可能なコンテンツエリア（透明） */}
			<div className="w-full" style={{ height: "300vh" }}>
				{/* 空のコンテンツでスクロールを可能にする */}
			</div>
		</>
	);
}
