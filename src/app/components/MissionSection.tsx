// src/app/components/MissionSection.tsx
"use client";

import {
	useEffect,
	useMemo,
	useRef,
	useState,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from "react";
import { ContactForm } from "@/components/contact/contact-form";
import AboutSection from "./AboutSection";
import MissionContent from "./MissionContent";
import { useHeroState } from "../../contexts/HeroStateContext";

// フォームセクションコンポーネント
function ContactFormSection() {
	return <ContactForm />;
}

interface MissionSectionProps {
	scrollProgress: number; // 0〜1 の全体スクロール進捗（親から供給）
	isCircleFullyExpanded: boolean; // 円が拡大完了したトリガ
	onProgressChange?: (progress: number) => void; // セクション内進捗を親に通知
}

export interface MissionSidebarHandle {
	scrollToAbout: () => void;
	scrollToMission: () => void;
	scrollToContact: () => void;
}

// ユーティリティ
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const remap01 = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeOutCubic = (t: number) => 1 - (1 - clamp(t)) ** 3;
const easeInOutCubic = (t: number) =>
	t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function MissionSection(
	{
		scrollProgress,
		isCircleFullyExpanded,
		onProgressChange,
	}: MissionSectionProps,
	ref: React.Ref<MissionSidebarHandle>,
) {
	const { setIsContactVisible, setSpaceOpacity, setTransitionProgress } =
		useHeroState();
	const [isMobile, setIsMobile] = useState(false);

	// Section Progress State (moved to top to avoid ReferenceError)
	const [sectionProgress, setSectionProgress] = useState(0);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// ======= 調整パラメータ（ここをいじるだけで遅くできます） =======
	const SECTION_START = isMobile ? 0.85 : 0.94;
	const SECTION_END = 0.999;

	const PROGRESS_SPEED_FORWARD = isMobile ? 5.0 : 0.25;
	const PROGRESS_SPEED_BACKWARD = isMobile ? 1.0 : 2.0;

	const SMOOTH_ALPHA = isMobile ? 0.9 : 0.08;
	const SMOOTH_ALPHA_BACKWARD = 0.3;
	const GAMMA = 1.8;

	// 生のターゲット進捗（0→1）
	const rawTarget = useMemo(() => {
		if (!isCircleFullyExpanded) return 0;
		return remap01(scrollProgress, SECTION_START, SECTION_END);
	}, [scrollProgress, isCircleFullyExpanded, SECTION_START]);

	// 前回のrawTargetを保存して、進む/戻るを判定
	const prevRawTargetRef = useRef(0);
	const isGoingForwardRef = useRef(true);

	useEffect(() => {
		if (rawTarget > prevRawTargetRef.current) {
			isGoingForwardRef.current = true;
		} else if (rawTarget < prevRawTargetRef.current) {
			isGoingForwardRef.current = false;
		}
		prevRawTargetRef.current = rawTarget;
	}, [rawTarget]);

	// ガンマで序盤減速（進む時のみ適用、戻る時は線形）
	const shapedTarget = isGoingForwardRef.current
		? rawTarget ** GAMMA
		: rawTarget;

	// 速度上限＋慣性つきの追従進捗（実際に描画に使う）
	const targetRef = useRef(0);
	const currentRef = useRef(0);
	// const [sectionProgress, setSectionProgress] = useState(0); // Moved to top

	useEffect(() => {
		targetRef.current = shapedTarget;
	}, [shapedTarget]);

	useEffect(() => {
		let raf = 0;
		let last = performance.now();

		const loop = (now: number) => {
			const dt = (now - last) / 1000; // 秒
			last = now;

			const tgt = targetRef.current;
			let cur = currentRef.current;

			// 差分
			const diff = tgt - cur;

			// 速度上限（進む時と戻る時で切り替え）
			const isGoingForward = diff > 0;
			const speedLimit = isGoingForward
				? PROGRESS_SPEED_FORWARD
				: PROGRESS_SPEED_BACKWARD;
			const maxStep = speedLimit * dt;

			// 慣性追従によるステップ（進む時と戻る時で慣性を切り替え）
			const smoothAlpha = isGoingForward ? SMOOTH_ALPHA : SMOOTH_ALPHA_BACKWARD;
			const inertialStep = diff * smoothAlpha;

			// 実際に適用するステップは「慣性」と「速度上限」の小さい方
			let step =
				Math.abs(inertialStep) > maxStep
					? Math.sign(inertialStep) * maxStep
					: inertialStep;

			// ★スマホの場合は完全連動（慣性・遅延ゼロ）にする
			// 指の動きに吸い付くようにするため、計算したステップを無視して直接ターゲットへ
			if (isMobile) {
				step = diff; // diffをそのまま足せば cur + step = tgt になる
			}

			cur += step;

			currentRef.current = cur;
			setSectionProgress(cur);

			// 親コンポーネントに進捗を通知
			if (onProgressChange) {
				onProgressChange(cur);
			}

			raf = requestAnimationFrame(loop);
		};

		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [
		onProgressChange,
		isMobile,
		PROGRESS_SPEED_FORWARD,
		PROGRESS_SPEED_BACKWARD,
		SMOOTH_ALPHA,
	]);

	// 表示フラグ
	const showSection = isCircleFullyExpanded;
	const showMission = sectionProgress >= 0.15;
	const showCreative = sectionProgress >= 0.3;
	// 詳細テキストの表示（スクロールロック解除）タイミング
	// スマホの場合は「待たされる感」を減らすため、アニメーションが9割完了したらもう出し始める
	// さらに早めて0.75にする（文字の横移動中だが、もうスクロールできて良い）
	// Desktopも0.97だと遅すぎるため、0.85まで早める
	const showDescription = sectionProgress >= (isMobile ? 0.75 : 0.85);

	// グラデーション遷移セクションのスクロール進捗を追跡 (Ref化して再レンダリング防止)
	const gradientProgressRef = useRef(0);
	// Aboutセクションの終わり際でトリガーするTransition進捗
	const [irisTransitionProgress, setIrisTransitionProgress] = useState(0);
	const [isContactInView, setIsContactInView] = useState(false);

	const gradientRef = useRef<HTMLDivElement>(null);
	const aboutWrapperRef = useRef<HTMLDivElement>(null); // AboutSectionを囲うラッパー
	const contactRef = useRef<HTMLDivElement>(null);
	const contactTitleRef = useRef<HTMLHeadingElement>(null);
	const contactFormRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const backgroundRef = useRef<HTMLDivElement>(null); // 背景要素へのRef
	const scrollPositionRef = useRef(0);
	// 自動スクロール中かどうかを判定するフラグ
	const isAutoScrollingToContact = useRef(false);
	const lastScrollTopRef = useRef(0);

	useImperativeHandle(ref, () => ({
		scrollToAbout: () => {
			if (containerRef.current && aboutWrapperRef.current) {
				// Aboutセクションの開始位置
				const top = aboutWrapperRef.current.offsetTop;
				// Aboutセクションの高さ（800vh）のうち、アニメーションが完了する位置までスクロール
				// AboutSectionのスクロール進捗0.5あたりで画像が完全に表示される
				const wrapperHeight = aboutWrapperRef.current.clientHeight;
				const windowHeight = window.innerHeight;
				const targetScrollAndOffset = (wrapperHeight - windowHeight) * 0.5;

				// スムーズスクロール
				containerRef.current.scrollTo({
					top: top + targetScrollAndOffset,
					behavior: "smooth",
				});

				// Physicsを即座に完了させて、内部スクロール(overflow-y-auto)を有効化する
				// これがないと、アニメーション中はoverflow-hiddenのため、スクロール操作がWindowに伝播してトップに戻ってしまう
				currentRef.current = 1.0;
				targetRef.current = 1.0;
				setSectionProgress(1.0);
			}
		},
		scrollToMission: () => {
			if (containerRef.current) {
				// 自動スクロールフラグを解除
				isAutoScrollingToContact.current = false;

				// コンタクト表示フラグを強制解除 (宇宙空間のままになるのを防ぐ)
				setIsContactVisible(false);
				setIsContactInView(false);

				// 背景状態を強制リセット
				gradientProgressRef.current = 0;
				updateBackgroundColor(0, 0, false); // 即座に更新
				setIrisTransitionProgress(0);
				setSpaceOpacity(1);
				setTransitionProgress(0);

				// グレー背景(gradientProgress)を即座にリセットするために auto
				containerRef.current.scrollTo({
					top: 0,
					behavior: "auto",
				});

				// Physicsをターゲット位置(0.95)に強制リセットして、表示完了状態から開始
				currentRef.current = 0.95;
				targetRef.current = 0.95;
				setSectionProgress(0.95);
			}
		},
		scrollToContact: () => {
			if (containerRef.current && contactFormRef.current) {
				// 自動スクロールフラグを立てて、即座にContact表示モードにする
				isAutoScrollingToContact.current = true;
				setIsContactVisible(true);
				setIsContactInView(true);

				const top = contactFormRef.current.offsetTop;
				containerRef.current.scrollTo({
					top: top,
					behavior: "smooth",
				});

				// Physicsを即座に完了させる（About同様のスクロールロック回避）
				currentRef.current = 1.0;
				targetRef.current = 1.0;
				setSectionProgress(1.0);

				// しばらくしたらフラグを戻す（スクロール完了見込み時間後）
				setTimeout(() => {
					isAutoScrollingToContact.current = false;
				}, 1000);
			}
		},
	}));

	// 背景色更新関数 (Direct DOM update)
	const updateBackgroundColor = useCallback(
		(progress1: number, irisProgress: number, contactInView: boolean) => {
			if (!backgroundRef.current) return;

			// Contactが表示されている、またはIris遷移が完了している場合は完全に透明（宇宙を表示）
			if (contactInView || irisProgress >= 1) {
				backgroundRef.current.style.backgroundColor = "rgba(0, 0, 0, 0)";
				return;
			}

			const clampedProgress1 = Math.max(0, Math.min(1, progress1));
			// User request: About section (text flow) needs white background.
			// Reverting to 235 (Light Gray/White).
			const TARGET_GRAY = 235;

			// メインカラー（進捗に応じて黒→グレー）
			// Iris遷移が進むにつれて黒（0）に近づける
			const irisFactor = Math.max(0, Math.min(1, irisProgress));
			const colorValue = Math.round(
				clampedProgress1 * TARGET_GRAY * (1 - irisFactor),
			);

			// 不透明度（Iris遷移が進むにつれて透明にしていく）
			// irisProgress: 0 (Mission/About) -> 1 (Space/Contact)
			// alpha: 1 -> 0
			const alpha = 1 - irisFactor;

			backgroundRef.current.style.backgroundColor = `rgba(${colorValue}, ${colorValue}, ${colorValue}, ${alpha})`;
		},
		[],
	);

	useEffect(() => {
		// 戻ってくるときのためにProgressを共有
		setTransitionProgress(irisTransitionProgress);

		// Space Opacityは常に1 (マスクで隠したり見せたりする)
		setSpaceOpacity(1);
	}, [irisTransitionProgress, setSpaceOpacity, setTransitionProgress]);

	// スクロールイベント
	useEffect(() => {
		const container = containerRef.current;
		if (!showDescription || !container) return;

		const handleScroll = () => {
			const windowHeight = window.innerHeight;
			const currentScrollTop = container.scrollTop;

			// 手動スクロール検知：上方向にスクロールしたら強制フラグを解除
			if (
				isAutoScrollingToContact.current &&
				currentScrollTop < lastScrollTopRef.current - 5
			) {
				// -5は微小なバウンスでの誤検知防止
				isAutoScrollingToContact.current = false;
			}
			lastScrollTopRef.current = currentScrollTop;

			// Gradient 1 (黒→白)
			let newGradientProgress = gradientProgressRef.current;
			if (gradientRef.current) {
				// 高速化のため getBoundingClientRect を最小限に... したいが位置判定に必須
				const rect = gradientRef.current.getBoundingClientRect();
				if (rect.top <= windowHeight && rect.bottom >= 0) {
					const sectionHeight = rect.height;
					const scrolled = windowHeight - rect.top;
					const rawProgress = Math.max(
						0,
						Math.min(1, scrolled / (sectionHeight + windowHeight)),
					);
					const delayedProgress = Math.max(0, (rawProgress - 0.5) * 2);
					newGradientProgress = delayedProgress;
				} else if (rect.top > windowHeight) {
					newGradientProgress = 0;
				} else {
					newGradientProgress = 1;
				}
				gradientProgressRef.current = newGradientProgress;
			}

			// === Iris Transition Logic ===
			// About Wrapperがある場合、その「最後尾」に近づいたらIrisを閉じる
			let newIrisProgress = irisTransitionProgress;
			if (aboutWrapperRef.current) {
				const rect = aboutWrapperRef.current.getBoundingClientRect();
				const TRANSITION_ZONE = windowHeight * (isMobile ? 2.5 : 10.0);
				const distFromBottom = rect.bottom - windowHeight;

				if (distFromBottom <= TRANSITION_ZONE && distFromBottom >= 0) {
					const linearP = 1 - distFromBottom / TRANSITION_ZONE;
					newIrisProgress = easeInOutCubic(linearP);
				} else if (distFromBottom < 0) {
					newIrisProgress = 1;
				} else {
					newIrisProgress = 0;
				}
				// State update only if changed significantly
				if (Math.abs(newIrisProgress - irisTransitionProgress) > 0.001) {
					setIrisTransitionProgress(newIrisProgress);
				}
			}

			// Contact Section Visibility Check & Title Animation
			let newIsContactInView = isContactInView;
			if (contactRef.current) {
				const rect = contactRef.current.getBoundingClientRect();
				const isVisible = rect.top < windowHeight * 0.8;

				const effectiveIsVisible = isAutoScrollingToContact.current
					? true
					: isVisible;

				if (effectiveIsVisible !== isContactInView) {
					setIsContactInView(effectiveIsVisible);
					setIsContactVisible(effectiveIsVisible);
					newIsContactInView = effectiveIsVisible;
				}

				if (contactTitleRef.current) {
					const startOffset = windowHeight * 0.85;
					if (rect.top < startOffset) {
						contactTitleRef.current.style.opacity = "1";
						contactTitleRef.current.style.transform = "translateY(0)";
						contactTitleRef.current.style.transition =
							"opacity 1.5s ease-out, transform 1.5s ease-out";
					} else {
						contactTitleRef.current.style.opacity = "0";
						contactTitleRef.current.style.transform = "translateY(100px)";
						contactTitleRef.current.style.transition =
							"opacity 0.5s ease-out, transform 0.5s ease-out";
					}
				}
			}

			// Update Background Color Directly
			// ここで最新の値を渡して更新。State更新を待たない。
			// irisProgressはState更新と同時にローカル変数も使う
			updateBackgroundColor(
				newGradientProgress,
				newIrisProgress,
				newIsContactInView,
			);

			// === Title Logic (Sync with Scroll) ===
			if (document.title) {
				if (newIsContactInView) {
					if (!document.title.startsWith("CONTACT")) {
						document.title = "CONTACT | TANEBI CREATIVE タネビ クリエイティブ";
					}
				} else if (aboutWrapperRef.current) {
					const rect = aboutWrapperRef.current.getBoundingClientRect();
					if (rect.top < windowHeight * 0.5) {
						// About
					} else {
						if (newIrisProgress <= 0) {
							if (!document.title.startsWith("MISSION")) {
								document.title =
									"MISSION | TANEBI CREATIVE タネビ クリエイティブ";
							}
						}
					}
				}
			}
		};

		container.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, [
		showDescription,
		isContactInView,
		setIsContactVisible,
		irisTransitionProgress,
		isMobile,
		updateBackgroundColor,
	]);

	// オーバーレイでのスクロールをメインウィンドウに伝播させる処理
	useEffect(() => {
		const container = containerRef.current;
		if (!container || !showSection) return;

		let touchStartY = 0;
		const handleTouchStart = (e: TouchEvent) => {
			touchStartY = e.touches[0].clientY;
		};

		let isScrolling = false;
		const handleTouchMove = (e: TouchEvent) => {
			if (isScrolling) return;
			const touchY = e.touches[0].clientY;
			const deltaY = touchY - touchStartY;
			if (container.scrollTop <= 0 && deltaY > 0) {
				isScrolling = true;
				requestAnimationFrame(() => {
					window.scrollBy(0, -deltaY * 1.5);
					isScrolling = false;
				});
				if (e.cancelable) e.preventDefault();
			}
			touchStartY = touchY;
		};

		const handleWheel = (e: WheelEvent) => {
			if (isScrolling) return;
			if (container.scrollTop <= 0 && e.deltaY < 0) {
				isScrolling = true;
				requestAnimationFrame(() => {
					window.scrollBy(0, e.deltaY);
					isScrolling = false;
				});
			}
		};

		container.addEventListener("touchstart", handleTouchStart, {
			passive: false,
		});
		container.addEventListener("touchmove", handleTouchMove, {
			passive: false,
		});
		container.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			container.removeEventListener("touchstart", handleTouchStart);
			container.removeEventListener("touchmove", handleTouchMove);
			container.removeEventListener("wheel", handleWheel);
		};
	}, [showSection]);

	// スクロールイベント
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		if (showSection && scrollPositionRef.current > 0) {
			container.scrollTop = scrollPositionRef.current;
		}

		if (!showSection) {
			container.scrollTop = 0;
			scrollPositionRef.current = 0;

			currentRef.current = 0;
			targetRef.current = 0;
			setSectionProgress(0);
			prevRawTargetRef.current = 0;
			isGoingForwardRef.current = true;

			gradientProgressRef.current = 0; // Ref Reset
			setIrisTransitionProgress(0);
			setIsContactInView(false);
			setIsContactVisible(false);
			setSpaceOpacity(1);
			setTransitionProgress(0);
			updateBackgroundColor(0, 0, false); // Direct Update
		}
	}, [
		showSection,
		setIsContactVisible,
		setSpaceOpacity,
		setTransitionProgress,
		updateBackgroundColor,
	]);

	// 段階マッピング
	const zAxisProgress = easeOutCubic(remap01(sectionProgress, 0.3, 0.7));
	const horizontalProgress = easeOutCubic(remap01(sectionProgress, 0.7, 0.95));

	// matrix 用パラメータ
	const scale = 1 + (1 - zAxisProgress) * 4;

	// スマホ(768px未満)、PC共にMISSIONの幅（text-6xl/text-8xl）に合わせるよう調整
	const baseTx = isMobile ? 65 : 104;
	const centerOffsetX = isMobile ? 5 : 10;

	const leftTx = -baseTx * horizontalProgress + centerOffsetX;
	const rightTx = +baseTx * horizontalProgress + centerOffsetX;
	const upTy = -25 * (1 - horizontalProgress);
	const dnTy = +25 * (1 - horizontalProgress);

	// === Mask (Spaceship Transition) ===
	const shrinkPhase = Math.min(irisTransitionProgress / 0.4, 1);
	const _visibleRadius = Math.max(0, (1 - shrinkPhase) * 150);

	return (
		<section
			id="mission"
			ref={containerRef}
			className={`fixed inset-0 z-20 mission-scrollbar ${
				showDescription ? "overflow-y-auto" : "overflow-hidden"
			}`}
			style={{
				opacity: showSection ? 1 : 0,
				pointerEvents: showSection ? "auto" : "none",
				transition: "opacity 0.5s ease-out",
			}}
		>
			{/* MISSION + CREATIVE THINKING エリア */}
			<div className="h-screen flex flex-col items-center justify-center gap-8 px-8">
				<h2
					className="text-6xl md:text-8xl font-bold text-white"
					style={{
						opacity: showMission ? 1 : 0,
						transform: `translateY(${showMission ? 0 : -20}px)`,
						transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
					}}
				>
					MISSION
				</h2>

				<div
					className="relative flex items-center justify-center"
					style={{ perspective: "1000px", minHeight: 150, width: "100%" }}
				>
					<p
						className="text-xl md:text-4xl text-white/90 font-bold absolute will-change-transform tracking-wider md:tracking-normal"
						style={{
							opacity: showCreative ? 1 : 0,
							transform: showCreative
								? `matrix(${scale}, 0, 0, ${scale}, ${leftTx}, ${upTy})`
								: `matrix(5, 0, 0, 5, 0, -200)`,
							transition: "opacity 0.5s ease-out",
						}}
					>
						TECHNICAL
					</p>

					<p
						className="text-xl md:text-4xl text-white/90 font-bold absolute will-change-transform tracking-wider md:tracking-normal"
						style={{
							opacity: showCreative ? 1 : 0,
							transform: showCreative
								? `matrix(${scale}, 0, 0, ${scale}, ${rightTx}, ${dnTy})`
								: `matrix(5, 0, 0, 5, 0, 200)`,
							transition: "opacity 0.5s ease-out 0.12s",
						}}
					>
						PARTNER
					</p>
				</div>
			</div>

			<div
				className="w-full min-h-screen flex flex-col items-center justify-center px-0 md:px-8 py-20"
				style={{
					opacity: showDescription ? 1 : 0,
					transform: `translateY(${showDescription ? 0 : 30}px)`,
					transition: "opacity 1s ease-out, transform 1s ease-out",
				}}
			>
				<div className="max-w-4xl mx-auto px-0 md:px-4 w-full">
					<div className="flex flex-col gap-6">
						{/* MissionContentコンポーネント */}
						<div
							style={{
								opacity: showDescription ? 1 : 0,
								transform: `translateY(${showDescription ? 0 : 30}px)`,
								transition: "opacity 1s ease-out, transform 1s ease-out",
								width: "100%",
							}}
						>
							<MissionContent scrollContainerRef={containerRef} />
						</div>
					</div>
				</div>
			</div>

			<div ref={gradientRef} className="w-full h-[50vh] md:h-[100vh]" />

			<div ref={aboutWrapperRef} className="relative w-full">
				<AboutSection transitionProgress={irisTransitionProgress} />
			</div>

			<div
				ref={contactRef}
				className={`w-full flex items-center justify-center relative z-30 ${
					isMobile ? "h-[50vh]" : "h-screen"
				}`}
			>
				<h2
					ref={contactTitleRef}
					className="text-6xl md:text-8xl font-bold text-white will-change-transform"
					style={{ opacity: 0, transform: "translateY(100px)" }}
				>
					CONTACT
				</h2>
			</div>

			<div className="w-full min-h-[calc(100dvh+1px)] flex items-center justify-center p-4">
				<div ref={contactFormRef} className="max-w-2xl w-full">
					<ContactFormSection />
				</div>
			</div>

			{/* Fixed Background - Direct Ref based manipulation */}
			<div
				ref={backgroundRef}
				className="fixed inset-0 -z-10 pointer-events-none"
				style={{
					backgroundColor: "rgba(0,0,0,1)", // Initial black
					transition: "background-color 0.6s ease-out",
				}}
			/>
		</section>
	);
}

export default forwardRef(MissionSection);
