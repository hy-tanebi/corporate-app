import { createClient } from "microcms-js-sdk";

// 開発環境でのみエラーを投げる（本番ビルド時はワーニングのみ）
const isDev = process.env.NODE_ENV === "development";

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
export const client =
	process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_API_KEY
		? createClient({
				serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
				apiKey: process.env.MICROCMS_API_KEY,
			})
		: null;

// プロフィール情報の型定義
export interface AuthorProfile {
	name: string;
	tagline: string;
	avatar: {
		url: string;
		width: number;
		height: number;
	};
}

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
	mediaType?: 'image' | 'video' | string | string[]; // メディア種別（実際のレスポンスに合わせて柔軟に）
	videoUrl?: string; // 動画URL（動画選択時のみ使用）
	isShowcase?: boolean; // 3Dカードに表示するか
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
			fields:
				"id,title,content,eyecatch,category,mediaType,videoUrl,isShowcase,createdAt,updatedAt,publishedAt,revisedAt",
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
			fields:
				"id,title,content,eyecatch,category,mediaType,videoUrl,isShowcase,createdAt,updatedAt,publishedAt,revisedAt",
			depth: 1, // 関連コンテンツを展開
		},
	});
	return response;
};

// プロフィール情報を取得
export const getAuthorProfile = async (): Promise<AuthorProfile> => {
	if (!client) {
		throw new Error("microCMS client is not configured");
	}

	const response = await client.get({
		endpoint: "author",
		queries: {
			fields: "name,tagline,avatar",
		},
	});
	return response;
};

// 練習情報の型定義（繰り返しフィールド）
export interface PracticeInfo {
	date: string; // 練習日（YYYY-MM-DD形式）
	location: string; // 練習場所
}

// 楽器の型定義（繰り返しフィールド）
export interface Instrument {
	instrumentName: string; // 楽器名
	instrumentImage?: {
		url: string;
		width: number;
		height: number;
	}; // 楽器画像
}

// 団体情報の型定義（繰り返しフィールド対応版）
export interface GroupInfo {
	id: string;
	groupName: string; // 団体名
	description: string; // 活動内容（HTML形式）
	applicationEmail: string; // 応募メール
	practiceInfo: PracticeInfo[]; // 練習情報（繰り返しフィールド）
	instruments: Instrument[]; // 楽器（繰り返しフィールド）
	publishedAt: string;
	createdAt: string;
	updatedAt: string;
}

// 団体情報を取得
export const getGroupInfo = async (): Promise<GroupInfo> => {
	if (!client) {
		throw new Error("microCMS client is not configured");
	}

	const response = await client.get({
		endpoint: "group-info",
		queries: {
			fields: "groupName,description,applicationEmail,practiceInfo,instruments",
		},
	});
	return response;
};
