// src/app/page.tsx
"use client";

import Link from "next/link";
import HeroCanvasClient from "@/app/components/HeroCanvasClient";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollTop / docHeight;
      setScrollProgress(Math.min(scrolled, 1));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // h1の表示タイミング（第2段階: 25-50%）
  const h1Opacity = Math.max(0, Math.min(1, (scrollProgress - 0.25) * 4));
  // ブログボタンの表示タイミング（第2段階: 25-50%、少し遅らせる）
  const buttonOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.3) * 4));


  return (
    // HeroCanvasClientが全画面表示を管理するので、単純に呼び出すだけでOK
    <HeroCanvasClient>
      {/* ===== ここから下が children として HeroCanvas に渡されます ===== */}

      {/* h1を左下に固定配置 */}
      <div
        className="fixed bottom-8 left-8 z-10 transition-all duration-1000 ease-out"
        style={{
          opacity: h1Opacity,
          transform: `translateY(${(1 - h1Opacity) * 20}px)`,
        }}
      >
        <h1 className="text-4xl font-bold text-white">My Document</h1>
      </div>

      {/* ブログボタンを右の真ん中に固定配置 */}
      <div
        className="fixed right-8 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-1000 ease-out"
        style={{
          opacity: buttonOpacity,
          transform: `translateY(-50%) translateX(${
            (1 - buttonOpacity) * 20
          }px)`,
        }}
      >
        <Link
          className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 backdrop-blur text-white gap-2 hover:bg-white/20 font-medium text-base h-12 px-6 shadow-lg"
          href="/blog"
        >
          ブログを見る
        </Link>
      </div>


      {/* スクロール可能なコンテンツエリア（透明） */}
      <div className="w-full" style={{ height: "100vh" }}>
        {/* 最後の段階用の空間 */}
      </div>

      {/* ===== ここまでが children ===== */}
    </HeroCanvasClient>
  );
}
