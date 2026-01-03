// src/components/three/HeroCanvasWithCMS.tsx
import type { ReactNode } from "react";
import { getBlogPosts, type BlogPost } from "../../lib/microcms";
import HeroCanvasWrapper from "./HeroCanvasWrapper";

// BlogPostをVideoCard用データに変換
function blogPostToVideoSlide(post: BlogPost) {
	// mediaTypeが配列の場合は最初の要素を取得
	let mediaType = post.mediaType || "image";
	if (Array.isArray(mediaType)) {
		mediaType = mediaType[0] || "image";
	}

	return {
		id: post.id,
		title: post.title,
		mediaType: mediaType as "image" | "video",
		mp4: mediaType === "video" ? post.videoUrl : undefined,
		imageSrc: mediaType === "image" ? post.eyecatch?.url : undefined,
		description: post.content
			? post.content.replace(/<[^>]*>/g, "").substring(0, 100)
			: "",
		publishedAt: post.publishedAt,
		category: Array.isArray(post.category)
			? (post.category[0] as any)?.name || post.category[0]
			: (post.category as any)?.name || post.category,
		liveUrl: `/blog/${post.id}`,
	};
}

interface HeroCanvasWithCMSProps {
	children: ReactNode;
}

export default async function HeroCanvasWithCMS({
	children,
}: HeroCanvasWithCMSProps) {
	let videoSlides: ReturnType<typeof blogPostToVideoSlide>[] = [];

	try {
		// microCMSからshowcase記事を取得
		const response = await getBlogPosts(20, 0);
		// isShowcaseフィールドが存在する場合はフィルタリング、存在しない場合は全記事を表示
		const showcasePosts = response.contents.filter((post) =>
			post.isShowcase !== undefined ? post.isShowcase : true
		);

		if (showcasePosts.length > 0) {
			videoSlides = showcasePosts.map(blogPostToVideoSlide);
		}
	} catch (error) {
		console.warn(
			"microCMSからの記事取得に失敗、デフォルトデータを使用:",
			error instanceof Error ? error.message : error,
		);
	}

	return (
		<HeroCanvasWrapper videoSlides={videoSlides.length > 0 ? videoSlides : undefined}>
			{/* AIO/SEO Fallback: 3Dコンテンツのテキスト情報を検索エンジン・AI用に隠しテキストとして出力 */}
			<div className="sr-only">
				<section aria-label="Featured Projects">
					<h2>Featured Projects</h2>
					{videoSlides.map((slide) => (
						<article key={slide.id}>
							<h3>{slide.title}</h3>
							<p>{slide.description}</p>
							{slide.publishedAt && (
								<time dateTime={slide.publishedAt}>{slide.publishedAt}</time>
							)}
							{slide.category && <span>Category: {slide.category}</span>}
							<a href={slide.liveUrl}>View Details</a>
						</article>
					))}
				</section>
			</div>
			{children}
		</HeroCanvasWrapper>
	);
}
