import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TableOfContentsClient } from "@/components/blog/post-toc-client";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import {
	getAuthorProfile,
	getBlogPost,
	getBlogPosts,
	type BlogPost,
	type AuthorProfile,
} from "@/lib/microcms";
import { generateBlogMetadata } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitize";

interface BlogDetailPageProps {
	params: Promise<{ slug: string }>;
}

// 動的メタデータ生成
export async function generateMetadata({
	params,
}: BlogDetailPageProps): Promise<Metadata> {
	const { slug } = await params;

	try {
		const post = await getBlogPost(slug);
		return generateBlogMetadata(post);
	} catch (error) {
		console.error("Error generating metadata:", error);
		return {
			title: "記事が見つかりません",
			description: "指定された記事は存在しないか、削除された可能性があります。",
		};
	}
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
	const { slug } = await params;

	let post: BlogPost | null = null;
	let profile: AuthorProfile | null = null;

	try {
		[post, profile] = await Promise.all([
			getBlogPost(slug),
			getAuthorProfile().catch((err) => {
				console.warn("プロフィール取得エラー:", err);
				return null;
			}),
		]);
	} catch (err) {
		console.error("Error fetching blog post:", err);
		notFound();
	}

	if (!post) {
		notFound();
	}

	// 見出しの数をカウント（4個以上で目次を表示）
	const countHeadings = (content: string) => {
		const matches = content.match(/<h[123]/g);
		return matches ? matches.length : 0;
	};

	const shouldShowToc =
		typeof post.content === "string" && countHeadings(post.content) >= 4;

	const renderArticleBody = () => (
		<>
			<Card>
				<CardContent className="p-6 lg:p-8">
					<div
						className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-4 prose-p:leading-relaxed prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-2 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-img:rounded-lg prose-img:shadow-md prose-lg"
					>
						{typeof post.content === "string" ? (
							// biome-ignore lint/security/noDangerouslySetInnerHtml: microCMSコンテンツをDOMPurifyでサニタイズ済み
							<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
						) : (
							<pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
								{JSON.stringify(post.content, null, 2)}
							</pre>
						)}
					</div>
				</CardContent>
			</Card>

			{/* ブログ一覧に戻るリンク */}
			<div className="mt-12 text-center">
				<Link
					href="/blog"
					className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-700 bg-white dark:bg-white hover:bg-gray-50 dark:hover:bg-gray-50 transition-colors duration-200"
				>
					← ブログ一覧に戻る
				</Link>
			</div>
		</>
	);

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			{/* ヘッダー部分（常に1カラム） */}
			<nav className="mb-8">
				<div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
					<Link
						href="/"
						className="hover:text-gray-900 dark:hover:text-gray-100"
					>
						ホーム
					</Link>
					<span className="mx-2">/</span>
					<Link
						href="/blog"
						className="hover:text-gray-900 dark:hover:text-gray-100"
					>
						ブログ
					</Link>
					<span className="mx-2">/</span>
					<span className="text-gray-900 dark:text-gray-100 truncate">
						{post.title}
					</span>
				</div>
			</nav>

			<header className="mb-12 pb-12 border-b border-gray-200 dark:border-gray-700 text-center py-8">
				<div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
					<time dateTime={post.publishedAt}>
						{new Date(post.publishedAt).toLocaleDateString("ja-JP", {
							year: "numeric",
							month: "long",
							day: "numeric",
							weekday: "long",
						})}
					</time>
					{post.updatedAt !== post.publishedAt && (
						<span>
							（更新:{" "}
							{new Date(post.updatedAt)
								.toISOString()
								.split("T")[0]
								.replace(/-/g, "/")}
							）
						</span>
					)}
				</div>
				<h1 className="text-2xl lg:text-4xl font-bold tracking-tight mb-6">
					{post.title}
				</h1>
				{post.category && post.category.length > 0 && (
					<div className="flex flex-wrap justify-center gap-2">
						{post.category.map((cat) => (
							<CategoryBadge key={cat} category={cat} />
						))}
					</div>
				)}
			</header>

			{/* 本文部分 */}
			{shouldShowToc ? (
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
					<article>{renderArticleBody()}</article>
					<div className="hidden lg:block">
						<TableOfContentsClient profile={profile || undefined} />
					</div>
				</div>
			) : (
				<article className="max-w-4xl mx-auto">{renderArticleBody()}</article>
			)}
		</div>
	);
}

// 静的生成のためのパス生成
export async function generateStaticParams() {
	// ビルド時に環境変数が設定されていない場合は空配列を返す
	if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
		console.warn(
			"microCMS環境変数が設定されていません。静的パス生成をスキップします。",
		);
		return [];
	}

	try {
		const response = await getBlogPosts(100); // 最大100記事分のパスを生成
		return response.contents.map((post) => ({
			slug: post.id,
		}));
	} catch (error) {
		console.error("Error generating static params:", error);
		return [];
	}
}
