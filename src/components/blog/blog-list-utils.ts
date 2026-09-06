import type { BlogPost } from "@/lib/microcms";

/** HTMLタグを除去する */
export function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

/** 一覧に出す概要テキスト（120文字で打ち切り） */
export function getSummary(content: string | undefined): string {
	if (!content) return "";
	const text = stripHtml(content);
	return text.length > 120 ? `${text.substring(0, 120)}...` : text;
}

/** 読了時間（600文字/分） */
export function getReadingTime(content: string | undefined): number {
	if (!content) return 1;
	return Math.max(1, Math.ceil(stripHtml(content).length / 600));
}

/** カテゴリと検索語で記事を絞り込む */
export function filterPosts(
	posts: BlogPost[],
	query: string,
	category: string,
): BlogPost[] {
	return posts.filter((post) => {
		if (category && category !== "all") {
			if (!post.category?.includes(category)) return false;
		}
		if (query) {
			const term = query.toLowerCase();
			const titleMatch = post.title.toLowerCase().includes(term);
			const categoryMatch = post.category?.some((c) =>
				c.toLowerCase().includes(term),
			);
			const contentMatch = stripHtml(post.content).toLowerCase().includes(term);
			return titleMatch || categoryMatch || contentMatch;
		}
		return true;
	});
}

/** カテゴリ一覧を件数つきで作る（名前順） */
export function collectCategories(posts: BlogPost[]): [string, number][] {
	const map = new Map<string, number>();
	for (const post of posts) {
		for (const cat of post.category ?? []) {
			map.set(cat, (map.get(cat) || 0) + 1);
		}
	}
	return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

/** 一覧のフィルタ状態を /blog のクエリ文字列に変換する */
export function buildBlogHref(query: string, category: string): string {
	const params = new URLSearchParams();
	if (query) params.set("q", query);
	if (category && category !== "all") params.set("category", category);
	const qs = params.toString();
	return qs ? `/blog?${qs}` : "/blog";
}
