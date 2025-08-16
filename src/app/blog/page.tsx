import Image from "next/image";
import Link from "next/link";
import { getBlogPosts, type BlogPost } from "@/lib/microcms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BlogPage() {
	let posts: BlogPost[] = [];
	let error: string | null = null;

	try {
		const response = await getBlogPosts(16); // PC 4x4 で16記事表示
		posts = response.contents;
	} catch (err) {
		error = "ブログ記事の取得に失敗しました";
		console.error("Error fetching blog posts:", err);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-4">ブログ</h1>
				<p className="text-gray-600 dark:text-gray-400">
					技術的な知見や学習記録を発信しています
				</p>
			</div>

			{error ? (
				<div className="text-center py-12">
					<p className="text-red-600 dark:text-red-400">{error}</p>
					<p className="text-sm text-gray-500 mt-2">
						環境変数の設定を確認してください
					</p>
				</div>
			) : posts.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-600 dark:text-gray-400">
						まだブログ記事がありません
					</p>
				</div>
			) : (
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
					{posts.map((post) => (
						<Link key={post.id} href={`/blog/${post.id}`}>
							<Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
								{post.eyecatch && (
									<div className="relative aspect-video overflow-hidden rounded-t-lg">
										<Image
											src={post.eyecatch.url}
											alt={post.title}
											fill
											className="object-cover"
											sizes="(max-width: 1024px) 50vw, 25vw"
										/>
									</div>
								)}
								<CardHeader className="pb-3">
									<CardTitle className="text-sm lg:text-base line-clamp-2">
										{post.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<time 
										className="text-xs text-gray-500 dark:text-gray-400"
										dateTime={post.publishedAt}
									>
										{new Date(post.publishedAt).toLocaleDateString("ja-JP", {
											year: "numeric",
											month: "2-digit",
											day: "2-digit",
										})}
									</time>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}