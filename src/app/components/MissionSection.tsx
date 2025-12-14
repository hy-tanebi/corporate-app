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
  const { setIsContactVisible } = useHeroState();

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
  const [gradientProgress2, setGradientProgress2] = useState(0);
  const [isContactInView, setIsContactInView] = useState(false);

  const gradientRef = useRef<HTMLDivElement>(null);
  const gradientRef2 = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0); // スクロール位置を保存

  // グラデーション背景色を計算（黒から白へ）
  const calculateBackgroundColor = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const colorValue = Math.round(clampedProgress * 255);
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  }, []);

  // 最終的な背景色を計算（黒→薄いグレー→黒）
  const calculateFinalBackgroundColor = useCallback(
    (progress1: number, progress2: number, contactInView: boolean) => {
      // Contactビューの場合は透明にする（宇宙空間を表示）
      if (contactInView) {
        return "rgba(0, 0, 0, 0)";
      }

      // progress1: 黒(0)からグレー(235)への遷移
      // progress2: グレー(235)から黒(0)への遷移
      const clampedProgress1 = Math.max(0, Math.min(1, progress1));
      const clampedProgress2 = Math.max(0, Math.min(1, progress2));

      // ターゲット色（薄いグレー）
      const TARGET_GRAY = 235;

      // progress1で黒→グレー
      let colorValue = Math.round(clampedProgress1 * TARGET_GRAY);

      // progress2でグレー→黒（progress2が進むほど暗くなる）
      if (clampedProgress2 > 0) {
        colorValue = Math.round(TARGET_GRAY * (1 - clampedProgress2));
      }

      return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    },
    []
  );

  // ... (useEffect hooks are fine as is, just ensured triggers are uncommented below)

  // ...

  // スクロールイベントでグラデーション進捗とContact表示を更新
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

      // Gradient 2 (白→黒)
      if (gradientRef2.current) {
        const rect = gradientRef2.current.getBoundingClientRect();
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          const sectionHeight = rect.height;
          const scrolled = windowHeight - rect.top;
          const progress = Math.max(
            0,
            Math.min(1, scrolled / (sectionHeight + windowHeight))
          );
          setGradientProgress2(progress);
        } else if (rect.top > windowHeight) {
          setGradientProgress2(0);
        }
      }

      // Contact Section Visibility Check
      if (contactRef.current) {
        const rect = contactRef.current.getBoundingClientRect();
         // Contactタイトルのトップが画面の下から半分くらいまで来たら表示開始
         // 完全にフェードインさせるために、少し早めに判定
        const isVisible = rect.top < windowHeight * 0.8; // 80%の位置に来たら開始

        if (isVisible !== isContactInView) {
          setIsContactInView(isVisible);
          setIsContactVisible(isVisible);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // 初期状態をチェック

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [showDescription, isContactInView, setIsContactVisible]);

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
      setGradientProgress2(0);
      setIsContactInView(false);
      setIsContactVisible(false);
    }
  }, [showSection, setIsContactVisible]);

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
            より良い未来のために、技術を正しく実装する。
            進化するデジタル技術は、適切に扱ってこそ価値が生まれます。流行を追うのではなく、あなたの事業が目指す未来にとって、本当に必要な技術だけを選定し、導入します。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            外部の委託先ではなく、社内の「IT担当」として。
            単に依頼されたものを作るだけではありません。あなたの組織の一員と同じ目線に立ち、ビジネスの内部事情や課題を深く理解した上で、最適な技術戦略を立案します。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            AIとWebの力を活用し、ビジネスの課題を解決する。
            AIによる業務効率化も、Webによる集客も、すべては課題解決の手段です。複雑な技術を、現場で確実に成果が出る「実用的な仕組み」へと落とし込みます。
          </p>{" "}
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            現状のビジネスを加速させ、さらなる「推進力」を。
            今の事業が持つポテンシャルを阻害している要因を取り除きます。円滑なシステムと戦略的なWeb活用により、事業全体を前に進めるためのエンジンを構築します。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            事業を活性化させる、確かな一助となるために。
            技術的な支援を通じて、あなたのビジネスを持続的な成長軌道に乗せること。黒衣（くろこ）として事業の活性化を支え続けることが、私のMISSIONです。
          </p>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-10">
            これから生まれる新しい出会いに乾杯。
          </p>
        </div>
      </div>

      {/* 背景遷移トリガーエリア（スクロールで背景を白に変える） */}
      <div ref={gradientRef} className="w-full h-[100vh]" />

      {/* ABOUTセクション（横スクロールアニメーション） */}
      <AboutSection />

      {/* 背景遷移トリガーエリア2（白から黒に戻す） */}
      <div ref={gradientRef2} className="w-full h-[100vh]" />

      {/* Contactタイトルセクション（1画面） - refを追加 */}
      <div ref={contactRef} className="w-full h-screen flex items-center justify-center">
        <h2 className="text-6xl md:text-8xl font-bold text-white">CONTACT</h2>
      </div>

      {/* Contactフォームセクション */}
      <div className="w-full min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full">
          <ContactFormSection />
        </div>
      </div>

      {/* 固定背景レイヤー（黒→白→黒→透明 にふわっと変化） */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundColor: calculateFinalBackgroundColor(
            gradientProgress,
            gradientProgress2,
            isContactInView
          ),
          transition: "background-color 0.6s ease-out",
        }}
      />
    </div>
  );
}
