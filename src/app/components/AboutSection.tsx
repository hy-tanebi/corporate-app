"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// AboutThreeImage は @react-three/fiber / drei / three を静的に読む。
// AboutSection -> MissionSection -> HomeClient と静的につながっているため、
// このまま静的インポートするとトップの初期HTMLに three-vendor(生766KB)と
// react-reconciler(生107KB)が出力され、HeroCanvasWrapper の requestIdleCallback による
// 遅延が意味を持たなくなる。動的インポートにすることで初期のクリティカルパスから外す。
// この要素は absolute inset-0 で配置されるためレイアウトには影響しない。
const AboutThreeImage = dynamic(() => import("./AboutThreeImage"), {
	ssr: false,
	loading: () => <div className="absolute inset-0" aria-hidden />,
});

interface AboutSectionProps {
	transitionProgress?: number; // 0 -> 1 during Iris Close
}

export default function AboutSection({
	transitionProgress = 0,
}: AboutSectionProps) {
	const [scrollProgress, setScrollProgress] = useState(0);
	const sectionRef = useRef<HTMLDivElement>(null);

	// 画面サイズ
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// 画面幅のみ検知 (Resize logic for isMobile)
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		handleResize(); // Initial check
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const updateDimensions = () => {
				setDimensions({ width: window.innerWidth, height: window.innerHeight });
			};
			updateDimensions();
			window.addEventListener("resize", updateDimensions);
			return () => window.removeEventListener("resize", updateDimensions);
		}
	}, []);

	useEffect(() => {
		const scrollContainer = sectionRef.current?.closest(".mission-scrollbar");
		if (!scrollContainer) return;

		const handleScroll = () => {
			const section = sectionRef.current;
			if (!section) return;

			const rect = section.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			if (rect.top <= 0 && rect.bottom > windowHeight) {
				const sectionScrollProgress =
					Math.abs(rect.top) / (rect.height - windowHeight);
				setScrollProgress(Math.max(0, Math.min(1, sectionScrollProgress)));
			} else if (rect.top > 0) {
				setScrollProgress(0);
			}
		};

		scrollContainer.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => {
			scrollContainer.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Increase "Dwell" time by compressing entry animations into the start.
	// Height is now 800vh.

	// 1. テキストスクロール (0.0 - 0.15)
	const maxScrollProgress = 0.15;
	const horizontalProgress = Math.min(scrollProgress / maxScrollProgress, 1);
	const titleTranslateX = 100 - horizontalProgress * 250;

	// 2. 円形ワイプ (0.15 - 0.35)
	const circleStart = 0.15;
	const circleEnd = 0.35;
	const rawCircleProgress =
		(scrollProgress - circleStart) / (circleEnd - circleStart);
	const circleProgress = Math.max(0, Math.min(1, rawCircleProgress));

	// Determine maxRadius for circular wipe
	const maxRadius =
		Math.sqrt(dimensions.width ** 2 + dimensions.height ** 2) * 1.2;
	const circleRadius = circleProgress * maxRadius;

	// 3. プロフィールコンテンツ表示 (0.3 - 0.45)
	// Finish early to allow long read time
	const contentStart = 0.3;
	const contentEnd = 0.45;
	const rawContentProgress =
		(scrollProgress - contentStart) / (contentEnd - contentStart);
	const contentOpacity = Math.max(0, Math.min(1, rawContentProgress));

	// "ABOUT US" テキスト用
	const repeatCount = 10;

	// 4. ダークネス効果 (0.55 - 0.95)
	// コンテンツが表示された後、スクロールに応じて画面を暗くしていく
	// Start earlier (0.55) so it's clearly visible before Iris starts (at ~0.6)
	const darknessStart = 0.55;
	const darknessEnd = 0.95;
	const rawDarkness =
		(scrollProgress - darknessStart) / (darknessEnd - darknessStart);
	const darknessOpacity = Math.max(0, Math.min(1, rawDarkness)) * 0.7; // 最大0.7（少し明るさを残す）

	// タイトル制御 (About)
	useEffect(() => {
		if (contentOpacity > 0) {
			document.title = "ABOUT ME | TANEBI CREATIVE タネビ クリエイティブ";
		}
	}, [contentOpacity]);

	// Parallax Scale Removed: Content size stays constant.

	// === Mask & Spaceship Logic (Close then Spawn) ===
	// === Mask & Spaceship Logic (Close then Spawn) ===
	// 1. Shrink Phase (0 -> 0.8): Close over a balanced duration
	// Use 0.8 so it closes exactly when Darkness effect (ends at ~2.15h from bottom) finishes.
	const shrinkPhase = Math.min(transitionProgress / 0.8, 1);
	// 半径をマイナスまで行かせることで、ぼかし(+20%)を含めて完全に消滅させる
	// 150 -> -25 (Range 175)
	const maskRadius = (1 - shrinkPhase) * 175 - 25;

	const maskStyle = {
		maskImage: `radial-gradient(circle at 50% 50%, black ${maskRadius}%, transparent ${maskRadius + 20}%)`,
		WebkitMaskImage: `radial-gradient(circle at 50% 50%, black ${maskRadius}%, transparent ${maskRadius + 20}%)`,
	};

	return (
		<section
			id="about"
			ref={sectionRef}
			className="w-full relative"
			style={{
				height: isMobile ? "500vh" : "800vh", // Extended height for time earning (Aggressively reduced for mobile)
			}}
		>
			{/* SVGフィルター定義 (不可視) */}
			<svg style={{ display: "none" }} aria-hidden="true">
				<title>Distortion Filter</title>
				<defs>
					<filter id="distortion">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.01 0.003"
							numOctaves="5"
							result="nose"
						/>
						<feDisplacementMap
							in="SourceGraphic"
							in2="nose"
							scale="40"
							xChannelSelector="R"
							yChannelSelector="G"
						/>
					</filter>
				</defs>
			</svg>

			{/*
        Sticky Container
        Removed Parallax Scale (content size stays constant)
        Apply Mask here for Viewport Centering
      */}
			<div
				className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-transparent text-black"
				style={{
					...maskStyle, // Apply Iris Mask
				}}
			>
				{/* 横スクロールテキスト (Black text) */}
				<div
					className="absolute inset-0 flex items-center whitespace-nowrap z-10 pointer-events-none"
					style={{
						transform: `translateX(${titleTranslateX}vw)`,
					}}
					aria-hidden="true"
				>
					{Array.from({ length: repeatCount }).map((_, i) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: Static marquee text
							key={i}
							className="text-[8vw] md:text-[7vw] font-bold mx-2 md:mx-8"
							style={{ fontFamily: "'Inter', sans-serif" }}
						>
							ABOUT ME
						</span>
					))}
				</div>

				{/* 円形ワイプ用レイヤー (Pale Green Circle) */}
				<div
					className="absolute z-10 rounded-full bg-[#C8D5CE] pointer-events-none"
					style={{
						left: dimensions.width,
						top: dimensions.height / 2,
						width: circleRadius * 2,
						height: circleRadius * 2,
						transform: "translate(-50%, -50%)",
					}}
				/>

				{/* プロフィール画像 (Full Screen Background) */}
				{/* containerの外に出して全画面表示にする */}
				{/* z-20: 白い円(z-10)より上、コンテンツコンテナ(z-30)より下に配置 */}

				<div
					className="absolute inset-0 z-20 w-full h-full overflow-hidden"
					style={{
						opacity: contentOpacity,
						pointerEvents: contentOpacity > 0.5 ? "auto" : "none",
					}}
				>
					<AboutThreeImage
						imageSrc={isMobile ? "/images/about-sp.webp" : "/images/about.webp"}
						scale={isMobile ? [1.15, 1.0] : [1.0, 1.0]}
						offset={isMobile ? [-0.15, 0] : [0, 0]}
					/>
					{/* ダークネスオーバーレイ */}
					<div
						className="absolute inset-0 z-30 pointer-events-none bg-black transition-opacity duration-100 ease-out"
						style={{ opacity: darknessOpacity }}
					/>
				</div>

				{/* プロフィールコンテンツ (Text Overlay) */}
				{/* container内でテキスト位置を制御 */}
				<div
					className="absolute inset-0 z-40 w-full flex flex-col md:flex-row items-center justify-center pointer-events-none"
					style={{
						opacity: contentOpacity,
					}}
				>
					{/* 全体レイアウト: 画像(背景) + テキスト(右下オーバーレイ) */}
					<div className="w-full h-full relative">
						{/* 右下: テキストエリア (ポスター風タイポグラフィ) */}
						{/* 右下: テキストエリア (ポスター風タイポグラフィ) */}
						<div className="absolute bottom-0 right-0 z-10 w-full md:w-auto md:max-w-[70%] p-8 md:p-12 pr-2 md:pr-[calc(3rem+80px)] pb-16 flex flex-col items-end text-black pointer-events-none">
							{/* Organization */}
							<div
								className="mb-6 text-right"
								style={{ fontFamily: "'Inter', sans-serif" }}
							>
								<h2 className="text-xl md:text-3xl font-bold tracking-widest text-[#eae0cc] mix-blend-difference mb-1">
									TANEBI CREATIVE
								</h2>
								<p className="text-xs md:text-sm text-gray-400 font-medium tracking-wide">
									Web / App / AI Development & DX Support
								</p>
							</div>

							{/* Person */}
							<div
								className="mb-8 text-right"
								style={{ fontFamily: "'Inter', sans-serif" }}
							>
								<h3 className="text-lg md:text-2xl font-bold tracking-tight text-[#eae0cc] mix-blend-difference">
									Hayato Sugawara
								</h3>
								<p className="text-xs md:text-sm text-gray-400 tracking-wider mt-1">
									Technical Director / Developer
								</p>
							</div>

							<div
								className="max-w-lg space-y-6 text-sm md:text-base font-medium tracking-wide leading-relaxed text-right text-white/90 mix-blend-difference"
								style={{ fontFamily: "'Inter', sans-serif", color: "#F1F3F2" }}
							>
								<p>
									Webと技術で、前に進む仕組みを。
									<br />
									制作・開発・AI活用を通じて、
									<br />
									事業や現場の課題解決を支援します。
									<br />
									<br />
									実務で培った設計と実装をもとに、
									<br />
									使われ続けるWebと仕組みをつくります。
								</p>
								<div className="mt-6 flex flex-col items-end gap-1 text-xs md:text-sm text-[#EAF6F0] normal-case font-bold tracking-wider">
									<p>Web・ECサイト／Webアプリ開発</p>
									<p>AI活用・業務効率化支援</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
