import type { Metadata } from "next";
import type { BlogPost } from "./microcms";

// サイトの基本情報
const SITE_CONFIG = {
	name: "TANEBI CREATIVE タネビ クリエイティブ",
	description:
		"Next.js, TypeScript, Three.jsを使ったモダンなポートフォリオサイト",
	url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
	author: "開発者名",
	twitterHandle: "@your_twitter", // Twitter handle（オプション）
};

// HTMLタグを取り除いて説明文を生成
function extractDescription(content: string, maxLength = 160): string {
	// HTMLタグを除去
	const plainText = content.replace(/<[^>]*>/g, "");
	// 改行や連続する空白を単一スペースに変換
	const cleanText = plainText.replace(/\s+/g, " ").trim();
	// 指定文字数でカット
	if (cleanText.length <= maxLength) {
		return cleanText;
	}
	return `${cleanText.substring(0, maxLength)}...`;
}

// カテゴリ配列をキーワード文字列に変換
function generateKeywords(categories?: string[]): string {
	const baseKeywords = ["ブログ", "技術記事", "プログラミング"];
	const allKeywords = categories
		? [...baseKeywords, ...categories]
		: baseKeywords;
	return allKeywords.join(", ");
}

// ブログ記事用の動的メタデータを生成
export function generateBlogMetadata(post: BlogPost): Metadata {
	const description = extractDescription(post.content);
	const keywords = generateKeywords(post.category);
	const publishedTime = new Date(post.publishedAt).toISOString();
	const modifiedTime = new Date(post.updatedAt).toISOString();

	// 構造化データ（JSON-LD）
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: description,
		image: post.eyecatch?.url || `${SITE_CONFIG.url}/default-og-image.jpg`,
		datePublished: publishedTime,
		dateModified: modifiedTime,
		author: {
			"@type": "Person",
			name: SITE_CONFIG.author,
		},
		publisher: {
			"@type": "Organization",
			name: SITE_CONFIG.name,
			logo: {
				"@type": "ImageObject",
				url: `${SITE_CONFIG.url}/logo.png`,
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `${SITE_CONFIG.url}/blog/${post.id}`,
		},
		keywords: post.category,
	};

	return {
		title: `${post.title} | ${SITE_CONFIG.name}`,
		description: description,
		keywords: keywords,
		authors: [{ name: SITE_CONFIG.author }],

		// 基本的なメタデータ
		openGraph: {
			type: "article",
			title: post.title,
			description: description,
			url: `${SITE_CONFIG.url}/blog/${post.id}`,
			siteName: SITE_CONFIG.name,
			images: [
				{
					url: post.eyecatch?.url || `${SITE_CONFIG.url}/default-og-image.jpg`,
					width: post.eyecatch?.width || 1200,
					height: post.eyecatch?.height || 630,
					alt: post.title,
				},
			],
			publishedTime: publishedTime,
			modifiedTime: modifiedTime,
			authors: [SITE_CONFIG.author],
			tags: post.category,
		},

		// Twitter Card
		twitter: {
			card: "summary_large_image",
			site: SITE_CONFIG.twitterHandle,
			creator: SITE_CONFIG.twitterHandle,
			title: post.title,
			description: description,
			images: [post.eyecatch?.url || `${SITE_CONFIG.url}/default-og-image.jpg`],
		},

		// その他のメタデータ
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},

		// 構造化データをHTMLに埋め込む
		other: {
			"application/ld+json": JSON.stringify(jsonLd),
		},

		// Canonical URL
		alternates: {
			canonical: `${SITE_CONFIG.url}/blog/${post.id}`,
		},
	};
}

// ブログ一覧ページ用のメタデータ
export const BLOG_LIST_METADATA: Metadata = {
	title: `ブログ | ${SITE_CONFIG.name}`,
	description: "技術記事やプロジェクトについての情報を発信しています。",
	openGraph: {
		type: "website",
		title: `ブログ | ${SITE_CONFIG.name}`,
		description: "技術記事やプロジェクトについての情報を発信しています。",
		url: `${SITE_CONFIG.url}/blog`,
		siteName: SITE_CONFIG.name,
	},
	twitter: {
		card: "summary",
		site: SITE_CONFIG.twitterHandle,
		title: `ブログ | ${SITE_CONFIG.name}`,
		description: "技術記事やプロジェクトについての情報を発信しています。",
	},
	alternates: {
		canonical: `${SITE_CONFIG.url}/blog`,
	},
};

// サイト全体のデフォルトメタデータ
export const DEFAULT_METADATA: Metadata = {
	title: {
		default: SITE_CONFIG.name,
		template: `%s | ${SITE_CONFIG.name}`,
	},
	description: SITE_CONFIG.description,
	keywords: "Next.js, TypeScript, React, Three.js, ポートフォリオ, 技術ブログ",
	authors: [{ name: SITE_CONFIG.author }],
	creator: SITE_CONFIG.author,
	openGraph: {
		type: "website",
		locale: "ja_JP",
		url: SITE_CONFIG.url,
		siteName: SITE_CONFIG.name,
		title: SITE_CONFIG.name,
		description: SITE_CONFIG.description,
	},
	twitter: {
		card: "summary_large_image",
		site: SITE_CONFIG.twitterHandle,
		creator: SITE_CONFIG.twitterHandle,
	},
	robots: {
		index: true,
		follow: true,
	},
	metadataBase: new URL(SITE_CONFIG.url),
};
