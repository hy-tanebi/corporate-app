import type { Metadata } from "next";
import { Suspense } from "react";
import { type BlogPost, getBlogPosts } from "@/lib/microcms";
import { BLOG_LIST_METADATA } from "@/lib/seo";
import { BlogTabs } from "@/components/blog/blog-tabs";

export const metadata: Metadata = BLOG_LIST_METADATA;

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let error: string | null = null;

  try {
    const response = await getBlogPosts(100); // より多くの記事を取得して検索対象を増やす
    posts = response.contents;
  } catch (err) {
    error = "ブログ記事の取得に失敗しました";
    console.error("Error fetching blog posts:", err);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-2">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            環境変数の設定を確認してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl">読み込み中...</p>
          </div>
        </div>
      }
    >
      <BlogTabs initialPosts={posts} />
    </Suspense>
  );
}
