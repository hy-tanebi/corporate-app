"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogSearch } from "./blog-search";
import { BlogCard } from "./blog-card";
import type { BlogPost } from "@/lib/microcms";

interface BlogPageClientProps {
  initialPosts: BlogPost[];
  hideHeader?: boolean;
}

export function BlogPageClient({ initialPosts, hideHeader = false }: BlogPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(initialPosts);

  // URLパラメータから初期値を取得
  const initialSearchQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";

  // URL状態管理
  const updateURL = (searchQuery: string, category: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category !== "all") params.set("category", category);

    const newURL = params.toString() ? `/blog?${params.toString()}` : "/blog";

    router.replace(newURL, { scroll: false });
  };

  // 検索クエリ変更時
  const handleSearchQueryChange = (query: string) => {
    const category = searchParams.get("category") || "all";
    updateURL(query, category);
  };

  // カテゴリ変更時
  const handleCategoryChange = (category: string) => {
    const query = searchParams.get("q") || "";
    updateURL(query, category);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {!hideHeader && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">ブログ</h1>
            <p className="text-gray-600 dark:text-gray-400">
              技術的な知見や学習記録を発信しています
            </p>
          </div>
        )}

      {/* 検索機能 */}
      <div className="mb-8 sm:mb-14">
        <BlogSearch
          posts={initialPosts}
          onFilteredResults={setFilteredPosts}
          searchQuery={initialSearchQuery}
          selectedCategory={initialCategory}
          onSearchQueryChange={handleSearchQueryChange}
          onCategoryChange={handleCategoryChange}
        />
      </div>

        {/* 記事一覧 */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              検索条件に一致する記事が見つかりませんでした
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              検索キーワードやフィルタを変更してお試しください
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
