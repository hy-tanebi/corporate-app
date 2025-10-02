import type { Metadata } from "next";
import { Suspense } from "react";
import {
	type BlogPost,
	getBlogPosts,
	type GroupInfo,
	getGroupInfo,
} from "@/lib/microcms";
import { BLOG_LIST_METADATA } from "@/lib/seo";
import { BlogTabs } from "@/components/blog/blog-tabs";

export const metadata: Metadata = BLOG_LIST_METADATA;

export default async function BlogPage() {
	let posts: BlogPost[] = [];
	let groupInfo: GroupInfo | null = null;
	let error: string | null = null;

	try {
		// 並行してデータを取得
		const [blogResponse, groupInfoResponse] = await Promise.all([
			getBlogPosts(100), // より多くの記事を取得して検索対象を増やす
			getGroupInfo(),
		]);

		posts = blogResponse.contents;
		groupInfo = groupInfoResponse;
	} catch (err) {
		error = "データの取得に失敗しました";
		console.error("Error fetching data:", err);
	}

	if (error || !groupInfo) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
				<div className="text-center">
					<p className="text-red-600 dark:text-red-400 text-xl mb-2">
						{error || "必要なデータが見つかりません"}
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						microCMSの設定を確認してください
					</p>
				</div>
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
					<div className="text-center">
						<p className="text-gray-600 dark:text-gray-400 text-xl">
							読み込み中...
						</p>
					</div>
				</div>
			}
		>
			<BlogTabs initialPosts={posts} groupInfo={groupInfo} />
		</Suspense>
	);
}
