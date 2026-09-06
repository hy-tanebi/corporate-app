import type { Metadata } from "next";
import { BlogListing } from "@/components/blog/blog-listing";
import { type BlogPost, getBlogPosts } from "@/lib/microcms";
import {
	BLOG_LIST_METADATA,
	generateBreadcrumbJsonLd,
	serializeJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = BLOG_LIST_METADATA;

// 絞り込みは searchParams を見てサーバー側で行う。
// クライアント側の useSearchParams で絞り込んでいたときは、静的プリレンダリング時に
// Suspense の fallback だけがHTMLに焼き付き、記事リンクが1本も出力されていなかった。
type BlogSearchParams = Promise<{ q?: string; category?: string }>;

export default async function BlogPage({
	searchParams,
}: {
	searchParams: BlogSearchParams;
}) {
	const { q = "", category = "all" } = await searchParams;

	let posts: BlogPost[] = [];
	let error: string | null = null;

	try {
		const blogResponse = await getBlogPosts(100);
		posts = blogResponse.contents;
	} catch (err) {
		error = "データの取得に失敗しました";
		console.error("Error fetching data:", err);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
				<div className="text-center">
					<p className="text-red-600 dark:text-red-400 text-xl mb-2">{error}</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						microCMSの設定を確認してください
					</p>
				</div>
			</div>
		);
	}

	const breadcrumbJsonLd = generateBreadcrumbJsonLd([
		{ name: "ホーム", path: "/" },
		{ name: "ブログ", path: "/blog" },
	]);

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD（< はエスケープ済み）
				dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
			/>
			<BlogListing posts={posts} query={q} category={category} />
		</>
	);
}
