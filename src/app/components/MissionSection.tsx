// src/app/components/MissionSection.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import AboutSection from "./AboutSection";

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
  const shapedTarget = isGoingForwardRef.current ? Math.pow(rawTarget, GAMMA) : rawTarget;

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
  const [gradientProgress2, setGradientProgress2] = useState(0);
  const gradientRef = useRef<HTMLDivElement>(null);
  const gradientRef2 = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0); // スクロール位置を保存

  // グラデーション背景色を計算（黒から白へ）
  const calculateBackgroundColor = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const colorValue = Math.round(clampedProgress * 255);
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  }, []);

  // 最終的な背景色を計算（黒→白→黒）
  const calculateFinalBackgroundColor = useCallback((progress1: number, progress2: number) => {
    // progress1: 黒(0)から白(255)への遷移
    // progress2: 白(255)から黒(0)への遷移
    const clampedProgress1 = Math.max(0, Math.min(1, progress1));
    const clampedProgress2 = Math.max(0, Math.min(1, progress2));

    // progress1で黒→白
    let colorValue = Math.round(clampedProgress1 * 255);

    // progress2で白→黒（progress2が進むほど暗くなる）
    if (clampedProgress2 > 0) {
      colorValue = Math.round(255 * (1 - clampedProgress2));
    }

    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  }, []);

  // スクロールイベントでグラデーション進捗を更新（1つ目：黒→白）
  useEffect(() => {
    const container = containerRef.current;
    if (!showDescription || !container || !gradientRef.current) return;

    const handleScroll = () => {
      const gradientSection = gradientRef.current;
      if (!gradientSection) return;

      // スクロール位置を保存
      if (container) {
        scrollPositionRef.current = container.scrollTop;
      }

      const rect = gradientSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // グラデーションセクションが画面に入ってきたら進捗を計算
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const sectionHeight = rect.height;
        const scrolled = windowHeight - rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight + windowHeight)));
        setGradientProgress(progress);
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // 初期状態をチェック

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [showDescription]);

  // スクロールイベントでグラデーション進捗を更新（2つ目：白→黒）
  useEffect(() => {
    const container = containerRef.current;
    if (!showDescription || !container || !gradientRef2.current) return;

    const handleScroll = () => {
      const gradientSection2 = gradientRef2.current;
      if (!gradientSection2) return;

      const rect = gradientSection2.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // グラデーションセクション2が画面に入ってきたら進捗を計算
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const sectionHeight = rect.height;
        const scrolled = windowHeight - rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight + windowHeight)));
        setGradientProgress2(progress);
      } else if (rect.top > windowHeight) {
        // セクション2より前にスクロールした場合は0にリセット
        setGradientProgress2(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // 初期状態をチェック

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [showDescription]);

  // スクロール位置を復元
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // セクションが表示されたときにスクロール位置を復元
    if (showSection && scrollPositionRef.current > 0) {
      container.scrollTop = scrollPositionRef.current;
    }

    // セクションが非表示になったときにスクロール位置をリセット
    if (!showSection) {
      container.scrollTop = 0;
      scrollPositionRef.current = 0;
      setGradientProgress(0);
    }
  }, [showSection]);

  // 段階マッピング（ここもゆっくり化）
  const zAxisProgress = easeOutCubic(remap01(sectionProgress, 0.3, 0.7)); // 手前→0
  const horizontalProgress = easeOutCubic(remap01(sectionProgress, 0.75, 0.95)); // 左右開き

  // matrix 用パラメータ
  const scale = 1 + (1 - zAxisProgress) * 4; // 5→1
  const leftTx = -100 * horizontalProgress;
  const rightTx = +100 * horizontalProgress;
  const upTy = -25 * (1 - horizontalProgress);
  const dnTy = +25 * (1 - horizontalProgress);

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
      {/* MISSION + CREATIVE THINKING エリア（100vh） */}
      <div className="h-screen flex flex-col items-center justify-center gap-8 px-8">
        {/* タイトル */}
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

        {/* 2語 */}
        <div
          className="relative flex items-center justify-center"
          style={{ perspective: "1000px", minHeight: 150, width: "100%" }}
        >
          {/* transform は rAF で毎フレ更新 → transition は opacity のみ */}
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

      {/* 詳細テキストエリア */}
      <div
        className="w-full min-h-screen flex flex-col items-center justify-center px-8 py-20"
        style={{
          opacity: showDescription ? 1 : 0,
          transform: `translateY(${showDescription ? 0 : 30}px)`,
          transition: "opacity 1s ease-out, transform 1s ease-out",
        }}
      >
        <div className="max-w-3xl text-center">
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>{" "}
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
            ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。ここにMISSIONの詳細テキストが入ります。
          </p>
        </div>
      </div>

      {/* 背景遷移トリガーエリア（スクロールで背景を白に変える） */}
      <div
        ref={gradientRef}
        className="w-full h-[100vh]"
      />

      {/* ABOUTセクション（横スクロールアニメーション） */}
      <AboutSection />

      {/* 背景遷移トリガーエリア2（白から黒に戻す） */}
      <div
        ref={gradientRef2}
        className="w-full h-[100vh]"
      />

      {/* Contactタイトルセクション（1画面） */}
      <div className="w-full h-screen flex items-center justify-center">
        <h2 className="text-6xl md:text-8xl font-bold text-white">
          CONTACT
        </h2>
      </div>

      {/* Contactフォームセクション */}
      <div className="w-full min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full">
          <ContactFormSection />
        </div>
      </div>

      {/* 固定背景レイヤー（黒→白→黒にふわっと変化） */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundColor: calculateFinalBackgroundColor(gradientProgress, gradientProgress2),
          transition: 'background-color 0.6s ease-out'
        }}
      />
    </div>
  );
}
