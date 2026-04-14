"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { BlogPost } from "@/lib/microcms";

interface BlogPageClientProps {
	initialPosts: BlogPost[];
}

// HTMLタグを除去
function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

// 概要テキスト取得
function getSummary(content: string | undefined): string {
	if (!content) return "";
	const text = stripHtml(content);
	return text.length > 120 ? `${text.substring(0, 120)}...` : text;
}

// 読了時間（600文字/分）
function getReadingTime(content: string | undefined): number {
	if (!content) return 1;
	return Math.max(1, Math.ceil(stripHtml(content).length / 600));
}

// 検索フィルタ
function filterPosts(
	posts: BlogPost[],
	query: string,
	category: string,
): BlogPost[] {
	return posts.filter((post) => {
		if (category && category !== "all") {
			if (!post.category?.includes(category)) return false;
		}
		if (query) {
			const term = query.toLowerCase();
			const titleMatch = post.title.toLowerCase().includes(term);
			const categoryMatch = post.category?.some((c) =>
				c.toLowerCase().includes(term),
			);
			const contentMatch = stripHtml(post.content)
				.toLowerCase()
				.includes(term);
			return titleMatch || categoryMatch || contentMatch;
		}
		return true;
	});
}

export function BlogPageClient({ initialPosts }: BlogPageClientProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const searchQuery = searchParams.get("q") || "";
	const selectedCategory = searchParams.get("category") || "all";

	const [localQuery, setLocalQuery] = useState(searchQuery);

	// URLパラメータ変更時にローカル状態を同期
	useEffect(() => {
		setLocalQuery(searchQuery);
	}, [searchQuery]);

	// カテゴリ一覧（件数付き）
	const categories = useMemo(() => {
		const map = new Map<string, number>();
		initialPosts.forEach((post) => {
			post.category?.forEach((cat) => {
				map.set(cat, (map.get(cat) || 0) + 1);
			});
		});
		return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	}, [initialPosts]);

	// フィルタ結果
	const filteredPosts = useMemo(
		() => filterPosts(initialPosts, localQuery, selectedCategory),
		[initialPosts, localQuery, selectedCategory],
	);

	// URL更新
	const updateURL = (query: string, category: string) => {
		const params = new URLSearchParams();
		if (query) params.set("q", query);
		if (category !== "all") params.set("category", category);
		router.replace(
			params.toString() ? `/blog?${params.toString()}` : "/blog",
			{ scroll: false },
		);
	};

	const handleSearch = (value: string) => {
		setLocalQuery(value);
		updateURL(value, selectedCategory);
	};

	const handleCategoryClick = (category: string) => {
		updateURL(localQuery, category);
	};

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
				{/* ページタイトル */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
						ブログ
					</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-12">
					{/* サイドバー: カテゴリフィルター（PC） */}
					<aside className="hidden lg:block">
						<div className="sticky top-8">
							<nav>
								<button
									type="button"
									onClick={() => handleCategoryClick("all")}
									className={`block w-full text-left text-sm py-1.5 transition-colors ${
										selectedCategory === "all"
											? "font-semibold text-gray-900 dark:text-gray-100"
											: "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
									}`}
								>
									ALL POSTS ({initialPosts.length})
								</button>
								<div className="mt-2 space-y-1">
									{categories.map(([cat, count]) => (
										<button
											type="button"
											key={cat}
											onClick={() => handleCategoryClick(cat)}
											className={`block w-full text-left text-sm py-1.5 transition-colors ${
												selectedCategory === cat
													? "font-semibold text-gray-900 dark:text-gray-100"
													: "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
											}`}
										>
											{cat} ({count})
										</button>
									))}
								</div>
							</nav>

							{/* 検索 */}
							<div className="mt-6 relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									type="text"
									placeholder="記事を検索..."
									value={localQuery}
									onChange={(e) => handleSearch(e.target.value)}
									className="pl-9 pr-8 text-sm h-9"
								/>
								{localQuery && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleSearch("")}
										className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
									>
										<X className="h-3 w-3 text-gray-500" />
									</Button>
								)}
							</div>
						</div>
					</aside>

					{/* モバイル: カテゴリpill + 検索 */}
					<div className="lg:hidden space-y-4">
						<div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
							<button
								type="button"
								onClick={() => handleCategoryClick("all")}
								className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
									selectedCategory === "all"
										? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
										: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
								}`}
							>
								ALL ({initialPosts.length})
							</button>
							{categories.map(([cat, count]) => (
								<button
									type="button"
									key={cat}
									onClick={() => handleCategoryClick(cat)}
									className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
										selectedCategory === cat
											? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
											: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
									}`}
								>
									{cat} ({count})
								</button>
							))}
						</div>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								type="text"
								placeholder="記事を検索..."
								value={localQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-9 pr-8 text-sm h-9"
							/>
							{localQuery && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleSearch("")}
									className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
								>
									<X className="h-3 w-3 text-gray-500" />
								</Button>
							)}
						</div>
					</div>

					{/* 記事リスト */}
					<main>
						{filteredPosts.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500 dark:text-gray-400">
									該当する記事が見つかりませんでした
								</p>
							</div>
						) : (
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredPosts.map((post) => (
									<BlogListItem key={post.id} post={post} />
								))}
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
}

// リスト形式の記事アイテム
function BlogListItem({ post }: { post: BlogPost }) {
	const summary = getSummary(post.content);
	const readingTime = getReadingTime(post.content);

	return (
		<article className="py-6 first:pt-0">
			<Link
				href={`/blog/${post.id}`}
				className="group block"
			>
				{/* 日付 + 読了時間 */}
				<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
					<time dateTime={post.publishedAt}>
						{new Date(post.publishedAt).toLocaleDateString("ja-JP", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</time>
					<span>・</span>
					<span>{readingTime}分で読める</span>
				</div>

				{/* カテゴリ */}
				{post.category && post.category.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mb-2">
						{post.category.map((cat) => (
							<CategoryBadge
								key={cat}
								category={cat}
								size="sm"
								linkable={false}
							/>
						))}
					</div>
				)}

				{/* タイトル */}
				<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
					{post.title}
				</h2>

				{/* 概要 */}
				{summary && (
					<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
						{summary}
					</p>
				)}
			</Link>
		</article>
	);
}
