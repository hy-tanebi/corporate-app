// src/app/components/AboutSection.tsx
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleMorphImage } from "@/components/three/ParticleMorphImage";

export default function AboutSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const targetORef = useRef<HTMLSpanElement>(null);
  const [circleCenter, setCircleCenter] = useState({ x: 0, y: 0 });
  const [circleCenterInitialized, setCircleCenterInitialized] = useState(false);

  useEffect(() => {
    // 親のスクロールコンテナを取得
    const scrollContainer = sectionRef.current?.closest(".mission-scrollbar");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // セクションが画面の上部に到達したかチェック
      if (rect.top <= 0 && rect.bottom > windowHeight) {
        // セクション内でのスクロール進捗を計算
        const sectionScrollProgress =
          Math.abs(rect.top) / (rect.height - windowHeight);
        const clampedProgress = Math.max(0, Math.min(1, sectionScrollProgress));

        setScrollProgress(clampedProgress);

        // 8個目の "O" の位置を常に更新（横スクロールで位置が変わるため）
        if (targetORef.current) {
          const oRect = targetORef.current.getBoundingClientRect();
          setCircleCenter({
            x: oRect.left + oRect.width / 2,
            y: oRect.top + oRect.height / 2,
          });
          if (!circleCenterInitialized && clampedProgress > 0.5) {
            setCircleCenterInitialized(true);
          }
        }
      } else if (rect.top > 0) {
        // セクションより上にスクロールした場合はリセット
        setScrollProgress(0);
        setCircleCenterInitialized(false);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [circleCenterInitialized]);

  // タイトルの横移動量（右から左へ）
  // progress 0 → 右端から開始（100vw）
  // progress 0.4 → 8個目が画面中央に来る位置で停止
  const maxProgress = 0.4; // 横スクロールの最大進捗
  const horizontalProgress = Math.min(scrollProgress / maxProgress, 1);
  const titleTranslateX = 100 - horizontalProgress * 300;

  // 円の拡大アニメーション進捗（0.4〜0.85の範囲で0→1にマップ）
  // さらにゆっくり拡大するように範囲を広げる（45%の範囲）
  const circleStartProgress = 0.4;
  const circleEndProgress = 0.85;
  const circleProgress = Math.max(
    0,
    Math.min(
      1,
      (scrollProgress - circleStartProgress) /
        (circleEndProgress - circleStartProgress)
    )
  );

  // 円のサイズ（画面対角線の150%まで拡大）
  const maxDimension =
    Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) * 1.5;
  const circleRadius = circleProgress * maxDimension;

  // 詳細コンテンツの表示進捗（0.85〜1.0の範囲で0→1にマップ）
  const detailStartProgress = 0.85;
  const detailProgress = Math.max(
    0,
    Math.min(
      1,
      (scrollProgress - detailStartProgress) / (1 - detailStartProgress)
    )
  );

  // パーティクルモーフィングの進捗
  // 0.4〜0.85の範囲で0→1にマップ
  // 0.4以前: ABOUT USテキストが横スクロール
  // 0.4〜0.85: 光の流体からカード状に変化
  const particleStartProgress = 0.4;
  const particleEndProgress = 0.85;
  const particleProgress = Math.max(
    0,
    Math.min(
      1,
      (scrollProgress - particleStartProgress) /
        (particleEndProgress - particleStartProgress)
    )
  );

  // 繰り返し表示する "ABOUT" の数
  const repeatCount = 10;

  return (
    <div
      ref={sectionRef}
      className="w-full relative"
      style={{
        height: "500vh", // 300vh → 500vh に増やしてよりゆっくりに
      }}
    >
      {/* 固定表示エリア */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        {/* Three.js Canvas: パーティクルモーフィング */}
        {scrollProgress >= particleStartProgress && scrollProgress < 1.0 && (
          <div className="absolute inset-0 z-20">
            <Canvas
              camera={{ position: [0, 0, 10], fov: 50 }}
              gl={{ alpha: true, antialias: true }}
            >
              <Suspense fallback={null}>
                <ParticleMorphImage
                  imagePath="/images/profile_hayato.JPG"
                  progress={particleProgress}
                  particleCount={15000}
                  cardWidth={4}
                  cardHeight={5}
                />
              </Suspense>
            </Canvas>
          </div>
        )}
        {/* 横スクロールする "ABOUT" の繰り返し */}
        <div
          className="flex items-center whitespace-nowrap relative z-10"
          style={{
            transform: `translateX(${titleTranslateX}vw)`,
            opacity:
              circleProgress > 0.5 ? 1 - (circleProgress - 0.5) / 0.5 : 1,
          }}
        >
          {Array.from({ length: repeatCount }).map((_, i) => {
            // 8個目の "ABOUT" の "O" にrefを付ける
            if (i === 7) {
              return (
                <span
                  key={i}
                  className="text-[8vw] md:text-[12vw] font-bold text-black mx-8 inline-flex"
                >
                  AB
                  <span ref={targetORef} className="inline-block">
                    O
                  </span>
                  UT
                </span>
              );
            }
            return (
              <span
                key={i}
                className="text-[8vw] md:text-[12vw] font-bold text-black mx-8"
              >
                ABOUT US
              </span>
            );
          })}
        </div>

        {/* 円形拡大エフェクト（Oの文字から拡大） */}
        {circleCenterInitialized && (
          <div
            className="absolute rounded-full z-20 pointer-events-none"
            style={{
              left: `${circleCenter.x}px`,
              top: `${circleCenter.y}px`,
              width: `${circleRadius * 2}px`,
              height: `${circleRadius * 2}px`,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 100%)",
              opacity: circleProgress > 0 ? 1 : 0,
              transition: "opacity 0.2s ease-out",
            }}
          />
        )}
      </div>
    </div>
  );
}
