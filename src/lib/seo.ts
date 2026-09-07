import type { Metadata } from "next";

export const SITE_CONFIG = {
	name: "TANEBI CREATIVE | 岩手・奥州のWeb開発・AI活用・DX支援",
	/** title の template とパンくずに使う短い屋号。
	 *  name をそのまま template に使うと下層ページの title が70文字超になり SERP で切れる。 */
	shortName: "TANEBI CREATIVE",
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
		// 各ページの title には屋号を書かないこと（ここで付与される）。
		// 書くと「ページ名 | TANEBI CREATIVE | TANEBI CREATIVE | …」と二重になる。
		template: `%s | ${SITE_CONFIG.shortName}`,
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
	// canonical はここに置かない。ルートレイアウトの metadata は子セグメントへ継承されるため、
	// ここで canonical を指定すると alternates を上書きしていない全ページが
	// 「正規版はトップページ」と自己申告してしまい、インデックスから外れる。
	// 各ページで自分自身の URL を alternates.canonical に指定すること。
	metadataBase: new URL(SITE_CONFIG.url),
	icons: {
		icon: "/images/favicon.png",
		apple: "/images/favicon.png", // Apple touch icon (optional, using same for now)
	},
	verification: {
		google: "_MgYG4duuAQUZDGWyhM1a-HKF7WpTz_i8n-Qp9POXYw",
	},
};

// サイト共通の構造化データ（JSON-LD / @graph）。トップページにのみ出力する。
// `@id` は他ページの JSON-LD（BlogPosting の publisher など）から参照される安定IDなので変更しないこと。
export function generateSiteJsonLd(): Record<string, unknown> {
	const url = SITE_CONFIG.url;
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": ["ProfessionalService", "LocalBusiness"],
				"@id": `${url}/#organization`,
				name: "TANEBI CREATIVE（タネビ クリエイティブ）- 奥州市のAI事業者",
				alternateName: [
					"タネビ クリエイティブ",
					"TANEBI CREATIVE",
					"奥州市 AI事業者",
				],
				url,
				image: `${url}${SITE_CONFIG.ogImage}`,
				description: SITE_CONFIG.description,
				slogan:
					"種から形へ、種火を力に。技術と対話で、事業の前進を支援します。",
				address: {
					"@type": "PostalAddress",
					addressRegion: "岩手県",
					addressLocality: "奥州市",
					addressCountry: "JP",
				},
				geo: {
					"@type": "GeoCoordinates",
					latitude: 39.1448,
					longitude: 141.1391,
				},
				areaServed: [{ "@type": "AdministrativeArea", name: "岩手県" }],
				knowsAbout: [
					"AI事業者",
					"AI導入支援",
					"AI活用コンサルティング",
					"SEO（AIO/LLMO を含む生成AI時代の検索最適化）",
					"構造化データ・コンテンツ設計",
					"岩手県内の中小企業向けDX・業務効率化支援",
					"AIを活用した集客・Webサイト制作",
					"AIによる事務作業の自動化",
					"社内情報の整理・ナレッジ共有の仕組み作り",
				],
				contactPoint: {
					"@type": "ContactPoint",
					contactType: "customer support",
					// 問い合わせはトップpage内のセクション。/contact というルートは存在しない
					url: `${url}/#contact`,
				},
			},
			{
				"@type": "WebSite",
				"@id": `${url}/#website`,
				url,
				name: SITE_CONFIG.name,
				publisher: { "@id": `${url}/#organization` },
			},
			{
				"@type": "Service",
				"@id": `${url}/#service-web`,
				name: "Web制作（SEO/AIO 対応）",
				provider: { "@id": `${url}/#organization` },
				description:
					"SEO（AIO/LLMO を含む）の基本に忠実な高品質なWebサイト制作。人間への訴求力と、検索エンジン・生成AIへの可読性を両立します。",
				areaServed: { "@type": "AdministrativeArea", name: "岩手県" },
			},
			{
				"@type": "Service",
				"@id": `${url}/#service-dx`,
				name: "AI実務活用・DX支援・SEO対応",
				provider: { "@id": `${url}/#organization` },
				description:
					"AI活用による業務効率化・DX推進サポート。LLM 活用（LLMO）の観点も含めた社内ナレッジの整理と活用を支援します。",
				areaServed: { "@type": "AdministrativeArea", name: "岩手県" },
			},
		],
	};
}

/** JSON-LD を `<script>` に埋めるための文字列化。`</script>` ブレイクアウト対策として `<` をエスケープする。 */
export function serializeJsonLd(jsonLd: Record<string, unknown>): string {
	return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

/**
 * パンくずの構造化データ。`path` はサイトルートからの相対パス（先頭スラッシュ込み）。
 * 末尾（現在地）まで含めて渡すこと。
 */
export function generateBreadcrumbJsonLd(
	items: { name: string; path: string }[],
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: `${SITE_CONFIG.url}${item.path}`,
		})),
	};
}

/**
 * /service の提供メニューの構造化データ。
 * ページ上に実際に書かれている3メニュー（Web / AI / Tools）と対応させること。
 * provider はトップページの Organization ノードを @id で参照する。
 */
export function generateServiceCatalogJsonLd(
	services: { id: string; name: string; description: string }[],
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@graph": services.map((service) => ({
			"@type": "Service",
			"@id": `${SITE_CONFIG.url}/service#${service.id}`,
			name: service.name,
			description: service.description,
			provider: { "@id": `${SITE_CONFIG.url}/#organization` },
			areaServed: { "@type": "AdministrativeArea", name: "岩手県" },
		})),
	};
}

/**
 * 下層ページ用の openGraph / twitter を組み立てる。
 *
 * Next.js の Metadata は openGraph を「親とマージ」ではなく「丸ごと置換」するため、
 * ページ側で openGraph を定義するときは images や siteName も必ず自前で持たせる必要がある。
 * ここを通さないと、下層ページのOGPがトップページのもの（og:title / og:url がトップ）のままになる。
 */
export function buildPageSocialMetadata({
	title,
	description,
	path,
	image,
}: {
	title: string;
	description: string;
	/** サイトルートからの相対パス（先頭スラッシュ込み） */
	path: string;
	/** 未指定ならサイト共通のOGP画像 */
	image?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
	const imageUrl = image ?? `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;
	return {
		openGraph: {
			type: "website",
			locale: "ja_JP",
			url: `${SITE_CONFIG.url}${path}`,
			siteName: SITE_CONFIG.name,
			title,
			description,
			images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
		},
		twitter: {
			card: "summary_large_image",
			site: SITE_CONFIG.twitterHandle,
			creator: SITE_CONFIG.twitterHandle,
			title,
			description,
			images: [imageUrl],
		},
	};
}
