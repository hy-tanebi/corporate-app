"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function AboutSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // 画面サイズ保持
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateDimensions = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  useEffect(() => {
    // 親のスクロールコンテナ取得
    const scrollContainer = sectionRef.current?.closest(".mission-scrollbar");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= 0 && rect.bottom > windowHeight) {
        const sectionScrollProgress =
          Math.abs(rect.top) / (rect.height - windowHeight);
        setScrollProgress(Math.max(0, Math.min(1, sectionScrollProgress)));
      } else if (rect.top > 0) {
        setScrollProgress(0);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    handleScroll(); // 初期チェック

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 1. テキストスクロール (0.0 - 0.4)
  // 右端(100vw)から現れ、左へ流れる
  const maxScrollProgress = 0.4;
  const horizontalProgress = Math.min(scrollProgress / maxScrollProgress, 1);
  // 開始位置: 100vw (画面右外)
  // 終了位置: -150vw (画面左外へ完全に抜けるくらい)
  const titleTranslateX = 100 - horizontalProgress * 250;

  // 2. 円形ワイプ (0.4 - 0.7)
  const circleStart = 0.4;
  const circleEnd = 0.7;
  const rawCircleProgress = (scrollProgress - circleStart) / (circleEnd - circleStart);
  const circleProgress = Math.max(0, Math.min(1, rawCircleProgress));

  // 画面右端（垂直方向は中央）中心から拡大
  // 画面全体を覆うのに十分な大きさ = 対角線 * 1.5 程度
  const maxRadius = Math.sqrt(dimensions.width ** 2 + dimensions.height ** 2) * 1.2;
  const circleRadius = circleProgress * maxRadius;

  // 3. プロフィールコンテンツ表示 (0.7 - 1.0)
  const contentStart = 0.65;
  const contentEnd = 0.9;
  const rawContentProgress = (scrollProgress - contentStart) / (contentEnd - contentStart);
  const contentOpacity = Math.max(0, Math.min(1, rawContentProgress));
  const contentTranslateY = 30 * (1 - contentOpacity); // 下からふわっと

  // 繰り返し表示する "ABOUT" の数
  const repeatCount = 10;

  return (
    <div
      ref={sectionRef}
      className="w-full relative"
      style={{
        height: "500vh", // たっぷりスクロール量をとる
      }}
    >
      {/*
        Sticky Container
        Base: Transparent (Gradient from MissionSection shows through)
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-transparent text-black">

        {/* 横スクロールテキスト (Black text on Light Gray Gradient) */}
        {/* 円が広がると（circleProgress 1.0）見えなくなるので非表示にする必要はないが、重なり順で制御 */}
        <div
          className="absolute inset-0 flex items-center whitespace-nowrap z-10 pointer-events-none"
          style={{
            transform: `translateX(${titleTranslateX}vw)`,
          }}
        >
          {Array.from({ length: repeatCount }).map((_, i) => (
            <span
              key={i}
              className="text-[8vw] md:text-[12vw] font-bold mx-8"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ABOUT US
            </span>
          ))}
        </div>

        {/* 円形ワイプ用レイヤー (White Circle) */}
        <div
          className="absolute z-20 rounded-full bg-white pointer-events-none"
          style={{
            left: dimensions.width, // 右端
            top: dimensions.height / 2, // 上下中央
            width: circleRadius * 2,
            height: circleRadius * 2,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* プロフィールコンテンツ (Black on White) */}
        {/* 円の上にのせる (z-30) */}
        {/* 最初は透明。円が広がりきった後（背景が白になった後）に表示 */}
        <div
            className="absolute inset-0 z-30 container mx-auto px-4 md:px-12 flex items-center justify-center pointer-events-none" // コンテンツ操作可能にするなら pointer-events 制御必要
            style={{
                opacity: contentOpacity,
                transform: `translateY(${contentTranslateY}px)`,
                pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none'
            }}
        >
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-black">

                {/* 左: プロフィールテキスト */}
                <div className="text-left space-y-6 order-2 md:order-1">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                        Hayato Sugawara
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 font-medium">
                        Web Technical Director / Developer
                    </p>
                    <div className="space-y-4 text-base text-gray-700 leading-relaxed font-medium">
                        <p>
                            クリエイティブとエンジニアリングの架け橋として、
                            技術的な実現可能性とデザインの美しさを両立させることをミッションとしています。
                        </p>
                        <p>
                            Next.js, TypeScript, Three.js を中心としたモダンな技術スタックを駆使し、
                            パフォーマンスとユーザー体験を最大化する実装を得意としています。
                        </p>
                        <p>
                            常に新しい技術を探求し、
                            「まだ誰も見たことのないWeb体験」を創り出すことに情熱を注いでいます。
                        </p>
                    </div>
                </div>

                {/* 右: 画像 (Ghost/Delay Effect) */}
                <div className="relative w-full aspect-[3/4] md:aspect-[4/5] group cursor-pointer">

                    {/* Ghost Layer 2 (一番後ろ: 遅れて大きくずれる) */}
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out group-hover:translate-x-8 group-hover:translate-y-2"
                        style={{ transitionDelay: "100ms", filter: "blur(2px)" }}
                    >
                         <Image
                            src="/images/profile_hayato.jpg"
                            alt="Hayato Sugawara Ghost 2"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Ghost Layer 1 (中間: 少し遅れてずれる) */}
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-60 transition-all duration-500 ease-out group-hover:translate-x-4 group-hover:-translate-y-1"
                        style={{ transitionDelay: "50ms", mixBlendMode: 'screen' }} // screenブレンドで光るような重なり
                    >
                         <Image
                            src="/images/profile_hayato.jpg"
                            alt="Hayato Sugawara Ghost 1"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Main Image (前面: 素早く少し動く) */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 ease-out group-hover:-translate-x-2 group-hover:-translate-y-2">
                        <Image
                            src="/images/profile_hayato.jpg"
                            alt="Hayato Sugawara"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
