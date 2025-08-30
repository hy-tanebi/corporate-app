"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { BlogPageClient } from "./blog-page-client";
import { RecruitmentContent } from "./recruitment-content";
import { type BlogPost } from "@/lib/microcms";

interface BlogTabsProps {
  initialPosts: BlogPost[];
}

export function BlogTabs({ initialPosts }: BlogTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "blog");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === "blog") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    
    const newURL = params.toString() ? `/blog?${params.toString()}` : "/blog";
    router.replace(newURL, { scroll: false });
  };

  return (
    <div className="min-h-screen">
      {/* FV (First View) - 固定ヘッダー */}
      <section className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-700 dark:via-purple-700 dark:to-blue-900">
          {/* 仮の背景パターン */}
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white dark:bg-gray-200 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-16 w-24 h-24 bg-yellow-300 dark:bg-yellow-400 rounded-full blur-lg"></div>
            <div className="absolute bottom-16 left-1/3 w-40 h-40 bg-purple-300 dark:bg-purple-400 rounded-full blur-2xl"></div>
          </div>
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              ブログ & 募集要項
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl">
              技術的な知見やプロジェクトの学習記録、そして一緒に働く仲間の募集について
            </p>
          </div>
        </div>
      </section>

      {/* タブナビゲーション */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-0">
            <button
              onClick={() => handleTabChange("blog")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "blog"
                  ? "border-blue-500 text-blue-600 dark:text-gray-900 bg-blue-50 dark:bg-white"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-white"
              }`}
            >
              ブログ
            </button>
            <button
              onClick={() => handleTabChange("recruitment")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "recruitment"
                  ? "border-blue-500 text-blue-600 dark:text-gray-900 bg-blue-50 dark:bg-white"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-white"
              }`}
            >
              募集要項
            </button>
          </nav>
        </div>
      </section>

      {/* タブコンテンツ */}
      <section className="flex-1">
        {activeTab === "blog" && <BlogPageClient initialPosts={initialPosts} hideHeader />}
        {activeTab === "recruitment" && <RecruitmentContent />}
      </section>
    </div>
  );
}