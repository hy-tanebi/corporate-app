// src/app/page.tsx

import Link from "next/link";
import Image from "next/image";

// HeroCanvasClientを直接インポート
import HeroCanvasClient from "@/app/components/HeroCanvasClient";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* HeroCanvasClientを直接レンダリング */}
      <HeroCanvasClient />

      <div className="relative z-10 font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="flex flex-col items-center gap-4 text-white">
            <h1 className="text-4xl font-bold">
              私のポートフォリオへようこそ！
            </h1>
          </div>

          <p className="text-white text-lg text-center max-w-lg">
            モダンなWeb開発スキルと創造性を証明するポートフォリオ兼技術ブログサイトです。
          </p>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
              href="/blog"
            >
              ブログを見る
            </Link>
          </div>
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-white">
          {/* ここにフッターの内容を記述 */}
        </footer>
      </div>
    </div>
  );
}
