import type { VideoSlide, FallbackConfig } from "../types/content";

// フォールバック用のコンテンツデータ
export const fallbackVideoSlides: VideoSlide[] = [
	{
		id: "fallback-hero-simplify",
		title: "デジタルの悩みをシンプルに",
		mediaType: "image",
		imageSrc: "/images/hero-simplify-digital.webp",
		description: "AIと技術で、複雑なデジタル課題をシンプルに解決します",
	},
	{
		id: "fallback-1",
		title: "AI導入支援",
		mediaType: "image",
		imageSrc: "/images/hero_ai_connected.webp",
		description: "業務効率化・DX推進をAIでサポートします",
	},
	{
		id: "fallback-2",
		title: "DX支援",
		mediaType: "image",
		imageSrc: "/images/hero_dx_support.webp",
		description: "技術と対話で、事業の前進を支援します",
	},
	{
		id: "fallback-4",
		title: "Webアプリ開発",
		mediaType: "image",
		imageSrc: "/images/hero_human_app.webp",
		description: "人に寄り添ったアプリケーションを開発します",
	},
];

// フォールバック設定
export const fallbackConfig: FallbackConfig = {
	useLocalAssets: true,
	maxItems: 4,
	defaultMediaType: "image",
};

// 環境別フォールバック（開発時のみ外部動画を使用可能）
export const developmentFallbackSlides: VideoSlide[] = [
	{
		id: "dev-fallback-hero-simplify",
		title: "デジタルの悩みをシンプルに",
		mediaType: "image",
		imageSrc: "/images/hero-simplify-digital.webp",
		description: "AIと技術で、複雑なデジタル課題をシンプルに解決します",
		publishedAt: "2024-01-20",
		category: "Mission",
		techStack: ["AI", "DX", "Consulting"],
		liveUrl: "https://tanebi-net.com",
	},
	{
		id: "dev-fallback-1",
		title: "テスト3",
		mediaType: "video",
		mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
		imageSrc: "/images/hero_ai_connected.webp",
		description:
			"これはテスト用の記事です。Next.jsとThree.jsを使用してモダンなWebアプリケーションを構築しています。",
		publishedAt: "2024-01-15",
		category: "Web開発",
		techStack: ["Next.js", "Three.js", "TypeScript", "Tailwind CSS"],
		liveUrl: "https://example.com/project1",
		githubUrl: "https://github.com/example/project1",
	},
	{
		id: "dev-fallback-2",
		title: "テスト投稿2",
		mediaType: "video",
		mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
		imageSrc: "/images/hero_dx_support.webp",
		description:
			"React Three Fiberを使用した3Dアニメーション開発についての記事です。",
		publishedAt: "2024-01-10",
		category: "3D開発",
		techStack: ["React", "React Three Fiber", "WebGL"],
		liveUrl: "https://example.com/project2",
		githubUrl: "https://github.com/example/project2",
	},
	{
		id: "dev-fallback-3",
		title: "テスト投稿1",
		mediaType: "video",
		mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
		imageSrc: "/images/hero_human_app.webp",
		description:
			"モバイルファーストなレスポンシブデザインの実装方法について説明しています。",
		publishedAt: "2024-01-05",
		category: "UI/UX",
		techStack: ["HTML", "CSS", "JavaScript", "Responsive Design"],
		liveUrl: "https://example.com/project3",
		githubUrl: "https://github.com/example/project3",
	},
];

// 環境に応じたフォールバックデータを取得
export function getFallbackVideoSlides(): VideoSlide[] {
	// 開発環境では動画付きのサンプルを使用、本番では画像のみ
	if (process.env.NODE_ENV === "development") {
		return developmentFallbackSlides;
	}
	return fallbackVideoSlides;
}

// フォールバックデータのバリデーション
// biome-ignore lint/suspicious/noExplicitAny: Intentional loose checking for type guard
export function validateVideoSlide(slide: any): slide is VideoSlide {
	return (
		typeof slide?.id === "string" &&
		typeof slide?.title === "string" &&
		["video", "image"].includes(slide?.mediaType) &&
		typeof slide?.description === "string" &&
		(slide.mediaType === "video" ? typeof slide?.mp4 === "string" : true) &&
		(slide.mediaType === "image" ? typeof slide?.imageSrc === "string" : true)
	);
}

// 安全なフォールバックデータの取得
export function getSafeVideoSlides(slides?: VideoSlide[]): VideoSlide[] {
	if (!slides || slides.length === 0) {
		return getFallbackVideoSlides();
	}

	const validSlides = slides.filter(validateVideoSlide);

	if (validSlides.length === 0) {
		return getFallbackVideoSlides();
	}

	return validSlides;
}
