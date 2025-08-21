"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { BlogSearch } from "./blog-search";
import { type BlogPost } from "@/lib/microcms";

interface BlogPageClientProps {
	initialPosts: BlogPost[];
}

export function BlogPageClient({ initialPosts }: BlogPageClientProps) {
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
		
		const newURL = params.toString() 
			? `/blog?${params.toString()}` 
			: "/blog";
		
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
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-4">ブログ</h1>
				<p className="text-gray-600 dark:text-gray-400">
					技術的な知見や学習記録を発信しています
				</p>
			</div>

			{/* 検索機能 */}
			<div className="mb-8">
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
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
					{filteredPosts.map((post) => (
						<Link key={post.id} href={`/blog/${post.id}`}>
							<Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
								{post.eyecatch && (
									<div className="relative aspect-video overflow-hidden rounded-t-lg">
										<Image
											src={post.eyecatch.url}
											alt={post.title}
											fill
											className="object-cover"
											sizes="(max-width: 1024px) 50vw, 25vw"
										/>
									</div>
								)}
								<CardHeader className="pb-3">
									{post.category && post.category.length > 0 && (
										<div className="mb-2 flex flex-wrap gap-1">
											{post.category.map((cat, index) => (
												<CategoryBadge key={index} category={cat} size="sm" />
											))}
										</div>
									)}
									<CardTitle className="text-sm lg:text-base line-clamp-2">
										{post.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<time
										className="text-xs text-gray-500 dark:text-gray-400"
										dateTime={post.publishedAt}
									>
										{new Date(post.publishedAt)
											.toISOString()
											.split("T")[0]
											.replace(/-/g, "/")}
									</time>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}