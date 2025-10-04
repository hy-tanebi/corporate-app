// src/app/components/MissionSection.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface MissionSectionProps {
  scrollProgress: number; // 0〜1 の全体スクロール進捗（親から供給）
  isCircleFullyExpanded: boolean; // 円が拡大完了したトリガ
}

// ユーティリティ
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const remap01 = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

export default function MissionSection({
  scrollProgress,
  isCircleFullyExpanded,
}: MissionSectionProps) {
  // ======= 調整パラメータ（ここをいじるだけで遅くできます） =======
  const SECTION_START = 0.94; // この位置から演出を開始
  const SECTION_END = 0.999; // この位置で演出を完了（区間を広げるほどゆっくり）
  const PROGRESS_SPEED_FORWARD = 0.25; // 1秒あたり最大で 0.25 しか進まない（もっと遅く→0.15 など）
  const PROGRESS_SPEED_BACKWARD = 0.6; // 戻る時は速く（0.6 = 約2.4倍速）
  const SMOOTH_ALPHA = 0.08; // 慣性（追従割合）。小さいほど粘る
  const GAMMA = 1.8; // >1 で序盤をさらに遅く（2.2 とかでもOK）

  // 生のターゲット進捗（0→1）
  const rawTarget = useMemo(() => {
    if (!isCircleFullyExpanded) return 0;
    return remap01(scrollProgress, SECTION_START, SECTION_END);
  }, [scrollProgress, isCircleFullyExpanded]);

  // ガンマで序盤減速（ターゲット進捗に適用）
  const shapedTarget = Math.pow(rawTarget, GAMMA);

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

      // 慣性追従によるステップ
      const inertialStep = diff * SMOOTH_ALPHA;

      // 実際に適用するステップは「慣性」と「速度上限」の小さい方
      const step =
        Math.abs(inertialStep) > maxStep
          ? Math.sign(inertialStep) * maxStep
          : inertialStep;

      cur += step;
      currentRef.current = cur;
      setSectionProgress(cur);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 表示フラグ
  const showSection = isCircleFullyExpanded;
  const showMission = sectionProgress >= 0.15;
  const showCreative = sectionProgress >= 0.3;

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
      className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-8"
      style={{
        opacity: showSection ? 1 : 0,
        pointerEvents: showSection ? "auto" : "none",
        transition: "opacity 0.5s ease-out",
      }}
    >
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
  );
}
