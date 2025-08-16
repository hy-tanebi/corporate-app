import { createClient } from "microcms-js-sdk";

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
	throw new Error("MICROCMS_SERVICE_DOMAIN is required");
}

if (!process.env.MICROCMS_API_KEY) {
	throw new Error("MICROCMS_API_KEY is required");
}

if (!process.env.MICROCMS_BLOG_API_ID) {
	throw new Error("MICROCMS_BLOG_API_ID is required");
}

export const client = createClient({
	serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
	apiKey: process.env.MICROCMS_API_KEY,
});

// ブログ記事の型定義
export interface BlogPost {
	id: string;
	title: string;
	content: string;
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
	const response = await client.get({
		endpoint: process.env.MICROCMS_BLOG_API_ID!,
		queries: {
			limit,
			offset,
		},
	});
	return response;
};

// 特定のブログ記事を取得
export const getBlogPost = async (id: string): Promise<BlogPost> => {
	const response = await client.get({
		endpoint: process.env.MICROCMS_BLOG_API_ID!,
		contentId: id,
	});
	return response;
};