import type { ReactNode } from "react";
import { HeroStateProvider } from "../../contexts/HeroStateProvider";
import { type BlogPost, getBlogPosts } from "../../lib/microcms";
import HeroCanvasWrapper from "./HeroCanvasWrapper";

// BlogPostを3D回転カード用のデータに変換する
function blogPostToVideoSlide(post: BlogPost) {
	// mediaTypeが配列で返る場合があるため先頭を取る
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
			? // biome-ignore lint/suspicious/noExplicitAny: microCMSのcategoryは文字列/オブジェクトの両方が来る
				(post.category[0] as any)?.name || post.category[0]
			: // biome-ignore lint/suspicious/noExplicitAny: 同上
				(post.category as any)?.name || post.category,
		liveUrl: `/blog/${post.id}`,
	};
}

interface HeroCanvasSectionProps {
	children: ReactNode;
}

/**
 * トップページの3D回転カードを microCMS のブログ記事から生成する。
 *
 * 一時期 showcase-cards.ts の固定値（サービス紹介3枚）に置き換えていたが、
 * LPのコピー刷新に伴い /service 系を非公開にした結果、リンク先を持たないカードが
 * 並ぶ状態になったため、記事ベースの実装に戻した。
 * 取得に失敗した場合は videoSlides を undefined にして、
 * HeroCanvas 側のフォールバック（getSafeVideoSlides）に委ねる。
 */
export default async function HeroCanvasSection({
	children,
}: HeroCanvasSectionProps) {
	let videoSlides: ReturnType<typeof blogPostToVideoSlide>[] = [];

	try {
		const response = await getBlogPosts(20, 0);
		// isShowcase を持つ記事だけを出す。フィールド自体が無い場合は全記事を対象にする
		const showcasePosts = response.contents.filter((post) =>
			post.isShowcase !== undefined ? post.isShowcase : true,
		);

		if (showcasePosts.length > 0) {
			videoSlides = showcasePosts.map(blogPostToVideoSlide);
		}
	} catch (error) {
		console.warn(
			"microCMSからの記事取得に失敗、フォールバックデータを使用:",
			error instanceof Error ? error.message : error,
		);
	}

	return (
		<HeroStateProvider>
			{/* 3D Scene (Client Side Only via Dynamic Import with ssr: false) */}
			<HeroCanvasWrapper
				videoSlides={videoSlides.length > 0 ? videoSlides : undefined}
			/>

			{/* Main Content (SSR Safe) - Rendered independently of 3D Canvas */}
			<div
				style={{
					position: "relative",
					zIndex: 10,
					minHeight: "1000vh",
					pointerEvents: "none",
				}}
			>
				{children}
			</div>
		</HeroStateProvider>
	);
}
