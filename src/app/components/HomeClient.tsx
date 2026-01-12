// src/app/components/HomeClient.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { SidebarMenu } from "@/components/ui/sidebar-menu";
import { AudioControlButton } from "@/components/ui/audio-control-button";
import MissionSection, { type MissionSidebarHandle } from "./MissionSection";
import ContactSection from "./ContactSection";
import { useHeroState } from "@/contexts/HeroStateContext";

export default function HomeClient() {
	// Optimization: Removed scrollProgress state to prevent re-renders
	const [isCircleFullyExpanded, setIsCircleFullyExpanded] = useState(false);
	// Optimization: Removed missionSectionProgress state as it was causing re-renders and passed to an unused component
	const [isMobile, setIsMobile] = useState(false);
	const missionRef = useRef<MissionSidebarHandle>(null);
	const { setShouldSnapAnimation } = useHeroState();

	// Refs for direct DOM manipulation
	const text1Ref = useRef<HTMLDivElement>(null);
	const text2Ref = useRef<HTMLDivElement>(null);
	// Keep track of scroll progress in a ref for logic that needs it without re-rendering
	const scrollProgressRef = useRef(0);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const handleNavigate = (path: string) => {
		if (path === "/about") {
			// AboutセクションはMissionSectionの中にあるため、
			// まずはメインのスクロールをMissionSectionが表示される位置（＝一番下）まで持っていく
			window.scrollTo({
				top: document.documentElement.scrollHeight,
				behavior: "smooth",
			});

			// その後、MissionSection内部でAboutまでスクロール
			// 少し遅延させて、メインスクロールが始まった後に実行（あるいは完了後が良いが、並行でも動くはず）
			setTimeout(() => {
				missionRef.current?.scrollToAbout();
			}, 500);
		} else if (path === "/contact") {
			window.scrollTo({
				top: document.documentElement.scrollHeight,
				behavior: "smooth",
			});
			// 遅延なしで即時実行（MissionSection側でフラグ制御による即時表示を行う）
			missionRef.current?.scrollToContact();
		} else if (path === "/mission") {
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			// MissionSectionの定数と合わせる (Mobile: 0.85, Desktop: 0.94)
			// 少し余裕を持たせて、アニメーションが開始した直後の状態(0.15付近)にするなら
			// Start + (End - Start) * 0.15 くらいが適切だが、
			// シンプルにセクション開始位置(Start)へ遷移させる
			// const SECTION_START = isMobile ? 0.85 : 0.94;
			// 0.95進んだ位置を計算 (TECHNICAL PARTNERが完全に横に並んだ状態)
			const SECTION_END = 0.999;
			// New mapping adjustment:
			// The video section is now much longer, pushing the Mission/About transition to the very end.
			// Target near the end of the scroll range.
			const targetScroll = docHeight * SECTION_END;

			// ミッション表示に必要なフラグを強制的にONにする
			setIsCircleFullyExpanded(true);

			// ★アニメーションのスムージングを無効化（スナップ）
			setShouldSnapAnimation(true);

			window.scrollTo({
				top: targetScroll,
				behavior: "auto",
			});

			// 即座に実行してグレー背景などの状態をリセット
			missionRef.current?.scrollToMission();

			// 少し遅れてスナップフラグを解除
			setTimeout(() => {
				setShouldSnapAnimation(false);
			}, 100);
		} else if (path === "/") {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	};

	// 黒い円の開始タイミング（hero-canvas.tsxのCIRCLE_SCROLL_STARTと同期）
	const CIRCLE_START = 0.92;
	const CIRCLE_SCROLL_END = 0.97; // hero-canvas.tsxのCIRCLE_SCROLL_END
	const CIRCLE_ACTUAL_END = 0.97; // 完全に拡大したタイミング (0.99 -> 0.97)

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const scrolled = scrollTop / docHeight;
			scrollProgressRef.current = scrolled;

			// --- Logic for setIsCircleFullyExpanded (State) ---
			// Only update state when threshold is crossed
			if (scrolled >= CIRCLE_ACTUAL_END) {
				setIsCircleFullyExpanded((prev) => {
					if (!prev) {
						console.log("Circle fully expanded at scrollProgress:", scrolled);
						return true;
					}
					return prev;
				});
			} else if (scrolled < CIRCLE_START) {
				setIsCircleFullyExpanded((prev) => {
					if (prev) {
						console.log("Circle shrinking at scrollProgress:", scrolled);
						return false;
					}
					return prev;
				});
			}

			// --- Setup for Animations ---
			const isCircleExpanded = scrolled >= CIRCLE_SCROLL_END;

			// --- Text 1 Animation (Intro 0-18%) ---
			// Fade in 0-5%, Visible 5-13%, Fade out 13-18%
			const text1FadeIn = Math.max(0, Math.min(1, scrolled * 20)); // 0-5% in
			const text1FadeOut = Math.max(0, Math.min(1, (0.18 - scrolled) * 20)); // 13-18% out
			const text1Opacity = Math.min(text1FadeIn, text1FadeOut);

			if (text1Ref.current) {
				const opacity = isCircleExpanded ? 0 : text1Opacity;
				text1Ref.current.style.opacity = opacity.toString();

				// Transform logic
				if (isMobile) {
					const tx = (1 - opacity) * -20;
					text1Ref.current.style.transform = `translateX(${tx}px)`;
				} else {
					const tx = (1 - opacity) * -20;
					text1Ref.current.style.transform = `translateY(-50%) translateX(${tx}px)`;
				}
			}

			// --- Text 2 Animation (Video 18-80%) ---
			// Fade in 18-23% (Sync with Video Start 0.18)
			const text2FadeIn = Math.max(0, Math.min(1, (scrolled - 0.18) * 20)); // 18-23% in
			const text2FadeOut = Math.max(0, Math.min(1, (0.8 - scrolled) * 25)); // 76-80% out
			const text2Opacity = Math.min(text2FadeIn, text2FadeOut);

			if (text2Ref.current) {
				const opacity = isCircleExpanded ? 0 : text2Opacity;
				text2Ref.current.style.opacity = opacity.toString();

				// Transform logic
				if (isMobile) {
					const tx = (1 - opacity) * -20;
					text2Ref.current.style.transform = `translateX(${tx}px)`;
				} else {
					const tx = (1 - opacity) * -20;
					text2Ref.current.style.transform = `translateY(-50%) translateX(${tx}px)`;
				}
			}

			// --- Title Logic ---
			if (
				scrolled < 0.8 &&
				document.title &&
				!document.title.startsWith("TANEBI")
			) {
				document.title = "TANEBI CREATIVE タネビ クリエイティブ";
			}
		};

		window.addEventListener("scroll", handleScroll);
		// Initial call
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, [isMobile]); // Re-bind if isMobile changes

	return (
		<main>
			{/* 屋号とサウンドコントロールを左上に固定配置 */}
			<div className="fixed top-8 left-6 md:left-8 z-10 flex items-center gap-4">
				<h1 className="text-2xl md:text-[28px] font-bold text-white pointer-events-none">
					TANEBI CREATIVE
				</h1>
				<div className="pointer-events-auto hidden">
					<AudioControlButton />
				</div>
			</div>

			{/* 第1テキスト: 最初のキャッチコピー */}
			<div
				ref={text1Ref}
				className={`fixed z-10 transition-transform duration-75 ease-out md:max-w-4xl ${
					isMobile
						? "left-0 top-0 w-full h-[100dvh] pointer-events-none"
						: "left-8 md:left-16 top-1/2 pointer-events-none"
				}`}
				// Style will be controlled by JS ref
				style={{ opacity: 0 }}
			>
				<div
					className={
						isMobile ? "w-full h-full flex flex-col justify-between px-6" : ""
					}
					style={{
						paddingTop: isMobile
							? "calc(env(safe-area-inset-top) + 5rem)"
							: undefined,
						paddingBottom: isMobile
							? "calc(env(safe-area-inset-bottom) + 3rem)"
							: undefined,
					}}
				>
					<h2
						className="max-[375px]:text-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight md:mb-8"
						style={{
							textShadow: isMobile
								? "none"
								: "0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
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
						className="max-[375px]:text-sm text-base md:text-xl font-bold text-white/80 leading-relaxed space-y-1 md:space-y-2 mb-4 md:mb-0"
						style={{
							textShadow: isMobile
								? "none"
								: "0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
						}}
					>
						<span className="block">ホームページ制作 / ECサイト制作</span>
						<span className="block">アプリ制作 / AI業務効率化 /</span>
						<span className="block">時代はSEOからAIOへ</span>
						<span className="block">課題解決に向けてAI時代の最適な制作を</span>
					</p>
				</div>
			</div>

			{/* 第2テキスト: 詳細メッセージ */}
			<div
				ref={text2Ref}
				className={`fixed z-10 transition-transform duration-75 ease-out md:max-w-4xl ${
					isMobile
						? "left-0 top-0 w-full h-[100dvh] pointer-events-none"
						: "left-8 md:left-16 top-1/2 pointer-events-none"
				}`}
				style={{ opacity: 0 }}
			>
				<div
					className={
						isMobile ? "w-full h-full flex flex-col justify-between px-6" : ""
					}
					style={{
						paddingTop: isMobile
							? "calc(env(safe-area-inset-top) + 5rem)"
							: undefined,
						paddingBottom: isMobile
							? "calc(env(safe-area-inset-bottom) + 3rem)"
							: undefined,
					}}
				>
					<h2
						className="max-[375px]:text-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight md:mb-8"
						style={{
							textShadow: isMobile
								? "none"
								: "0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
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
								color: "#fcd34d",
							}}
						>
							シンプル
						</span>
						に。
					</h2>
					<p
						className="max-[375px]:text-sm text-base md:text-xl font-bold text-white/80 leading-relaxed space-y-1 md:space-y-2 mb-4 md:mb-0"
						style={{
							textShadow: isMobile
								? "none"
								: "0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)",
						}}
					>
						<span className="block">
							わかりやすく、運用まで一緒に支えるWeb。
						</span>
						<span className="block">
							使いやすく、日々の業務を軽くするアプリ。
						</span>
						<span className="block">身近に活かせるAI。</span>
						<span className="block mt-4 text-white/90">
							そのすべてを、伴走しながら実現します。
						</span>
					</p>
				</div>
			</div>

			{/* 通知テキスト等はそのまま、ボタン群を削除してサイドバーメニューを追加 */}
			<SidebarMenu onNavigate={handleNavigate} />

			{/* MISSIONセクション */}
			<MissionSection
				ref={missionRef}
				// Removed scrollProgress prop
				isCircleFullyExpanded={isCircleFullyExpanded}
				// Removed onProgressChange prop
			/>

			{/* CONTACTセクション */}
			<ContactSection
				scrollProgress={0} // Passed simplified 0 as it's unused
				missionSectionProgress={0} // Passed simplified 0 as it's unused
			/>

			{/* スクロール可能なコンテンツエリア（透明） */}
			<div
				className="w-full pointer-events-none"
				style={{ height: isMobile ? "800vh" : "1000vh" }}
			>
				{/* 空のコンテンツでスクロールを可能にする */}
			</div>
		</main>
	);
}
