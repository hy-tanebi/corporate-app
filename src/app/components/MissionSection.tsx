// src/app/components/MissionSection.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
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
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function MissionSection({
  scrollProgress,
  isCircleFullyExpanded,
  onProgressChange,
}: MissionSectionProps, ref: React.Ref<MissionSidebarHandle>) {
  const { setIsContactVisible, setSpaceOpacity, setTransitionProgress } = useHeroState();
  const [isMobile, setIsMobile] = useState(false);

  // Section Progress State (moved to top to avoid ReferenceError)
  const [sectionProgress, setSectionProgress] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
  const showDescription = sectionProgress >= (isMobile ? 0.75 : 0.97);

  // グラデーション遷移セクションのスクロール進捗を追跡
  const [gradientProgress, setGradientProgress] = useState(0);
  // Aboutセクションの終わり際でトリガーするTransition進捗
  const [irisTransitionProgress, setIrisTransitionProgress] = useState(0);
  const [isContactInView, setIsContactInView] = useState(false);

  const gradientRef = useRef<HTMLDivElement>(null);
  const aboutWrapperRef = useRef<HTMLDivElement>(null); // AboutSectionを囲うラッパー
  const contactRef = useRef<HTMLDivElement>(null);
  const contactTitleRef = useRef<HTMLHeadingElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
            behavior: "smooth"
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

            // 背景状態を強制リセット (グレー画面を防ぐ)
            setGradientProgress(0);
            setIrisTransitionProgress(0);
            setSpaceOpacity(1);
            setTransitionProgress(0);

            // グレー背景(gradientProgress)を即座にリセットするために auto
            containerRef.current.scrollTo({
                top: 0,
                behavior: "auto"
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
                behavior: "smooth"
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
    }
  }));

  // 最終的な背景色を計算（黒→薄いグレー→透明）
  const calculateFinalBackgroundColor = useCallback(
    (progress1: number, irisProgress: number, contactInView: boolean) => {
      // Contactが表示されている、またはIris遷移が完了している場合は完全に透明（宇宙を表示）
      if (contactInView || irisProgress >= 1) return "rgba(0, 0, 0, 0)";

      const clampedProgress1 = Math.max(0, Math.min(1, progress1));
      // User request: About section (text flow) needs white background.
      // Reverting to 235 (Light Gray/White).
      const TARGET_GRAY = 235;

      // メインカラー（進捗に応じて黒→グレー）
      // Iris遷移が進むにつれて黒（0）に近づける
      const irisFactor = Math.max(0, Math.min(1, irisProgress));
      const colorValue = Math.round(clampedProgress1 * TARGET_GRAY * (1 - irisFactor));

      // 不透明度（Iris遷移が進むにつれて透明にしていく）
      // irisProgress: 0 (Mission/About) -> 1 (Space/Contact)
      // alpha: 1 -> 0
      const alpha = 1 - irisFactor;

      return `rgba(${colorValue}, ${colorValue}, ${colorValue}, ${alpha})`;
    },
    []
  );

  useEffect(() => {
    // 戻ってくるときのためにProgressを共有
    setTransitionProgress(irisTransitionProgress);

    // Space Opacityは常に1 (マスクで隠したり見せたりする)
    setSpaceOpacity(1);
  }, [irisTransitionProgress, setSpaceOpacity, setTransitionProgress]);

  // タイトル制御 (Mission, Contact) -> Scroll Event側に統合しました。
  // 古いuseEffectは削除済み。

  // スクロールイベント
  useEffect(() => {
    const container = containerRef.current;
    if (!showDescription || !container) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const currentScrollTop = container.scrollTop;

      // 手動スクロール検知：上方向にスクロールしたら強制フラグを解除
      if (isAutoScrollingToContact.current && currentScrollTop < lastScrollTopRef.current - 5) {
          // -5は微小なバウンスでの誤検知防止
          isAutoScrollingToContact.current = false;
      }
      lastScrollTopRef.current = currentScrollTop;

      // Gradient 1 (黒→白)
      if (gradientRef.current) {
        const rect = gradientRef.current.getBoundingClientRect();
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          const sectionHeight = rect.height;
          const scrolled = windowHeight - rect.top;
          // 0~1 の線形進行
          const rawProgress = Math.max(0, Math.min(1, scrolled / (sectionHeight + windowHeight)));

          // User request: Mission content remaining Black, About becoming White.
          // Delay the fade so it stays black longer, then fades to white near the end (About).
          // 0.0 -> 0.5: Black
          // 0.5 -> 1.0: Fade to White
          const delayedProgress = Math.max(0, (rawProgress - 0.5) * 2);

          setGradientProgress(delayedProgress);
        } else if (rect.top > windowHeight) {
            // 画面より下にある場合は 0 にリセット
            setGradientProgress(0);
        } else {
             // 画面より上にある場合（通り過ぎた後）は 1 を維持
             setGradientProgress(1);
        }
      }
      // === Iris Transition Logic ===
      // About Wrapperがある場合、その「最後尾」に近づいたらIrisを閉じる
      if (aboutWrapperRef.current) {
        const rect = aboutWrapperRef.current.getBoundingClientRect();
        // User feedback: "Closing was better before (slower)".
        // Reverting to 10.0 (slow) but relied on AboutSection's updated shrinkPhase to ensure darkness is seen.
        const TRANSITION_ZONE = windowHeight * 10.0;

        const distFromBottom = rect.bottom - windowHeight;

        if (distFromBottom <= TRANSITION_ZONE && distFromBottom >= 0) {
            // Zone内: 0 -> 1 (Easing applied for smoother space movement)
            const linearP = 1 - (distFromBottom / TRANSITION_ZONE);
            // Use Ease-in-out for smooth start and smooth end
            const p = easeInOutCubic(linearP);
            setIrisTransitionProgress(p);
        } else if (distFromBottom < 0) {
            setIrisTransitionProgress(1);
        } else {
            setIrisTransitionProgress(0);
        }
      }

      // Contact Section Visibility Check & Title Animation
      if (contactRef.current) {
        const rect = contactRef.current.getBoundingClientRect();
        const isVisible = rect.top < windowHeight * 0.8;

        const effectiveIsVisible = isAutoScrollingToContact.current ? true : isVisible;

        if (effectiveIsVisible !== isContactInView) {
          setIsContactInView(effectiveIsVisible);
          setIsContactVisible(effectiveIsVisible);
        }

        // Title Animation: Triggered (CSS transition) instead of Scroll-Linked (JS)
        // "ふわっと" 表示させるため、ある地点を超えたら opacity 1, translate 0 にする
        if (contactTitleRef.current) {
             const startOffset = windowHeight * 0.85; // 画面内に15%入ったら開始

             if (rect.top < startOffset) {
                 // Trigger Animation - Long duration (1.5s) and large distance for "fuwatto" (floating) feel
                 contactTitleRef.current.style.opacity = "1";
                 contactTitleRef.current.style.transform = "translateY(0)";
                 contactTitleRef.current.style.transition = "opacity 1.5s ease-out, transform 1.5s ease-out";
             } else {
                 // Reset
                 contactTitleRef.current.style.opacity = "0";
                 contactTitleRef.current.style.transform = "translateY(100px)"; // Increased to 100px
                 contactTitleRef.current.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
             }
        }
      }

      // === Title Logic (Sync with Scroll) ===
      if (document.title) {
          // Contact判定
          if (isContactInView) {
              if (!document.title.startsWith("CONTACT")) {
                   document.title = "CONTACT | TANEBI CREATIVE タネビ クリエイティブ";
              }
          } else if (aboutWrapperRef.current) {
              const rect = aboutWrapperRef.current.getBoundingClientRect();
              // Aboutセクションが画面の半分より上に来たら About Title
              // = Missionエリアから出たとみなす
              // 逆に戻ったときは Mission Title
              if (rect.top < windowHeight * 0.5) {
                   // AboutSection側で scrollProgress > 0 で設定されるが、
                   // こちらでも明示的にAboutとしても良いし、任せても良い。
                   // ただし「Missionに戻ったとき」即座に判定したいので、
                   // 「Missionエリアである」判定をここで行う。

                   // 何もしない（AboutSection任せ、または既にAboutになっている）
              } else {
                   // Missionエリアに戻ってきた
                   // AboutへのTransition中でなければ Mission
                   if (irisTransitionProgress <= 0) {
                        if (!document.title.startsWith("MISSION")) {
                            document.title = "MISSION | TANEBI CREATIVE タネビ クリエイティブ";
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
  }, [showDescription, isContactInView, setIsContactVisible, irisTransitionProgress]);
  // オーバーレイでのスクロールをメインウィンドウに伝播させる処理（スマホでの「戻る」を安定させる）
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !showSection) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
    };

    // RAFを使ったスロットリング用フラグ
    let isScrolling = false;

    const handleTouchMove = (e: TouchEvent) => {
        if (isScrolling) return;

        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;

        // 上端にいて、さらに下に引っ張ろうとしている（＝上に戻ろうとしている）場合
        if (container.scrollTop <= 0 && deltaY > 0) {
            isScrolling = true;
            requestAnimationFrame(() => {
                // メインウィンドウをスクロール（動きを少し滑らかにするために係数を調整）
                window.scrollBy(0, -deltaY * 1.5);
                isScrolling = false;
            });

            // デフォルト動作を防ぐ（オーバースクロールエフェクト防止等）
            if (e.cancelable) e.preventDefault();
        }
        touchStartY = touchY;
    };

    // PC/トラックパッド対応
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

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    // wheelイベントはpassive: falseでないとpreventDefaultできないが、
    // ここでは単純なscrollBy呼び出しのみ行うため、passive: trueでも動作はするが
    // トラックパッドの「戻る」ジェスチャ等が暴発しないよう注意が必要。
    // 安全のため passive: false を維持。
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('wheel', handleWheel);
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

      // 内部物理演算の状態もリセット
      currentRef.current = 0;
      targetRef.current = 0;
      setSectionProgress(0);
      prevRawTargetRef.current = 0;
      isGoingForwardRef.current = true;

      setGradientProgress(0);
      setIrisTransitionProgress(0);
      setIsContactInView(false);
      setIsContactVisible(false);
      setSpaceOpacity(1);
      setTransitionProgress(0);
    }
  }, [showSection, setIsContactVisible, setSpaceOpacity, setTransitionProgress]);

  // 段階マッピング
  const zAxisProgress = easeOutCubic(remap01(sectionProgress, 0.3, 0.7));
  const horizontalProgress = easeOutCubic(remap01(sectionProgress, 0.75, 0.95));



  // matrix 用パラメータ
  const scale = 1 + (1 - zAxisProgress) * 4;

  // スマホ(768px未満)、PC共にMISSIONの幅（text-6xl/text-8xl）に合わせるよう調整
  // Mobile: 60 (微調整: 70から短縮), Desktop: 90 (微調整: 120から短縮)
  // この `baseTx` の値を変更することで、TECHNICALとPARTNERの間隔を調整できます。
  const baseTx = isMobile ? 65 : 104;

  // 全体を右（または左）にずらすためのオフセット値（正の値で右へ、負の値で左へ）
  // Mobile: 10, Desktop: 0 (必要に応じて変更してください)
  const centerOffsetX = isMobile ? 5 : 10;

  const leftTx = -baseTx * horizontalProgress + centerOffsetX;
  const rightTx = +baseTx * horizontalProgress + centerOffsetX;
  const upTy = -25 * (1 - horizontalProgress);
  const dnTy = +25 * (1 - horizontalProgress);

  // === Mask (Spaceship Transition) ===
  // 1. Shrink Phase (0 -> 0.4): 150% -> 0% (Completely closed)
  // 2. Fly Phase: Handled in AboutSection with the image itself (0.45+)

  // Math Helpers
  const shrinkPhase = Math.min(irisTransitionProgress / 0.4, 1);
  const _visibleRadius = Math.max(0, (1 - shrinkPhase) * 150);

  // const maskStyle = {
  //   maskImage: `radial-gradient(circle at 50% 50%, black ${visibleRadius}%, transparent ${visibleRadius + 0.1}%)`,
  //   WebkitMaskImage: `radial-gradient(circle at 50% 50%, black ${visibleRadius}%, transparent ${visibleRadius + 0.1}%)`,
  // };

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
            {/* MissionContentコンポーネント (Desktop: 2カラムSticky / Mobile: 1カラムStatic) */}
            <div
               style={{
                 opacity: showDescription ? 1 : 0,
                 transform: `translateY(${showDescription ? 0 : 30}px)`,
                 transition: "opacity 1s ease-out, transform 1s ease-out",
                 width: "100%"
               }}
            >
               <MissionContent scrollContainerRef={containerRef} />
            </div>


            </div>
        </div>
      </div>

      <div ref={gradientRef} className="w-full h-[100vh]" />

      {/*
         Wrapper tracking the About Section area.
         DO NOT apply mask here anymore. Mask is inside.
      */}
      <div
        ref={aboutWrapperRef}
        className="relative w-full"
      >
         <AboutSection transitionProgress={irisTransitionProgress} />
      </div>

      <div ref={contactRef} className="w-full h-screen flex items-center justify-center relative z-30">
        <h2
            ref={contactTitleRef}
            className="text-6xl md:text-8xl font-bold text-white will-change-transform" // optimizations
            style={{ opacity: 0, transform: 'translateY(100px)' }} // Initial state
        >
            CONTACT
        </h2>
      </div>

      <div className="w-full min-h-[calc(100dvh+1px)] flex items-center justify-center p-4">
        <div ref={contactFormRef} className="max-w-2xl w-full">
          <ContactFormSection />
        </div>
      </div>

      {/* Fixed Background - Masked (Correctly, since it's fixed 100vh) */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundColor: calculateFinalBackgroundColor(
            gradientProgress,
            irisTransitionProgress,
            isContactInView
          ),
          transition: "background-color 0.6s ease-out",
          // Removed opacity toggle to fix whitening issue
          // ...maskStyle // 削除: 二重マスクの原因となるため
        }}
      />
    </section>
  );
}

export default forwardRef(MissionSection);

