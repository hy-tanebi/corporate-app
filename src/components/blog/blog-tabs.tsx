"use client";

import { BlogPageClient } from "./blog-page-client";
import type { BlogPost } from "@/lib/microcms";

interface BlogTabsProps {
	initialPosts: BlogPost[];
}

export function BlogTabs({ initialPosts }: BlogTabsProps) {
	return (
		<div className="min-h-screen">
			{/* FV (First View) - 固定ヘッダー */}
			<section className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-700 dark:via-purple-700 dark:to-blue-900">
					{/* 仮の背景パターン */}
					<div className="absolute inset-0 opacity-20 dark:opacity-30">
						<div className="absolute top-10 left-10 w-32 h-32 bg-white dark:bg-gray-200 rounded-full blur-xl"></div>
						<div className="absolute top-32 right-16 w-24 h-24 bg-yellow-300 dark:bg-yellow-400 rounded-full blur-lg"></div>
						<div className="absolute bottom-16 left-1/3 w-40 h-40 bg-purple-300 dark:bg-purple-400 rounded-full blur-2xl"></div>
					</div>
				</div>

				<div className="relative h-full flex items-center justify-center text-center text-white px-4">
					<div>
						<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
							ブログ
						</h1>
						<p className="text-lg md:text-xl opacity-90 max-w-2xl">
							技術的な知見やプロジェクトの学習記録
						</p>
					</div>
				</div>
			</section>

			{/* コンテンツ */}
			<section className="flex-1">
				<BlogPageClient initialPosts={initialPosts} hideHeader />
			</section>
		</div>
	);
}
