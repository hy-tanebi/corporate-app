// src/app/components/HomeClient.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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

	// 第1テキストの表示タイミング（0-35%でフェードイン、35-50%で表示、50-65%でフェードアウト）
	const text1FadeIn = Math.max(0, Math.min(1, scrollProgress * 2.857)); // 0-35%
	const text1FadeOut = Math.max(
		0,
		Math.min(1, (0.65 - scrollProgress) * 6.667),
	); // 50-65%
	const text1Opacity = Math.min(text1FadeIn, text1FadeOut);

	// 第2テキストの表示タイミング（50-65%でフェードイン、65-80%で表示）
	const text2Opacity = Math.max(0, Math.min(1, (scrollProgress - 0.5) * 6.667));

	// ブログボタンの表示タイミング（第2段階: 25-50%、少し遅らせる）
	const buttonOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.3) * 4));

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
					transform: `translateY(-50%) translateX(${(1 - text1Opacity) * 20}px)`,
				}}
			>
				<h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
					デジタルの
					<br />
					<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
						困りごと
					</span>
					、
					<br />
					まるごと解決
				</h2>
				<p className="text-lg md:text-2xl text-white/70 leading-relaxed">
					Web / App / AI
					<br />
					<span className="text-white/90">
						中小企業のデジタル活用をトータルサポート
					</span>
				</p>
			</div>

			{/* 第2テキスト: 詳細メッセージ */}
			<div
				className="fixed left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out max-w-4xl"
				style={{
					opacity: text2Opacity,
					transform: `translateY(-50%) translateX(${(1 - text2Opacity) * 20}px)`,
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
					<span className="block">わかりやすく、成果につながるWeb。</span>
					<span className="block">使いやすく、業務を軽くするアプリ。</span>
					<span className="block">身近に活かせるAI。</span>
					<span className="block mt-4 text-white/90 font-medium">
						そのすべてを、一緒に実現します。
					</span>
				</p>
			</div>

			{/* ブログボタンを右の真ん中に固定配置 */}
			<div
				className="fixed right-8 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-1000 ease-out"
				style={{
					opacity: buttonOpacity,
					transform: `translateY(-50%) translateX(${
						(1 - buttonOpacity) * 20
					}px)`,
				}}
			>
				<Link
					className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 backdrop-blur text-white gap-2 hover:bg-white/20 font-medium text-base h-12 px-6 shadow-lg"
					href="/blog"
				>
					ブログを見る
				</Link>
			</div>

			{/* スクロール可能なコンテンツエリア（透明） */}
			<div className="w-full" style={{ height: "300vh" }}>
				{/* 空のコンテンツでスクロールを可能にする */}
			</div>
		</>
	);
}
