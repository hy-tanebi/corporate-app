import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/microcms";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// 静的ページ
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: SITE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${SITE_URL}/blog`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
	];

	// 動的ページ（ブログ記事）
	let blogPages: MetadataRoute.Sitemap = [];

	try {
		const response = await getBlogPosts(100); // 最大100記事を取得
		blogPages = response.contents.map((post) => ({
			url: `${SITE_URL}/blog/${post.id}`,
			lastModified: new Date(post.updatedAt),
			changeFrequency: "monthly" as const,
			priority: 0.6,
		}));
	} catch (error) {
		console.error("Error generating sitemap for blog posts:", error);
	}

	return [...staticPages, ...blogPages];
}
