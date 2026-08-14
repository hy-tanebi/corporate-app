import type { VideoSlide } from "../../types/content";

// トップの3D回転カードをサービス紹介に差し替えるための定数。
//
// 【現在このファイルは使われていない】
// LPのコピー刷新に伴い /service 系を非公開にした結果、リンク先を持たないカードが
// 並ぶ状態になったため、HeroCanvasSection は microCMS のブログ記事から
// カードを生成する実装に戻してある。
// LPを正式公開する際、カードをサービス紹介に戻すならこの定数を再利用できる
// （その場合は liveUrl のコメントアウトも解除すること）。
export const SHOWCASE_CARDS: VideoSlide[] = [
	{
		id: "service-issues",
		title: "その課題、ここから伸ばせます",
		mediaType: "image",
		imageSrc: "/images/hero_dx_support.webp",
		description:
			"作って終わりのホームページ、伸びないネット販売、社内の手間、AIの使いどころ。「こうしたい」から一緒に進めます。",
		category: "サービス",
		// コピー刷新中のためリンクは一時的に外している（/service/issues 本体は残置・noindex）
		// 正式公開時に liveUrl: "/service/issues" を戻すこと
	},
	{
		id: "service-menu",
		title: "できること ─ ご相談メニュー",
		mediaType: "image",
		imageSrc: "/images/hero_human_app.webp",
		description:
			"Webサイトの制作・改善、AI活用の相談、業務ツールの開発。どれも「まず話を聞いてから」始めます。",
		category: "サービス",
		// コピー刷新中のためリンクは一時的に外している（/service 本体は残置・noindex）
		// 正式公開時に liveUrl: "/service" を戻すこと
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
