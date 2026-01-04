import type { VideoSlide, FallbackConfig } from "../types/content";

// フォールバック用のコンテンツデータ
export const fallbackVideoSlides: VideoSlide[] = [
	{
		id: "fallback-1",
		title: "プロジェクト準備中 1",
		mediaType: "image",
		imageSrc: "/images/placeholder-project-1.jpg", // 後で画像を追加予定
		description: "新しいプロジェクトを準備中です",
	},
	{
		id: "fallback-2",
		title: "プロジェクト準備中 2",
		mediaType: "image",
		imageSrc: "/images/placeholder-project-2.jpg", // 後で画像を追加予定
		description: "技術検証を行っています",
	},
	{
		id: "fallback-4",
		title: "プロジェクト準備中 4",
		mediaType: "image",
		imageSrc: "/images/placeholder-project-4.jpg", // 後で画像を追加予定
		description: "実装を計画中です",
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
		id: "dev-fallback-1",
		title: "テスト3",
		mediaType: "video",
		mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
		imageSrc: "/images/placeholder-project-1.jpg",
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
		imageSrc: "/images/placeholder-project-2.jpg",
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
		imageSrc: "/images/placeholder-project-3.jpg",
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
	console.log("🔍 getSafeVideoSlides input:", slides);

	if (!slides || slides.length === 0) {
		console.log("📦 フォールバックデータを使用します");
		const fallback = getFallbackVideoSlides();
		console.log("📦 フォールバックデータ:", fallback);
		return fallback;
	}

	// データの検証
	const validSlides = slides.filter(validateVideoSlide);
	console.log("✅ 検証後のデータ:", validSlides);
	console.log(
		"🔍 最初のスライドの詳細:",
		JSON.stringify(validSlides[0], null, 2),
	);

	if (validSlides.length === 0) {
		console.log("📦 検証失敗、フォールバックデータを使用します");
		const fallback = getFallbackVideoSlides();
		console.log("📦 フォールバックデータ:", fallback);
		return fallback;
	}

	console.log("✅ 入力データを使用します");
	return validSlides;
}
