import type { VideoSlide } from "../../types/content";

// トップの3D回転カード。CMSではなくコードで管理する。
export const SHOWCASE_CARDS: VideoSlide[] = [
	{
		id: "service-issues",
		title: "こんなお悩み、ありませんか",
		mediaType: "image",
		imageSrc: "/images/hero_dx_support.webp",
		description:
			"古いホームページ、属人化したExcel管理、AIの使いどころ。「何とかしたい」に一緒に手をつけます。",
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
		id: "works-internal-tool",
		title: "実際の取り組み",
		mediaType: "image",
		imageSrc: "/images/hero_sync_human_app.webp",
		description:
			"待機確認の業務を自作のWebツールに置き換えました。今も毎日使っています。",
		category: "事例",
		// ページ再設計中のためリンクは一時的に外している（/works 本体は残置）
	},
];
