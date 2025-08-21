import type { Metadata } from "next";
import { Suspense } from "react";
import { type BlogPost, getBlogPosts } from "@/lib/microcms";
import { BLOG_LIST_METADATA } from "@/lib/seo";
import { BlogPageClient } from "@/components/blog/blog-page-client";

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
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight mb-4">ブログ</h1>
				</div>
				<div className="text-center py-12">
					<p className="text-red-600 dark:text-red-400">{error}</p>
					<p className="text-sm text-gray-500 mt-2">
						環境変数の設定を確認してください
					</p>
				</div>
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight mb-4">ブログ</h1>
				</div>
				<div className="text-center py-12">
					<p className="text-gray-600 dark:text-gray-400">
						まだブログ記事がありません
					</p>
				</div>
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight mb-4">ブログ</h1>
						<p className="text-gray-600 dark:text-gray-400">
							技術的な知見や学習記録を発信しています
						</p>
					</div>
					<div className="text-center py-12">
						<p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
					</div>
				</div>
			}
		>
			<BlogPageClient initialPosts={posts} />
		</Suspense>
	);
}
