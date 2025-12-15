// src/app/components/MissionSection.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import AboutSection from "./AboutSection";
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

// ユーティリティ
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const remap01 = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

export default function MissionSection({
  scrollProgress,
  isCircleFullyExpanded,
  onProgressChange,
}: MissionSectionProps) {
  const { setIsContactVisible, setSpaceOpacity, setTransitionProgress } = useHeroState();

  // ======= 調整パラメータ（ここをいじるだけで遅くできます） =======
  const SECTION_START = 0.94; // この位置から演出を開始
  const SECTION_END = 0.999; // この位置で演出を完了（区間を広げるほどゆっくり）
  const PROGRESS_SPEED_FORWARD = 0.25; // 1秒あたり最大で 0.25 しか進まない（もっと遅く→0.15 など）
  const PROGRESS_SPEED_BACKWARD = 2.0; // 戻る時の速度（通常速度）
  const SMOOTH_ALPHA = 0.08; // 慣性（追従割合）。小さいほど粘る
  const SMOOTH_ALPHA_BACKWARD = 0.3; // 戻る時の慣性（より素早く反応）
  const GAMMA = 1.8; // >1 で序盤をさらに遅く（2.2 とかでもOK）

  // 生のターゲット進捗（0→1）
  const rawTarget = useMemo(() => {
    if (!isCircleFullyExpanded) return 0;
    return remap01(scrollProgress, SECTION_START, SECTION_END);
  }, [scrollProgress, isCircleFullyExpanded]);

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
    ? Math.pow(rawTarget, GAMMA)
    : rawTarget;

  // 速度上限＋慣性つきの追従進捗（実際に描画に使う）
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const [sectionProgress, setSectionProgress] = useState(0);

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
      const step =
        Math.abs(inertialStep) > maxStep
          ? Math.sign(inertialStep) * maxStep
          : inertialStep;

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
  }, [onProgressChange]);

  // 表示フラグ
  const showSection = isCircleFullyExpanded;
  const showMission = sectionProgress >= 0.15;
  const showCreative = sectionProgress >= 0.3;
  const showDescription = sectionProgress >= 0.97; // アニメーション完了後に詳細テキストを表示

  // グラデーション遷移セクションのスクロール進捗を追跡
  const [gradientProgress, setGradientProgress] = useState(0);
  // Aboutセクションの終わり際でトリガーするTransition進捗
  const [irisTransitionProgress, setIrisTransitionProgress] = useState(0);
  const [isContactInView, setIsContactInView] = useState(false);

  const gradientRef = useRef<HTMLDivElement>(null);
  const aboutWrapperRef = useRef<HTMLDivElement>(null); // AboutSectionを囲うラッパー
  const contactRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // 最終的な背景色を計算（黒→薄いグレー→黒）
  const calculateFinalBackgroundColor = useCallback(
    (progress1: number, irisProgress: number, contactInView: boolean) => {
      if (contactInView) return "rgba(0, 0, 0, 0)";

      const clampedProgress1 = Math.max(0, Math.min(1, progress1));
      const TARGET_GRAY = 235;
      let colorValue = Math.round(clampedProgress1 * TARGET_GRAY);

      return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    },
    []
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

      // Gradient 1 (黒→白)
      if (gradientRef.current) {
        const rect = gradientRef.current.getBoundingClientRect();
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          const sectionHeight = rect.height;
          const scrolled = windowHeight - rect.top;
          const progress = Math.max(
            0,
            Math.min(1, scrolled / (sectionHeight + windowHeight))
          );
          setGradientProgress(progress);
        }
      }

      // === Iris Transition Logic ===
      // About Wrapperがある場合、その「最後尾」に近づいたらIrisを閉じる
      if (aboutWrapperRef.current) {
        const rect = aboutWrapperRef.current.getBoundingClientRect();
        // rect.bottom は画面上部からの距離
        // rect.bottom が windowHeight に近づくにつれて 0 -> 1 にしたい
        // Transition Zone: Bottomが画面下から「100vh」の位置にある間に行う
        const TRANSITION_ZONE = windowHeight * 1.5; // 1.5画面分かけて変化

        const distFromBottom = rect.bottom - windowHeight;

        if (distFromBottom <= TRANSITION_ZONE && distFromBottom >= 0) {
            // Zone内: 0 -> 1
            // dist: ZONE -> 0 => progress: 0 -> 1
            const p = 1 - (distFromBottom / TRANSITION_ZONE);
            setIrisTransitionProgress(p);
        } else if (distFromBottom < 0) {
            // 通過後: 1
            setIrisTransitionProgress(1);
        } else {
            // まだ来てない: 0
            setIrisTransitionProgress(0);
        }
      }

      // Contact Section Visibility Check
      if (contactRef.current) {
        const rect = contactRef.current.getBoundingClientRect();
        const isVisible = rect.top < windowHeight * 0.8;

        if (isVisible !== isContactInView) {
          setIsContactInView(isVisible);
          setIsContactVisible(isVisible);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [showDescription, isContactInView, setIsContactVisible]);

  // スクロール位置復元・リセット
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (showSection && scrollPositionRef.current > 0) {
      container.scrollTop = scrollPositionRef.current;
    }

    if (!showSection) {
      container.scrollTop = 0;
      scrollPositionRef.current = 0;
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
  const leftTx = -100 * horizontalProgress;
  const rightTx = +100 * horizontalProgress;
  const upTy = -25 * (1 - horizontalProgress);
  const dnTy = +25 * (1 - horizontalProgress);

  // === Mask (Iris Close) ===
  const visibleRadius = Math.max(0, (1 - irisTransitionProgress) * 150);

  const maskStyle = {
    maskImage: `radial-gradient(circle at center, black ${visibleRadius}%, transparent ${visibleRadius + 0.1}%)`,
    WebkitMaskImage: `radial-gradient(circle at center, black ${visibleRadius}%, transparent ${visibleRadius + 0.1}%)`,
  };

  return (
    <div
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
            className="text-2xl md:text-4xl text-white/90 font-bold absolute will-change-transform"
            style={{
              opacity: showCreative ? 1 : 0,
              transform: showCreative
                ? `matrix(${scale}, 0, 0, ${scale}, ${leftTx}, ${upTy})`
                : `matrix(5, 0, 0, 5, 0, -200)`,
              transition: "opacity 0.5s ease-out",
            }}
          >
            CREATIVE
          </p>

          <p
            className="text-2xl md:text-4xl text-white/90 font-bold absolute will-change-transform"
            style={{
              opacity: showCreative ? 1 : 0,
              transform: showCreative
                ? `matrix(${scale}, 0, 0, ${scale}, ${rightTx}, ${dnTy})`
                : `matrix(5, 0, 0, 5, 0, 200)`,
              transition: "opacity 0.5s ease-out 0.12s",
            }}
          >
            THINKING
          </p>
        </div>
      </div>

      <div
        className="w-full min-h-screen flex flex-col items-center justify-center px-8 py-20"
        style={{
          opacity: showDescription ? 1 : 0,
          transform: `translateY(${showDescription ? 0 : 30}px)`,
          transition: "opacity 1s ease-out, transform 1s ease-out",
        }}
      >
        <div className="max-w-3xl text-center">
             <div className="text-base md:text-lg text-white/80 leading-relaxed space-y-10">
                <p>より良い未来のために、技術を正しく実装する。...</p>
                <p>外部の委託先ではなく、社内の「IT担当」として。...</p>
                <p>AIとWebの力を活用し、ビジネスの課題を解決する。...</p>
                <p>現状のビジネスを加速させ、さらなる「推進力」を。...</p>
                <p>事業を活性化させる、確かな一助となるために。...</p>
                <p>これから生まれる新しい出会いに乾杯。</p>
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

      <div ref={contactRef} className="w-full h-screen flex items-center justify-center">
        <h2 className="text-6xl md:text-8xl font-bold text-white">CONTACT</h2>
      </div>

      <div className="w-full min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full">
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
          ...maskStyle
        }}
      />
    </div>
  );
}
