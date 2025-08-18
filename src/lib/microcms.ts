import { createClient } from "microcms-js-sdk";

// 開発環境でのみエラーを投げる（本番ビルド時はワーニングのみ）
const isDev = process.env.NODE_ENV === 'development';

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
	const message = "MICROCMS_SERVICE_DOMAIN is required";
	if (isDev) {
		throw new Error(message);
	} else {
		console.warn(message);
	}
}

if (!process.env.MICROCMS_API_KEY) {
	const message = "MICROCMS_API_KEY is required";
	if (isDev) {
		throw new Error(message);
	} else {
		console.warn(message);
	}
}

if (!process.env.MICROCMS_BLOG_API_ID) {
	const message = "MICROCMS_BLOG_API_ID is required";
	if (isDev) {
		throw new Error(message);
	} else {
		console.warn(message);
	}
}

// 環境変数が設定されている場合のみクライアントを作成
export const client = process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_API_KEY 
	? createClient({
			serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
			apiKey: process.env.MICROCMS_API_KEY,
		})
	: null;

// ブログ記事の型定義
export interface BlogPost {
	id: string;
	title: string;
	content: string;
	category?: string[]; // microCMSではカテゴリーが文字列配列で返される
	eyecatch?: {
		url: string;
		width: number;
		height: number;
	};
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	revisedAt: string;
}

// microCMSのレスポンス型
export interface BlogPostsResponse {
	contents: BlogPost[];
	totalCount: number;
	offset: number;
	limit: number;
}

// ブログ記事一覧を取得
export const getBlogPosts = async (
	limit = 12,
	offset = 0,
): Promise<BlogPostsResponse> => {
	if (!client || !process.env.MICROCMS_BLOG_API_ID) {
		throw new Error("microCMS client is not configured");
	}
	
	const response = await client.get({
		endpoint: process.env.MICROCMS_BLOG_API_ID,
		queries: {
			limit,
			offset,
			fields: "id,title,content,eyecatch,category,createdAt,updatedAt,publishedAt,revisedAt",
			depth: 1, // 関連コンテンツを展開
		},
	});
	return response;
};

// 特定のブログ記事を取得
export const getBlogPost = async (id: string): Promise<BlogPost> => {
	if (!client || !process.env.MICROCMS_BLOG_API_ID) {
		throw new Error("microCMS client is not configured");
	}
	
	const response = await client.get({
		endpoint: process.env.MICROCMS_BLOG_API_ID,
		contentId: id,
		queries: {
			fields: "id,title,content,eyecatch,category,createdAt,updatedAt,publishedAt,revisedAt",
			depth: 1, // 関連コンテンツを展開
		},
	});
	return response;
};