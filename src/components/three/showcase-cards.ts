import type { VideoSlide } from "../../types/content";

// トップの3D回転カード。
//
// 一時期 microCMS のブログ記事から生成していたが、トップの役割は
// 「頼んで大丈夫か」を確認しに来た人を答えのあるページへ送ることなので、
// 記事一覧ではなく配下ページへの導線として固定3枚を並べる。
// 記事には /blog があるため、トップの一等地を重複させる必要がない。
//
// 画像は public/images/ のローカルアセットを使う。3Dテクスチャは TextureLoader で
// 読むため CMS 画像だと別オリジンになり CORS 依存になること、
// VideoCard3D.tsx の読み込み失敗ハンドラが空で失敗に気づけないことが理由。
// 差し替え頻度も年に数回なのでデプロイで足りる。
export const SHOWCASE_CARDS: VideoSlide[] = [
	{
		id: "service-issues",
		title: "その課題、ここから伸ばせます",
		mediaType: "image",
		imageSrc: "/images/hero_dx_support.webp",
		description:
			"作って終わりのホームページ、伸びないネット販売、社内の手間、AIの使いどころ。「こうしたい」から一緒に進めます。",
		category: "サービス",
		liveUrl: "/service/issues",
	},
	{
		id: "service-menu",
		title: "できること ─ ご相談メニュー",
		mediaType: "image",
		imageSrc: "/images/hero_human_app.webp",
		description:
			"Webサイトの制作・改善、AI活用の相談、業務ツールの開発。どれも「まず話を聞いてから」始めます。",
		category: "サービス",
		liveUrl: "/service",
	},
	{
		// TANEBI CREATIVE の詳細ページは未作成のため、暫定でトップ内の ABOUT セクションへ送る。
		// 詳細ページができたら liveUrl を差し替えるだけでよい。
		id: "about",
		title: "TANEBI CREATIVEについて",
		mediaType: "image",
		imageSrc: "/images/hero_sync_human_app.webp",
		description:
			"岩手県奥州市を拠点に、Web・アプリ・AIの相談を受けています。何をしている人間なのかは、ここを見てください。",
		category: "About",
		liveUrl: "/#about",
	},
];
