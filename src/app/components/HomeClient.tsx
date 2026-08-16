// src/app/components/HomeClient.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import MissionSection, { type MissionSidebarHandle } from "./MissionSection";

const SidebarMenu = dynamic(
	() => import("@/components/ui/sidebar-menu").then((mod) => mod.SidebarMenu),
	{ ssr: false },
);
import ContactSection from "./ContactSection";
import { useHeroState } from "@/contexts/HeroStateContext";
import { HASH_JUMP_FLAG } from "@/lib/hash-jump";

const HASH_TARGETS: readonly string[] = ["#mission", "#about", "#contact"];

// #mission の着地点。スクロール量の 0.999 相当（MissionSection の SECTION_END と対応）
const MISSION_SCROLL_RATIO = 0.999;

// 着地してから黒カバーを開けるまでの待ち。
// 着地自体は瞬時に終わるが、動的インポートが直後に解決するとコンテンツが伸びて
// 位置がわずかに動く。MissionSection 側の再アンカーが直すので破綻はしないが、
// その調整が視界に入らないよう少しだけ引っ張る。
const REVEAL_DELAY_MS = 250;

export default function HomeClient() {
	// Optimization: Removed scrollProgress state to prevent re-renders
	const [isCircleFullyExpanded, setIsCircleFullyExpanded] = useState(false);
	// Optimization: Removed missionSectionProgress state as it was causing re-renders and passed to an unused component
	const [isMobile, setIsMobile] = useState(false);
	const missionRef = useRef<MissionSidebarHandle>(null);
	const { setShouldSnapAnimation } = useHeroState();

	// ハッシュ遷移中の黒カバー。"solid" = 全面表示 / "fading" = フェードアウト中 / "none" = 非表示。
	// クライアント遷移（LPのナビ経由）では初回レンダリングから "solid" になるため中間状態が一切見えない。
	// 直接アクセス（SSR + hydration）ではクリックを経ないためフラグが無く常に "none" で、
	// SSR の HTML と一致し hydration mismatch を起こさない（その場合は LoadingScreen が覆う）。
	const [hashCover, setHashCover] = useState<"none" | "solid" | "fading">(
		() => {
			if (typeof window === "undefined") return "none";
			if (!HASH_TARGETS.includes(window.location.hash)) return "none";
			return sessionStorage.getItem(HASH_JUMP_FLAG) ? "solid" : "none";
		},
	);

	// Refs for direct DOM manipulation
	const text1Ref = useRef<HTMLDivElement>(null);
	const text2Ref = useRef<HTMLDivElement>(null);

	// Scroll Physics State
	const targetScrollRef = useRef(0);
	const currentScrollRef = useRef(0);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// window.scrollTo({ behavior: "auto" }) の直後に必ず呼ぶ。
	//
	// 下の Animation Loop はスクロール量を1フレームあたり差分の8%ずつ補間して追う。
	// そのため瞬間移動したスクロール位置に追いつくまで約43フレーム（60fpsで約717ms）かかり、
	// その間ループは「まだ画面上部にいる」と判断して isCircleFullyExpanded を false に戻す。
	// false になると MissionSection 側の進行度が巻き戻され、overflow-hidden が復帰して
	// 内部スクロールが無効化されるため、セクションへの着地が丸ごと失われる。
	// 補間の途中経過を捨てて即座に実位置と一致させることで、この巻き戻しを断つ。
	const syncScrollLerp = useCallback(() => {
		const docHeight =
			document.documentElement.scrollHeight - window.innerHeight;
		const scrolled = docHeight > 0 ? window.scrollY / docHeight : 0;
		targetScrollRef.current = scrolled;
		currentScrollRef.current = scrolled;
	}, []);

	// セクションへの到達処理をここ1箇所に集約する。
	// トップは1000vhのスクロール演出ページで、セクションの表示はスクロール量に紐づくため、
	// ブラウザ標準のアンカージャンプでは演出の状態が追いつかず到達できない。
	// smoothスクロールも1000vh分の移動が不安定なため、スナップ方式で瞬時に移動する。
	//
	// pushState/replaceState は hashchange も popstate も発火しないため、
	// 「クリック」「初回ロード」「戻る/進む(popstate)」の全経路からこの関数を呼ぶ必要がある。
	const navigateToHash = useCallback(
		(hash: string, options?: { withCover?: boolean }) => {
			if (!HASH_TARGETS.includes(hash)) return;

			if (options?.withCover) {
				setHashCover("solid");
			}

			// スナップ完了後、カバーが出ていればフェードで開いて片付ける
			const revealAfterSnap = () => {
				setShouldSnapAnimation(false);
				setHashCover((prev) => (prev === "solid" ? "fading" : prev));
				setTimeout(() => {
					setHashCover((prev) => (prev === "fading" ? "none" : prev));
				}, 350);
			};

			setIsCircleFullyExpanded(true);
			setShouldSnapAnimation(true);

			if (hash === "#mission") {
				const docHeight =
					document.documentElement.scrollHeight - window.innerHeight;
				window.scrollTo({
					top: docHeight * MISSION_SCROLL_RATIO,
					behavior: "auto",
				});
				syncScrollLerp();
				missionRef.current?.scrollToMission();
				setTimeout(revealAfterSnap, 100);
				return;
			}

			window.scrollTo({
				top: document.documentElement.scrollHeight,
				behavior: "auto",
			});
			syncScrollLerp();

			// 1フレーム目でスタイル・レイアウトを確定させ、2フレーム目で offsetTop を測る。
			// 以前はここが固定300msだったが、根拠のない待ち時間であり、
			// 遅延読み込みの解決タイミングとも噛み合っていなかった。
			// チャンク解決による着地点のずれは MissionSection 側の再アンカーが吸収する。
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (hash === "#about") {
						missionRef.current?.scrollToAbout({ behavior: "auto" });
					} else {
						missionRef.current?.scrollToContact({ behavior: "auto" });
					}
					setTimeout(revealAfterSnap, REVEAL_DELAY_MS);
				});
			});
		},
		[setShouldSnapAnimation, syncScrollLerp],
	);

	// 経路3: トップページ上でのナビクリック。
	// 以前はここに navigateToHash とは別の到達処理（smoothスクロール + 固定遅延）があり、
	// 同じ目的の実装が2つ存在していた。URLの更新だけを行い、到達は navigateToHash に委ねる。
	const handleNavigate = useCallback(
		(path: string) => {
			// URLを履歴に積む。トップ(/)はハッシュを外す
			const hash = path === "/" ? "" : `#${path.replace(/^\//, "")}`;
			if (hash !== "" && !HASH_TARGETS.includes(hash)) return;

			const nextUrl = hash === "" ? window.location.pathname : hash;
			if (window.location.hash !== hash) {
				window.history.pushState(null, "", nextUrl);
			}

			if (hash === "") {
				window.scrollTo({ top: 0, behavior: "smooth" });
				return;
			}

			navigateToHash(hash);
		},
		[navigateToHash],
	);

	// 経路1: 初回ロード。他ページ（LPのCTAやグローバルナビ）から /#contact 等で来た場合
	// biome-ignore lint/correctness/useExhaustiveDependencies: 初回マウント時のみ実行したいため依存に含めない
	useEffect(() => {
		const hash = window.location.hash;
		if (!HASH_TARGETS.includes(hash)) return;
		// フラグは1回のジャンプで使い切る（残すと直接アクセス時のhydrationに影響しうる）
		sessionStorage.removeItem(HASH_JUMP_FLAG);

		// 150ms はレイアウト確定を待つ最小限のマージン
		const timer = setTimeout(() => navigateToHash(hash), 150);
		return () => clearTimeout(timer);
	}, []);

	// 経路2: ブラウザの戻る/進む。pushStateで積んだ履歴を辿ったとき、
	// これが無いとURLだけ変わって表示位置が追従しない
	useEffect(() => {
		const handlePopState = () => {
			const hash = window.location.hash;
			if (HASH_TARGETS.includes(hash)) {
				navigateToHash(hash);
			} else {
				// ハッシュ無しの履歴項目（トップ）へ戻ったとき。
				// ここでも補間を同期しないと、下に居たままの値で数百ms判定が続く
				window.scrollTo({ top: 0, behavior: "auto" });
				syncScrollLerp();
			}
		};
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [navigateToHash, syncScrollLerp]);

	// 黒い円の開始タイミング（hero-canvas.tsxのCIRCLE_SCROLL_STARTと同期）
	const CIRCLE_START = 0.92;
	const CIRCLE_SCROLL_END = 0.97; // hero-canvas.tsxのCIRCLE_SCROLL_END
	const CIRCLE_ACTUAL_END = 0.97; // 完全に拡大したタイミング (0.99 -> 0.97)

	// Animation Loop (Lerp & Render)
	useEffect(() => {
		let rafId = 0;

		const loop = () => {
			// 1. Lerp Physics (Smoothness)
			// targetに向かって current を近づける (係数 0.08 でふわっと追従)
			const diff = targetScrollRef.current - currentScrollRef.current;
			// 差分が小さいときは止める（収束させる）
			if (Math.abs(diff) < 0.0001) {
				currentScrollRef.current = targetScrollRef.current;
			} else {
				currentScrollRef.current += diff * 0.08;
			}

			const scrolled = currentScrollRef.current; // Smoothed Value

			// --- Logic for setIsCircleFullyExpanded (State) ---
			if (scrolled >= CIRCLE_ACTUAL_END) {
				setIsCircleFullyExpanded((prev) => {
					if (!prev) return true;
					return prev;
				});
			} else if (scrolled < CIRCLE_START) {
				setIsCircleFullyExpanded((prev) => {
					if (prev) return false;
					return prev;
				});
			}

			// --- Setup for Animations ---
			const isCircleExpanded = scrolled >= CIRCLE_SCROLL_END;

			// --- Text 1 Animation ("WEBの困りごとに...") ---
			// Timing Shifted Later & Smoothed
			// Desktop: In 8-15%, Out 22-28%
			// Mobile: In 3-10%, Out 17-23% (Earlier to reduce scroll)
			// Multiplier ~14 (1/0.07) for 7% range
			const text1Start = isMobile ? 0.03 : 0.08;
			const text1End = isMobile ? 0.23 : 0.28;
			const text1FadeIn = Math.max(
				0,
				Math.min(1, (scrolled - text1Start) * 14),
			);
			const text1FadeOut = Math.max(0, Math.min(1, (text1End - scrolled) * 16));
			const text1Opacity = Math.min(text1FadeIn, text1FadeOut);

			if (text1Ref.current) {
				const opacity = isCircleExpanded ? 0 : text1Opacity;
				text1Ref.current.style.opacity = opacity.toString();

				// Transform logic (Slide up/down with smooth scroll)
				if (isMobile) {
					const tx = (1 - opacity) * -20;
					text1Ref.current.style.transform = `translateX(${tx}px)`;
				} else {
					const tx = (1 - opacity) * -20;
					text1Ref.current.style.transform = `translateY(-50%) translateX(${tx}px)`;
				}
			}

			// --- Text 2 Animation ("現場が抱える...") ---
			// Timing Shifted Later
			// Desktop: In 28-35%, Out 76-80% (Starts as Text 1 fades out)
			// Mobile: In 13-20%, Out 76-80% (Earlier to reduce scroll)
			const text2Start = isMobile ? 0.13 : 0.28;
			const text2FadeIn = Math.max(
				0,
				Math.min(1, (scrolled - text2Start) * 14),
			);
			const text2FadeOut = Math.max(0, Math.min(1, (0.8 - scrolled) * 25));
			const text2Opacity = Math.min(text2FadeIn, text2FadeOut);

			if (text2Ref.current) {
				const opacity = isCircleExpanded ? 0 : text2Opacity;
				text2Ref.current.style.opacity = opacity.toString();

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

			rafId = requestAnimationFrame(loop);
		};

		// Start Loop
		loop();

		return () => cancelAnimationFrame(rafId);
	}, [isMobile]);

	// Window Scroll Listener (Only updates Target)
	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const rawScrolled = docHeight > 0 ? scrollTop / docHeight : 0;

			// Update Target
			targetScrollRef.current = rawScrolled;
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Initial check

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<main>
			{/* 屋号を左上に固定配置 */}
			<div className="fixed top-8 left-6 md:left-8 z-10 h-[50px]">
				<h1 className="text-2xl md:text-[28px] font-bold text-white pointer-events-none">
					TANEBI CREATIVE
				</h1>
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
							? "calc(env(safe-area-inset-top) + 5rem + 15px)"
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
						<span className="block">Webサイト・ECサイト制作</span>
						<span className="block">アプリ開発 / AI実務活用 / DX支援 /</span>
						<span className="block">SEO・集客支援も</span>
						<span className="block">課題解決に向けた最適な提案を</span>
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
							? "calc(env(safe-area-inset-top) + 5rem + 15px)"
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

			{/* ハッシュ遷移（LPのナビ → /#mission 等）のスナップ完了までの中間状態を隠す黒カバー */}
			{hashCover !== "none" && (
				<div
					aria-hidden
					className={`fixed inset-0 z-[60] bg-black transition-opacity duration-300 ${
						hashCover === "fading"
							? "opacity-0 pointer-events-none"
							: "opacity-100"
					}`}
				/>
			)}
		</main>
	);
}
