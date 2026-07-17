import { createClient } from "microcms-js-sdk";
import { getMockBlogPosts, getMockBlogPost } from "./mock-blog-data";

const useMock = process.env.USE_MOCK_BLOG === "true";

// 開発環境でのみエラーを投げる（本番ビルド時はワーニングのみ）
const isDev = process.env.NODE_ENV === "development";

if (!useMock) {
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
	mediaType?: "image" | "video" | string | string[]; // メディア種別（実際のレスポンスに合わせて柔軟に）
	videoUrl?: string; // 動画URL（動画選択時のみ使用）
	isShowcase?: boolean; // 3Dカードに表示するか
	liveUrl?: string; // ライブデモURL
	githubUrl?: string; // GitHubリポジトリURL
	techStack?: string[]; // 技術スタック
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
	if (useMock) {
		return getMockBlogPosts(limit, offset);
	}

	if (!client || !process.env.MICROCMS_BLOG_API_ID) {
		throw new Error("microCMS client is not configured");
	}

	const response = await client.get({
		endpoint: process.env.MICROCMS_BLOG_API_ID,
		queries: {
			limit,
			offset,
			fields:
				"id,title,content,eyecatch,category,mediaType,videoUrl,isShowcase,liveUrl,githubUrl,techStack,createdAt,updatedAt,publishedAt,revisedAt",
			depth: 1, // 関連コンテンツを展開
		},
	});
	return response;
};

// 特定のブログ記事を取得
export const getBlogPost = async (
	id: string,
	draftKey?: string,
): Promise<BlogPost> => {
	if (useMock) {
		const post = getMockBlogPost(id);
		if (!post) throw new Error(`Mock post not found: ${id}`);
		return post;
	}

	if (!client || !process.env.MICROCMS_BLOG_API_ID) {
		throw new Error("microCMS client is not configured");
	}

	const response = await client.get({
		endpoint: process.env.MICROCMS_BLOG_API_ID,
		contentId: id,
		queries: {
			fields:
				"id,title,content,eyecatch,category,mediaType,videoUrl,isShowcase,liveUrl,githubUrl,techStack,createdAt,updatedAt,publishedAt,revisedAt",
			depth: 1,
			...(draftKey ? { draftKey } : {}),
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
