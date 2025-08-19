import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts } from "@/lib/microcms";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { TableOfContentsClient } from "@/components/table-of-contents-client";

interface BlogDetailPageProps {
	params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
	const { slug } = await params;
	
	let post;
	let error: string | null = null;

	try {
		post = await getBlogPost(slug);
	} catch (err) {
		console.error("Error fetching blog post:", err);
		notFound();
	}


	if (!post) {
		notFound();
	}

	// 見出しの存在チェック用の関数
	const hasHeadings = (content: string) => {
		return /<h[123]/.test(content);
	};

	const shouldShowToc = typeof post.content === 'string' && hasHeadings(post.content);

	// 共通コンテンツを作成
	const renderContent = () => (
		<>
			{/* パンくずナビ */}
			<nav className="mb-8">
				<div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
					<Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100">
						ホーム
					</Link>
					<span className="mx-2">/</span>
					<Link href="/blog" className="hover:text-gray-900 dark:hover:text-gray-100">
						ブログ
					</Link>
					<span className="mx-2">/</span>
					<span className="text-gray-900 dark:text-gray-100 truncate">
						{post.title}
					</span>
				</div>
			</nav>

			<article>
				{/* アイキャッチ画像 */}
				{post.eyecatch && (
					<div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
						<Image
							src={post.eyecatch.url}
							alt={post.title}
							fill
							className="object-cover"
							sizes="100vw"
							priority
						/>
					</div>
				)}

				{/* 記事ヘッダー */}
				<header className="mb-8">
					<h1 className="text-2xl lg:text-4xl font-bold tracking-tight mb-4">
						{post.title}
					</h1>
					<div className="flex items-center gap-4 flex-wrap">
						{post.category && post.category.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{post.category.map((cat, index) => (
									<CategoryBadge key={index} category={cat} />
								))}
							</div>
						)}
						<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
							<time dateTime={post.publishedAt}>
								公開日: {new Date(post.publishedAt).toISOString().split('T')[0].replace(/-/g, '/')}
							</time>
							{post.updatedAt !== post.publishedAt && (
								<time dateTime={post.updatedAt}>
									更新日: {new Date(post.updatedAt).toISOString().split('T')[0].replace(/-/g, '/')}
								</time>
							)}
						</div>
					</div>
				</header>

				{/* 記事本文 */}
				<Card>
					<CardContent className="p-6 lg:p-8">
						<div className={`prose dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-4 prose-p:leading-relaxed prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-2 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-img:rounded-lg prose-img:shadow-md ${shouldShowToc ? 'prose-lg' : 'prose-xl'}`}>
							{typeof post.content === 'string' ? (
								// biome-ignore lint/security/noDangerouslySetInnerHtml: microCMSからの安全なコンテンツ
								<div dangerouslySetInnerHTML={{ __html: post.content }} />
							) : (
								<pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
									{JSON.stringify(post.content, null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>
			</article>

			{/* ブログ一覧に戻るリンク */}
			<div className="mt-12 text-center">
				<Link
					href="/blog"
					className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
				>
					← ブログ一覧に戻る
				</Link>
			</div>
		</>
	);

	if (shouldShowToc) {
		// 目次がある場合（2カラムレイアウト）
		return (
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
					<div className="max-w-4xl">
						{renderContent()}
					</div>
					
					{/* 目次（デスクトップのみ表示） */}
					<div className="hidden lg:block">
						<TableOfContentsClient />
					</div>
				</div>
			</div>
		);
	}

	// 目次がない場合（1カラムレイアウト）
	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="mx-auto">
				{renderContent()}
			</div>
		</div>
	);
}

// 静的生成のためのパス生成
export async function generateStaticParams() {
	// ビルド時に環境変数が設定されていない場合は空配列を返す
	if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
		console.warn("microCMS環境変数が設定されていません。静的パス生成をスキップします。");
		return [];
	}

	try {
		const response = await getBlogPosts(100); // 最大100記事分のパスを生成
		return response.contents.map((post) => ({
			slug: post.id,
		}));
	} catch (error) {
		console.error("Error generating static params:", error);
		return [];
	}
}