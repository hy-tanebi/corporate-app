// src/app/components/MissionSection.tsx
"use client";

import {
	useEffect,
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
	// scrollProgress: number; // Removed - internal tracking
	isCircleFullyExpanded: boolean; // 円が拡大完了したトリガ
	// onProgressChange?: (progress: number) => void; // Removed - avoiding parent re-renders
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
	{ isCircleFullyExpanded }: MissionSectionProps,
	ref: React.Ref<MissionSidebarHandle>,
) {
	const { setIsContactVisible, setSpaceOpacity, setTransitionProgress } =
		useHeroState();
	const [isMobile, setIsMobile] = useState(false);

	// Internal Scroll Progress Ref (replaces useState to avoid re-renders)
	const scrollProgressRef = useRef(0);
	// Section Progress Tracking (Physics)
	const targetRef = useRef(0);
	const currentRef = useRef(0);
	const prevRawTargetRef = useRef(0);
	const isGoingForwardRef = useRef(true);

	// Element Refs for direct DOM manipulation
	const containerRef = useRef<HTMLDivElement>(null);
	const missionTitleRef = useRef<HTMLHeadingElement>(null);
	const technicalTextRef = useRef<HTMLParagraphElement>(null);
	const partnerTextRef = useRef<HTMLParagraphElement>(null);
	const descriptionOuterRef = useRef<HTMLDivElement>(null);
	const descriptionInnerRef = useRef<HTMLDivElement>(null);

	// Ref to track logic state without causing re-renders
	const showDescriptionStateRef = useRef(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Window Scroll Listener to update scrollProgressRef
	useEffect(() => {
		const handleWindowScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			// Prevent division by zero
			const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;
			scrollProgressRef.current = scrolled;
		};

		window.addEventListener("scroll", handleWindowScroll);
		handleWindowScroll(); // Initial check
		return () => window.removeEventListener("scroll", handleWindowScroll);
	}, []);

	// ======= 調整パラメータ（ここをいじるだけで遅くできます） =======
	const SECTION_START = isMobile ? 0.85 : 0.94;
	const SECTION_END = 0.999;

	const PROGRESS_SPEED_FORWARD = isMobile ? 5.0 : 0.25;
	const PROGRESS_SPEED_BACKWARD = isMobile ? 1.0 : 2.0;

	const SMOOTH_ALPHA = isMobile ? 0.9 : 0.08;
	const SMOOTH_ALPHA_BACKWARD = 0.3;
	const GAMMA = 1.8;

	// Animation Loop
	useEffect(() => {
		let raf = 0;
		let last = performance.now();

		const loop = (now: number) => {
			const dt = (now - last) / 1000; // 秒
			last = now;

			// --- 1. Calculate Target based on Window Scroll ---
			let rawTarget = 0;
			if (isCircleFullyExpanded) {
				rawTarget = remap01(scrollProgressRef.current, SECTION_START, SECTION_END);
			}

			// Determine direction
			if (rawTarget > prevRawTargetRef.current) {
				isGoingForwardRef.current = true;
			} else if (rawTarget < prevRawTargetRef.current) {
				isGoingForwardRef.current = false;
			}
			prevRawTargetRef.current = rawTarget;

			// Gamma correction (only forward)
			const shapedTarget = isGoingForwardRef.current
				? rawTarget ** GAMMA
				: rawTarget;

			targetRef.current = shapedTarget;

			// --- 2. Physics Simulation ---
			const tgt = targetRef.current;
			let cur = currentRef.current;

			// 差分
			const diff = tgt - cur;

			// 速度上限
			const isGoingForward = diff > 0;
			const speedLimit = isGoingForward
				? PROGRESS_SPEED_FORWARD
				: PROGRESS_SPEED_BACKWARD;
			const maxStep = speedLimit * dt;

			// 慣性
			const smoothAlpha = isGoingForward ? SMOOTH_ALPHA : SMOOTH_ALPHA_BACKWARD;
			const inertialStep = diff * smoothAlpha;

			// Step calculation
			let step =
				Math.abs(inertialStep) > maxStep
					? Math.sign(inertialStep) * maxStep
					: inertialStep;

			// Mobile optimization: direct tracking
			if (isMobile) {
				step = diff;
			}

			cur += step;
			currentRef.current = cur;

			// --- 3. Render / Update DOM ---
			// Calculate derived values
			const showMission = cur >= 0.15;
			const showCreative = cur >= 0.3;
			const descriptionThreshold = isMobile ? 0.75 : 0.85;
			const showDescription = cur >= descriptionThreshold;
			const showSection = isCircleFullyExpanded;
            // Note: showSection uses prop, but checking here for style updates

			// Update Container Opacity/PointerEvents
			if (containerRef.current) {
                // Opacity is simpler via class or style, but here we drive it
				const opacity = showSection ? "1" : "0";
                if(containerRef.current.style.opacity !== opacity) {
                    containerRef.current.style.opacity = opacity;
                    containerRef.current.style.pointerEvents = showSection ? "auto" : "none";
                }

                // Toggle overflow class / scrollability
                if (showDescription !== showDescriptionStateRef.current) {
                    showDescriptionStateRef.current = showDescription;
                    if (showDescription) {
                        containerRef.current.classList.remove("overflow-hidden");
                        containerRef.current.classList.add("overflow-y-auto");
                    } else {
                        containerRef.current.classList.add("overflow-hidden");
                        containerRef.current.classList.remove("overflow-y-auto");
                    }
                }
			}

			// Update MISSION Title
			if (missionTitleRef.current) {
				missionTitleRef.current.style.opacity = showMission ? "1" : "0";
				missionTitleRef.current.style.transform = `translateY(${showMission ? 0 : -20}px)`;
			}

			// Update Creative/Partner Texts (Matrix Transform)
			const zAxisProgress = easeOutCubic(
				remap01(cur, isMobile ? 0.2 : 0.3, isMobile ? 0.5 : 0.7),
			);
			const horizontalProgress = easeOutCubic(
				remap01(cur, isMobile ? 0.5 : 0.7, isMobile ? 0.7 : 0.95),
			);
			const scale = 1 + (1 - zAxisProgress) * 4;
			const baseTx = isMobile ? 65 : 104;
			const centerOffsetX = isMobile ? 5 : 10;
			const leftTx = -baseTx * horizontalProgress + centerOffsetX;
			const rightTx = +baseTx * horizontalProgress + centerOffsetX;
			const upTy = -25 * (1 - horizontalProgress);
			const dnTy = +25 * (1 - horizontalProgress);

			if (technicalTextRef.current) {
				technicalTextRef.current.style.opacity = showCreative ? "1" : "0";
				if (showCreative) {
					technicalTextRef.current.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${leftTx}, ${upTy})`;
				} else {
					technicalTextRef.current.style.transform = `matrix(5, 0, 0, 5, 0, -200)`;
				}
			}

			if (partnerTextRef.current) {
				partnerTextRef.current.style.opacity = showCreative ? "1" : "0";
				if (showCreative) {
					partnerTextRef.current.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${rightTx}, ${dnTy})`;
				} else {
					partnerTextRef.current.style.transform = `matrix(5, 0, 0, 5, 0, 200)`;
				}
			}

			// Update Description Wrappers
			if (descriptionOuterRef.current) {
				descriptionOuterRef.current.style.opacity = showDescription ? "1" : "0";
				descriptionOuterRef.current.style.transform = `translateY(${showDescription ? 0 : 30}px)`;
			}
			if (descriptionInnerRef.current) {
				// Inner wrapper duplicates the effect in original code, so valid to update both or remove one.
                // Updating both to stay 1:1 with original logic.
				descriptionInnerRef.current.style.opacity = showDescription ? "1" : "0";
				descriptionInnerRef.current.style.transform = `translateY(${showDescription ? 0 : 30}px)`;
			}

			raf = requestAnimationFrame(loop);
		};

		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [
		isCircleFullyExpanded,
		isMobile,
		SECTION_START,
		PROGRESS_SPEED_FORWARD,
		PROGRESS_SPEED_BACKWARD,
		SMOOTH_ALPHA,
	]);


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
				// Aboutセクションのスクロール進捗0.5あたりで画像が完全に表示される
				const wrapperHeight = aboutWrapperRef.current.clientHeight;
				const windowHeight = window.innerHeight;
				const targetScrollAndOffset = (wrapperHeight - windowHeight) * 0.5;

				// スムーズスクロール
				containerRef.current.scrollTo({
					top: top + targetScrollAndOffset,
					behavior: "smooth",
				});

				// Physicsを即座に完了させて、内部スクロール(overflow-y-auto)を有効化する
				currentRef.current = 1.0;
				targetRef.current = 1.0;
                // Note: DOM updates will be picked up by RAF loop next frame
			}
		},
		scrollToMission: () => {
			if (containerRef.current) {
				// 自動スクロールフラグを解除
				isAutoScrollingToContact.current = false;

				// コンタクト表示フラグを強制解除
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

				// Physicsをターゲット位置(0.95)に強制リセット
				currentRef.current = 0.95;
				targetRef.current = 0.95;
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

				// Physicsを即座に完了させる
				currentRef.current = 1.0;
				targetRef.current = 1.0;

				// しばらくしたらフラグを戻す
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

	// スクロールイベント (Inner Overlay Scroll)
	useEffect(() => {
		const container = containerRef.current;
        // showDescriptionStateRef.current is the source of truth for "active scroll listener"?
        // Wait, originally this listener was active if `showDescription` (state) was true.
        // We now rely on RAF to enable pointer events and overflow.
        // The listener is attached to container. If container has pointer-events: none, user can't scroll it?
        // But invalidation logic relies on checking `showDescription`.
		if (!container) return;

		const handleScroll = () => {
            // Check if we "should" be processing. Matches original `if (!showDescription) return`
            if (!showDescriptionStateRef.current) return;

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
				const TRANSITION_ZONE = windowHeight * (isMobile ? 2.5 : 4.0);
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
		isContactInView,
		setIsContactVisible,
		irisTransitionProgress,
		isMobile,
		updateBackgroundColor,
        // showDescription dependency is removed as we check ref inside
	]);

	// オーバーレイでのスクロールをメインウィンドウに伝播させる処理
	useEffect(() => {
		const container = containerRef.current;
        // showSection dependency check
		if (!container || !isCircleFullyExpanded) return;

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
	}, [isCircleFullyExpanded]);

	// スクロールイベント (Reset Logic)
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		if (isCircleFullyExpanded && scrollPositionRef.current > 0) {
			container.scrollTop = scrollPositionRef.current;
		}

		if (!isCircleFullyExpanded) {
			container.scrollTop = 0;
			scrollPositionRef.current = 0;

			currentRef.current = 0;
			targetRef.current = 0;
            // setSectionProgress(0); // Removed state set
			prevRawTargetRef.current = 0;
			isGoingForwardRef.current = true;
            showDescriptionStateRef.current = false; // Reset internal state ref

			gradientProgressRef.current = 0; // Ref Reset
			setIrisTransitionProgress(0);
			setIsContactInView(false);
			setIsContactVisible(false);
			setSpaceOpacity(1);
			setTransitionProgress(0);
			updateBackgroundColor(0, 0, false); // Direct Update

            // Clean up DOM styles that RAF might not catch if raf stops or loop logic depends on isCircleFullyExpanded
            if (missionTitleRef.current) { missionTitleRef.current.style.opacity = "0"; }
            // ... (RAF loop will naturally effectively zero these if running, but resetting explicitly is safer if logic pauses)
		}
	}, [
		isCircleFullyExpanded, // Replaces showSection
		setIsContactVisible,
		setSpaceOpacity,
		setTransitionProgress,
		updateBackgroundColor,
	]);

	return (
		<section
			id="mission"
			ref={containerRef}
			className="fixed inset-0 z-20 mission-scrollbar overflow-hidden" // Default class
			style={{
				opacity: isCircleFullyExpanded ? 1 : 0,
				pointerEvents: isCircleFullyExpanded ? "auto" : "none",
				transition: "opacity 0.5s ease-out",
			}}
		>
			{/* MISSION + CREATIVE THINKING エリア */}
			<div className="h-screen flex flex-col items-center justify-center gap-4 md:gap-8 px-8">
				<h2
					ref={missionTitleRef}
					className="text-6xl md:text-8xl font-bold text-white"
					style={{
						opacity: 0,
						transform: `translateY(-20px)`,
						transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
					}}
				>
					MISSION
				</h2>

				<div
					className="relative flex items-center justify-center"
					style={{
						perspective: "1000px",
						minHeight: isMobile ? 60 : 150,
						width: "100%",
					}}
				>
					<p
						ref={technicalTextRef}
						className="text-xl md:text-4xl text-white/90 font-bold absolute will-change-transform tracking-wider md:tracking-normal"
						style={{
							opacity: 0,
							transform: `matrix(5, 0, 0, 5, 0, -200)`,
							transition: "opacity 0.5s ease-out",
						}}
					>
						TECHNICAL
					</p>

					<p
						ref={partnerTextRef}
						className="text-xl md:text-4xl text-white/90 font-bold absolute will-change-transform tracking-wider md:tracking-normal"
						style={{
							opacity: 0,
							transform: `matrix(5, 0, 0, 5, 0, 200)`,
							transition: "opacity 0.5s ease-out 0.12s",
						}}
					>
						PARTNER
					</p>
				</div>
			</div>

			<div
				ref={descriptionOuterRef}
				className="w-full min-h-screen flex flex-col items-center justify-center px-0 md:px-8 py-20"
				style={{
					opacity: 0,
					transform: `translateY(30px)`,
					transition: "opacity 1s ease-out, transform 1s ease-out",
				}}
			>
				<div className="max-w-4xl mx-auto px-0 md:px-4 w-full">
					<div className="flex flex-col gap-6">
						{/* MissionContentコンポーネント */}
						<div
							ref={descriptionInnerRef}
							style={{
								opacity: 0,
								transform: `translateY(30px)`,
								transition: "opacity 1s ease-out, transform 1s ease-out",
								width: "100%",
							}}
						>
							<MissionContent scrollContainerRef={containerRef} />
						</div>
					</div>
				</div>
			</div>

			<div ref={gradientRef} className="w-full h-[30vh] md:h-[30vh]" />

			<div ref={aboutWrapperRef} className="relative w-full">
				<AboutSection transitionProgress={irisTransitionProgress} />
			</div>

			<div
				ref={contactRef}
				className={`w-full flex items-center justify-center relative z-30 ${
					isMobile ? "h-[50vh]" : "h-[50vh]"
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
