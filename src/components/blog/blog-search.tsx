"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/lib/microcms";

interface BlogSearchProps {
  posts: BlogPost[];
  onFilteredResults: (results: BlogPost[]) => void;
  searchQuery?: string;
  selectedCategory?: string;
  onSearchQueryChange?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
}

// HTMLタグを除去してプレーンテキストを取得
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 検索機能
function searchPosts(
  posts: BlogPost[],
  query: string,
  category: string
): BlogPost[] {
  if (!query && !category) return posts;

  return posts.filter((post) => {
    // カテゴリフィルタ
    if (category && category !== "all") {
      const hasCategory = post.category?.includes(category);
      if (!hasCategory) return false;
    }

    // 検索クエリフィルタ
    if (query) {
      const searchTerm = query.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchTerm);
      const categoryMatch = post.category?.some((cat) =>
        cat.toLowerCase().includes(searchTerm)
      );
      const contentMatch = stripHtml(post.content)
        .toLowerCase()
        .includes(searchTerm);

      return titleMatch || categoryMatch || contentMatch;
    }

    return true;
  });
}

export function BlogSearch({
  posts,
  onFilteredResults,
  searchQuery = "",
  selectedCategory = "all",
  onSearchQueryChange,
  onCategoryChange,
}: BlogSearchProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localSelectedCategory, setLocalSelectedCategory] =
    useState(selectedCategory);

  // 全カテゴリを取得
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    posts.forEach((post) => {
      post.category?.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [posts]);

  // 検索結果を計算
  const filteredPosts = useMemo(() => {
    return searchPosts(posts, localSearchQuery, localSelectedCategory);
  }, [posts, localSearchQuery, localSelectedCategory]);

  // 検索結果が変更されたときに親コンポーネントに通知
  useEffect(() => {
    onFilteredResults(filteredPosts);
  }, [filteredPosts, onFilteredResults]);

  // 検索クエリの変更
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchQueryChange?.(value);
  };

  // カテゴリの変更
  const handleCategoryChange = (value: string) => {
    setLocalSelectedCategory(value);
    onCategoryChange?.(value);
  };

  // 検索クリア
  const clearSearch = () => {
    setLocalSearchQuery("");
    setLocalSelectedCategory("all");
    onSearchQueryChange?.("");
    onCategoryChange?.("all");
  };

  // アクティブなフィルタがあるかチェック
  const hasActiveFilters = localSearchQuery || localSelectedCategory !== "all";

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 検索入力 */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="記事を検索..."
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* カテゴリフィルタ */}
        <div className="flex gap-2">
          <Select
            value={localSelectedCategory}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent side="bottom" align="end" sideOffset={8}>
              <SelectItem value="all">すべて</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* フィルタクリアボタン */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearSearch}>
              <X className="h-4 w-4 mr-1" />
              クリア
            </Button>
          )}
        </div>
      </div>

      {/* アクティブフィルタ表示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            選択カテゴリー:
          </span>
          {localSearchQuery && (
            <Badge variant="secondary" className="gap-1">
              検索: "{localSearchQuery}"
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleSearchChange("")}
              />
            </Badge>
          )}
          {localSelectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              カテゴリ: {localSelectedCategory}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCategoryChange("all")}
              />
            </Badge>
          )}
        </div>
      )}

      {/* 検索結果数 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {hasActiveFilters ? (
          <>
            {filteredPosts.length} 件の記事が見つかりました
            {posts.length !== filteredPosts.length &&
              ` (全 ${posts.length} 件中)`}
          </>
        ) : (
          `全 ${posts.length} 件の記事`
        )}
      </div>
    </div>
  );
}
