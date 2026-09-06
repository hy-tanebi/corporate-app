import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/microcms";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tanebi-net.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// 静的ページ。
	// lastModified に new Date()（＝ビルド時刻）を使わないこと。
	// 中身を変えていないページまで毎デプロイ「更新した」と申告することになり、
	// クローラから見た更新日の信頼性が落ちる。
	// ページの内容を実際に書き換えたときに、ここの日付も更新すること。
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: SITE_URL,
			lastModified: new Date("2026-09-06"),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${SITE_URL}/service`,
			lastModified: new Date("2026-08-15"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${SITE_URL}/service/issues`,
			lastModified: new Date("2026-08-15"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		// /works は再設計中のため noindex（src/app/works/page.tsx を参照）。
		// noindex のページを sitemap に載せると Search Console で警告になるため除外している。
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
