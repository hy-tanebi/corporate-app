import type { Metadata } from "next";

export const SITE_CONFIG = {
	name: "TANEBI CREATIVE | 岩手・奥州のWeb開発・AI活用・DX支援",
	description:
		"岩手県奥州市を拠点に、AIを活用した業務改善やDX推進、Webサイト・ECサイト制作、アプリ開発を行っています。地域の中小企業がデジタルを実務で活かせるよう支援します。",
	url: process.env.NEXT_PUBLIC_SITE_URL || "https://tanebi-net.com",
	author: "TANEBI CREATIVE",
	twitterHandle: "@tanebi_creative", // Replace with actual handle
	ogImage: "/images/ogp.png", // Default OG Image
};

export function generateKeywords(tags?: string[]): string[] {
	const baseKeywords = [
		"奥州市 AI事業者",
		"岩手県 AI導入支援",
		"奥州市 Web制作",
		"岩手県 DX支援",
		"AI業務効率化",
		"ホームページ制作 岩手",
		"TANEBI CREATIVE",
		"タネビ クリエイティブ",
	];
	return tags ? [...baseKeywords, ...tags] : baseKeywords;
}

// ブログ記事のメタデータ生成
import type { BlogPost } from "./microcms";

function extractDescription(content: string, limit = 120): string {
	if (!content) return "";
	// HTMLタグを除去
	const plainText = content.replace(/<[^>]+>/g, "");
	// 改行を除去
	const noLineBreaks = plainText.replace(/\r?\n/g, "");
	// 文字数制限
	return noLineBreaks.length > limit
		? `${noLineBreaks.substring(0, limit)}...`
		: noLineBreaks;
}

export function generateBlogMetadata(post: BlogPost): Metadata {
	const description = extractDescription(post.content);
	const keywords = generateKeywords(post.category);
	// 日付のパース時にエラーが出ないように安全策を追加
	let publishedTime = new Date().toISOString();
	let modifiedTime = new Date().toISOString();
	try {
		if (post.publishedAt)
			publishedTime = new Date(post.publishedAt).toISOString();
		if (post.updatedAt) modifiedTime = new Date(post.updatedAt).toISOString();
	} catch (e) {
		console.warn("Date parsing error in generateBlogMetadata", e);
	}

	return {
		title: post.title,
		description: description,
		keywords: keywords,
		alternates: {
			canonical: `${SITE_CONFIG.url}/blog/${post.id}`,
		},
		openGraph: {
			title: post.title,
			description: description,
			type: "article",
			publishedTime: publishedTime,
			modifiedTime: modifiedTime,
			authors: [SITE_CONFIG.author],
			tags: post.category,
			images: [
				{
					url: post.eyecatch?.url || SITE_CONFIG.ogImage,
				},
			],
		},
	};
}

// ブログ記事の構造化データ（JSON-LD / BlogPosting）生成
// Google のリッチリザルト・生成AI（AIO/LLMO）での可読性向上を目的とする
export function generateBlogJsonLd(
	post: BlogPost,
	authorName?: string,
): Record<string, unknown> {
	const description = extractDescription(post.content);
	const url = `${SITE_CONFIG.url}/blog/${post.id}`;
	const image = post.eyecatch?.url
		? post.eyecatch.url
		: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;

	// 日付のパース時にエラーが出ないように安全策を追加
	let datePublished = new Date().toISOString();
	let dateModified = new Date().toISOString();
	try {
		if (post.publishedAt)
			datePublished = new Date(post.publishedAt).toISOString();
		if (post.updatedAt) dateModified = new Date(post.updatedAt).toISOString();
	} catch (e) {
		console.warn("Date parsing error in generateBlogJsonLd", e);
	}

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description,
		image,
		datePublished,
		dateModified,
		url,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": url,
		},
		author: {
			"@type": "Person",
			name: authorName || SITE_CONFIG.author,
		},
		publisher: {
			"@type": "Organization",
			"@id": `${SITE_CONFIG.url}/#organization`,
			name: SITE_CONFIG.author,
			logo: {
				"@type": "ImageObject",
				url: `${SITE_CONFIG.url}/images/favicon.png`,
			},
		},
		...(post.category && post.category.length > 0
			? { keywords: post.category.join(", ") }
			: {}),
	};
}

export const BLOG_LIST_METADATA: Metadata = {
	title: "ブログ一覧",
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
	keywords:
		"奥州市 AI事業者, 岩手県 AI導入支援, 奥州市 Web制作, 岩手県 DX支援, AI業務効率化, ホームページ制作 岩手, TANEBI CREATIVE, タネビ クリエイティブ",
	authors: [{ name: SITE_CONFIG.author }],
	creator: SITE_CONFIG.author,
	openGraph: {
		type: "website",
		locale: "ja_JP",
		url: SITE_CONFIG.url,
		siteName: SITE_CONFIG.name,
		title: SITE_CONFIG.name,
		description: SITE_CONFIG.description,
		images: [
			{
				url: SITE_CONFIG.ogImage,
				width: 1200,
				height: 630,
				alt: SITE_CONFIG.name,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		site: SITE_CONFIG.twitterHandle,
		creator: SITE_CONFIG.twitterHandle,
		images: [SITE_CONFIG.ogImage],
	},
	robots: {
		index: true,
		follow: true,
	},
	alternates: {
		canonical: SITE_CONFIG.url,
	},
	metadataBase: new URL(SITE_CONFIG.url),
	icons: {
		icon: "/images/favicon.png",
		apple: "/images/favicon.png", // Apple touch icon (optional, using same for now)
	},
	verification: {
		google: "_MgYG4duuAQUZDGWyhM1a-HKF7WpTz_i8n-Qp9POXYw",
	},
};
