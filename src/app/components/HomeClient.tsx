// src/app/components/HomeClient.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { SidebarMenu } from "@/components/ui/sidebar-menu";
import { AudioControlButton } from "@/components/ui/audio-control-button";
import MissionSection, { type MissionSidebarHandle } from "./MissionSection";
import ContactSection from "./ContactSection";
import { useHeroState } from "@/contexts/HeroStateContext";

export default function HomeClient() {
	const [scrollProgress, setScrollProgress] = useState(0);
	const [isCircleFullyExpanded, setIsCircleFullyExpanded] = useState(false);
	const [missionSectionProgress, setMissionSectionProgress] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
	const missionRef = useRef<MissionSidebarHandle>(null);
    const { setShouldSnapAnimation } = useHeroState();

    useEffect(() => {
        const checkMobile = () => {
             setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNavigate = (path: string) => {
        if (path === '/about') {
            // AboutセクションはMissionSectionの中にあるため、
            // まずはメインのスクロールをMissionSectionが表示される位置（＝一番下）まで持っていく
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });

            // その後、MissionSection内部でAboutまでスクロール
            // 少し遅延させて、メインスクロールが始まった後に実行（あるいは完了後が良いが、並行でも動くはず）
            setTimeout(() => {
                missionRef.current?.scrollToAbout();
            }, 500);
        } else if (path === '/contact') {
             window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
            // 遅延なしで即時実行（MissionSection側でフラグ制御による即時表示を行う）
            missionRef.current?.scrollToContact();
        } else if (path === '/mission') {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            // MissionSectionの定数と合わせる (Mobile: 0.85, Desktop: 0.94)
            // 少し余裕を持たせて、アニメーションが開始した直後の状態(0.15付近)にするなら
            // Start + (End - Start) * 0.15 くらいが適切だが、
            // シンプルにセクション開始位置(Start)へ遷移させる
            const SECTION_START = isMobile ? 0.85 : 0.94;
            // 0.95進んだ位置を計算 (TECHNICAL PARTNERが完全に横に並んだ状態)
            const SECTION_END = 0.999;
            const targetScroll = docHeight * (SECTION_START + (SECTION_END - SECTION_START) * 0.95);

            // ミッション表示に必要なフラグを強制的にONにする
            setIsCircleFullyExpanded(true);

            // ★アニメーションのスムージングを無効化（スナップ）
            setShouldSnapAnimation(true);

            window.scrollTo({
                top: targetScroll,
                behavior: 'auto'
            });

            // 即座に実行してグレー背景などの状態をリセット
            missionRef.current?.scrollToMission();

            // 少し遅れてスナップフラグを解除
            setTimeout(() => {
                setShouldSnapAnimation(false);
            }, 100);
        } else if (path === '/') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

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

    // タイトル制御 (Top)
    useEffect(() => {
        // スクロールが浅い場合（Missionセクションに入る前）、タイトルをデフォルトに戻す
        // かつ、ミッションセクション側で制御されていないタイミング
        if (scrollProgress < 0.8 && !isMobile) {
             document.title = "TANEBI CREATIVE タネビ クリエイティブ";
        } else if (scrollProgress < 0.8 && isMobile) {
             document.title = "TANEBI CREATIVE タネビ クリエイティブ";
        }
    }, [scrollProgress, isMobile]);

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
		} else if (scrollProgress < CIRCLE_START) {
			// スクロールを戻して黒い円が縮小したらフラグをfalseに戻す（ヒステリシスを持たせて即座に閉じないようにする）
			if (isCircleFullyExpanded) {
				setIsCircleFullyExpanded(false);
				console.log("Circle shrinking at scrollProgress:", scrollProgress);
			}
		}
	}, [scrollProgress, isCircleFullyExpanded]);

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
			<div
				className={`fixed z-10 transition-all duration-1000 ease-out md:max-w-4xl ${
                    isMobile
                        ? 'left-0 top-0 w-full h-[100dvh] pointer-events-none'
                        : 'left-8 md:left-16 top-1/2 pointer-events-none'
                }`}
				style={{
					opacity: isCircleExpanded ? 0 : text1Opacity,
					// Mobile: Just slide X. Desktop: Center Y + Slide X.
					transform: isMobile
                        ? `translateX(${(1 - text1Opacity) * -20}px)`
                        : `translateY(-50%) translateX(${(1 - text1Opacity) * -20}px)`,
				}}
			>
				<div
                    className={isMobile ? "w-full h-full flex flex-col justify-between px-6" : ""}
                    style={{
                        paddingTop: isMobile ? 'calc(env(safe-area-inset-top) + 8rem)' : undefined,
                        paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 2rem)' : undefined
                    }}
                >
					<h2
						className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight md:mb-8"
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
						className="text-base md:text-xl font-bold text-white/80 leading-relaxed space-y-1 md:space-y-2 mb-4 md:mb-0"
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
			</div>

			{/* 第2テキスト: 詳細メッセージ */}
			<div
				className={`fixed z-10 transition-all duration-1000 ease-out md:max-w-4xl ${
                    isMobile
                        ? 'left-0 top-0 w-full h-[100dvh] pointer-events-none'
                        : 'left-8 md:left-16 top-1/2 pointer-events-none'
                }`}
				style={{
					opacity: isCircleExpanded ? 0 : text2Opacity,
					transform: isMobile
                        ? `translateX(${(1 - text2Opacity) * -20}px)`
                        : `translateY(-50%) translateX(${(1 - text2Opacity) * -20}px)`,
				}}
			>
				<div
                    className={isMobile ? "w-full h-full flex flex-col justify-between px-6" : ""}
                    style={{
    					paddingTop: isMobile ? 'calc(env(safe-area-inset-top) + 8rem)' : undefined,
	    				paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 2rem)' : undefined
                    }}
                >
					<h2
						className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight md:mb-8"
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
						className="text-base md:text-xl font-bold text-white/80 leading-relaxed space-y-1 md:space-y-2 mb-4 md:mb-0"
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
