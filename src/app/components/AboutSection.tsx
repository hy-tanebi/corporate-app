"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import AboutThreeImage from "./AboutThreeImage";

export default function AboutSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // 画面サイズ
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
    handleScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 1. テキストスクロール (0.0 - 0.4)
  const maxScrollProgress = 0.4;
  const horizontalProgress = Math.min(scrollProgress / maxScrollProgress, 1);
  const titleTranslateX = 100 - horizontalProgress * 250;

  // 2. 円形ワイプ (0.4 - 0.7)
  const circleStart = 0.4;
  const circleEnd = 0.7;
  const rawCircleProgress = (scrollProgress - circleStart) / (circleEnd - circleStart);
  const circleProgress = Math.max(0, Math.min(1, rawCircleProgress));

  const maxRadius = Math.sqrt(dimensions.width ** 2 + dimensions.height ** 2) * 1.2;
  const circleRadius = circleProgress * maxRadius;

  // 3. プロフィールコンテンツ表示 (0.7 - 1.0)
  const contentStart = 0.65;
  const contentEnd = 0.9;
  const rawContentProgress = (scrollProgress - contentStart) / (contentEnd - contentStart);
  const contentOpacity = Math.max(0, Math.min(1, rawContentProgress));

  // "ABOUT US" テキスト用
  const repeatCount = 10;

  return (
    <div
      ref={sectionRef}
      className="w-full relative"
      style={{
        height: "500vh",
      }}
    >
        {/* SVGフィルター定義 (不可視) */}
        <svg style={{ display: 'none' }}>
            <defs>
                <filter id="distortion">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.01 0.003"
                        numOctaves="5"
                        result="nose"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="nose"
                        scale="40"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>

      {/*
        Sticky Container
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-transparent text-black">

        {/* 横スクロールテキスト (Black text) */}
        <div
          className="absolute inset-0 flex items-center whitespace-nowrap z-10 pointer-events-none"
          style={{
            transform: `translateX(${titleTranslateX}vw)`,
          }}
        >
          {Array.from({ length: repeatCount }).map((_, i) => (
            <span
              key={i}
              className="text-[8vw] md:text-[7vw] font-bold mx-8"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ABOUT US
            </span>
          ))}
        </div>

        {/* 円形ワイプ用レイヤー (Pale Green Circle) */}
        <div
          className="absolute z-10 rounded-full bg-[#C8D5CE] pointer-events-none"
          style={{
            left: dimensions.width,
            top: dimensions.height / 2,
            width: circleRadius * 2,
            height: circleRadius * 2,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* プロフィール画像 (Full Screen Background) */}
        {/* containerの外に出して全画面表示にする */}
        {/* z-20: 白い円(z-10)より上、コンテンツコンテナ(z-30)より下に配置 */}
        <div
            className="absolute inset-0 z-20 w-full h-full overflow-hidden"
            style={{
                opacity: contentOpacity,
                pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none'
            }}
        >
             <AboutThreeImage imageSrc="/images/about.png" />
        </div>

        {/* プロフィールコンテンツ (Text Overlay) */}
        {/* container内でテキスト位置を制御 */}
        <div
            className="absolute inset-0 z-30 w-full flex flex-col md:flex-row items-center justify-center pointer-events-none"
            style={{
                opacity: contentOpacity,
            }}
        >
            {/* 全体レイアウト: 画像(背景) + テキスト(右下オーバーレイ) */}
            <div className="w-full h-full relative">

                {/* 右下: テキストエリア (ポスター風タイポグラフィ) */}
                <div className="absolute bottom-0 right-0 z-10 w-full md:w-1/2 p-8 md:p-12 pr-[calc(2rem+60px)] md:pr-[calc(3rem+80px)] pb-16 flex flex-col items-end text-black pointer-events-none">
                     <h2
                        className="text-2xl md:text-5xl font-bold tracking-tighter leading-[0.9] mb-8 text-right mix-blend-difference text-white"
                        style={{ fontFamily: "'Inter', sans-serif", color: "#eae0cc" }}
                    >
                        HAYATO SUGAWARA<br/>
                        <span className="text-gray-400  md:text-3xl">Technical Director & Developer</span>
                    </h2>

                    <div className="max-w-md space-y-6 text-sm md:text-base font-medium tracking-wide leading-relaxed uppercase text-right text-white/90 mix-blend-difference" style={{ fontFamily: "'Inter', sans-serif", color: "#eae0cc" }}>
                         <p>ここにテキストが入ります。ここにテキストが入ります。ここにテキストが入ります。</p>
                        <p className="text-gray-400 text-xs mt-8">Based in IWATE</p>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}
