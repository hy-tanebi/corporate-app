// src/app/components/HomeClient.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import MissionSection, { type MissionSidebarHandle } from "./MissionSection";

// ssr: false にしないこと。グローバルメニューはトップページから配下ページへの
// 唯一の内部リンク経路で、ssr: false だとリンクが初期HTMLに1本も出力されない。
// SidebarMenu が window を触るのは useEffect の中だけなので SSR しても安全。
// dynamic のままなのはコード分割の維持が目的。
const SidebarMenu = dynamic(() =>
	import("@/components/ui/sidebar-menu").then((mod) => mod.SidebarMenu),
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
				// smooth だと 1000vh を延々とスクロールすることになり、その間ずっと
				// 平滑化ループが追従を続けるため、CONTACT のように最下部から呼ぶと
				// 先頭に着かない。auto で瞬時に飛ばし、直後に補間値を実位置へ揃える
				// （doc/progress.md の「scrollTo の直後は必ず syncScrollLerp」に従う）。
				window.scrollTo({ top: 0, behavior: "auto" });
				syncScrollLerp();
				return;
			}

			navigateToHash(hash);
		},
		[navigateToHash, syncScrollLerp],
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

	// 経路2: ブラウザの戻る/進む（popstate）と、
	// 経路4: トップページ上で location.assign 等によりハッシュだけが変わったとき（hashchange）。
	//
	// 経路4は3Dカードの詳細モーダルから ABOUT カードを開いたときに起きる。
	// 同一ページ内のフラグメント変更はページ遷移にならないため、これが無いと
	// URLが /#about になるだけで表示位置が動かない。
	//
	// 履歴を辿ったときは popstate → hashchange の順に両方発火するため、
	// popstate で処理したことをフラグで記録して二重実行を防ぐ。
	useEffect(() => {
		const handledByPopState = { current: false };

		const goToCurrentHash = () => {
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

		const handlePopState = () => {
			handledByPopState.current = true;
			// 直後に発火する hashchange をやり過ごしたらフラグを戻す
			setTimeout(() => {
				handledByPopState.current = false;
			}, 0);
			goToCurrentHash();
		};

		const handleHashChange = () => {
			if (handledByPopState.current) return;
			goToCurrentHash();
		};

		window.addEventListener("popstate", handlePopState);
		window.addEventListener("hashchange", handleHashChange);
		return () => {
			window.removeEventListener("popstate", handlePopState);
			window.removeEventListener("hashchange", handleHashChange);
		};
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
			// ファーストビューのコピーは最初から表示する（フェードインさせない）。
			// 以前は 8%（PC）/ 3%（スマホ）スクロールしてから現れる設定で、
			// スクロール0では opacity 0 だった。Googlebot はスクロールしないため、
			// レンダリング結果が可視テキスト0文字の真っ黒な画面になっていた
			// （3Dは WebGL なので Googlebot の環境では描画されない）。
			// フェードアウト側のタイミングは変更していないので、スクロール後の演出は従来どおり。
			// Desktop: Out 22-28% / Mobile: Out 17-23%
			const text1End = isMobile ? 0.23 : 0.28;
			const text1FadeOut = Math.max(0, Math.min(1, (text1End - scrolled) * 16));
			const text1Opacity = text1FadeOut;

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
			{/* 屋号を左上に固定配置。クリックでページ先頭へ戻る。
			    h1 の pointer-events-none は背後の3Dがマウス操作を受け取れるようにするための指定。
			    リンクにだけ pointer-events-auto を付けて、文字の上だけクリックできるようにしている。 */}
			<div className="fixed top-8 left-6 md:left-8 z-30 h-[50px]">
				<h1 className="text-2xl md:text-[28px] font-bold text-white pointer-events-none">
					<Link
						href="/"
						onClick={(e) => {
							// トップページ上ではブラウザ遷移させず、既存のスナップ処理で先頭へ戻す
							e.preventDefault();
							handleNavigate("/");
						}}
						className="pointer-events-auto inline-block transition-opacity duration-200 hover:opacity-70"
						aria-label="ページの先頭に戻る"
					>
						TANEBI CREATIVE
					</Link>
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
