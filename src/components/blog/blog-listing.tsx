import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { BlogPost } from "@/lib/microcms";
import {
	buildBlogHref,
	collectCategories,
	filterPosts,
	getReadingTime,
	getSummary,
} from "./blog-list-utils";
import { BlogSearchInput } from "./blog-search-input";

interface BlogListingProps {
	posts: BlogPost[];
	query: string;
	category: string;
}

/**
 * ブログ一覧。サーバーコンポーネントとして記事リンクを初期HTMLに出す。
 *
 * 以前はクライアントコンポーネントが useSearchParams で絞り込んでいたが、
 * 静的プリレンダリング時に Suspense の fallback（「読み込み中...」）だけが
 * HTMLに焼き付き、記事リンクが1本も出力されていなかった。
 * 絞り込みは searchParams を見てサーバー側で行い、カテゴリは実リンクにしている。
 */
export function BlogListing({ posts, query, category }: BlogListingProps) {
	const categories = collectCategories(posts);
	const filteredPosts = filterPosts(posts, query, category);

	const categoryLinkClass = (isActive: boolean) =>
		`block w-full text-left text-sm py-1.5 transition-colors ${
			isActive
				? "font-semibold text-gray-900 dark:text-gray-100"
				: "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
		}`;

	const categoryPillClass = (isActive: boolean) =>
		`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
			isActive
				? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
				: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
		}`;

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
							<nav aria-label="カテゴリ">
								<Link
									href={buildBlogHref(query, "all")}
									className={categoryLinkClass(category === "all")}
								>
									ALL POSTS ({posts.length})
								</Link>
								<div className="mt-2 space-y-1">
									{categories.map(([cat, count]) => (
										<Link
											key={cat}
											href={buildBlogHref(query, cat)}
											className={categoryLinkClass(category === cat)}
										>
											{cat} ({count})
										</Link>
									))}
								</div>
							</nav>

							{/* 検索 */}
							<div className="mt-6">
								<BlogSearchInput query={query} category={category} />
							</div>
						</div>
					</aside>

					{/* モバイル: カテゴリpill + 検索 */}
					<div className="lg:hidden space-y-4">
						<div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
							<Link
								href={buildBlogHref(query, "all")}
								className={categoryPillClass(category === "all")}
							>
								ALL ({posts.length})
							</Link>
							{categories.map(([cat, count]) => (
								<Link
									key={cat}
									href={buildBlogHref(query, cat)}
									className={categoryPillClass(category === cat)}
								>
									{cat} ({count})
								</Link>
							))}
						</div>
						<BlogSearchInput query={query} category={category} />
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
			<Link href={`/blog/${post.id}`} className="group block">
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

				{/* カテゴリ。ここは記事リンクの内側なので linkable={false}（aタグの入れ子を避ける） */}
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
