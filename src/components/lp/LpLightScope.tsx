"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// HomeClient と同じくクライアント専用（framer-motion + gsap）なので動的インポートにする。
// onNavigate は渡さない。LP上ではトップページ内セクションへのリンクは
// 通常のリンク（/#hash）としてナビゲートすればよく、トップページ限定のスムーズスクロール
// インターセプトは不要なため（sidebar-menu.tsx 側で onNavigate 有無により分岐している）。
// ssr: false にしないこと（HomeClient 側と同じ理由）。メニュー内のリンクが
// 初期HTMLに出力されなくなり、クローラがページ間を辿れなくなる。
const SidebarMenu = dynamic(() =>
	import("@/components/ui/sidebar-menu").then((mod) => mod.SidebarMenu),
);

/**
 * LPページをライト固定で描画するためのスコープ。
 *
 * LPは PageHero や LpSection で bg-secondary / text-foreground といったテーマ連動トークンを
 * 使っているが、ダークモード用の配色は用意していない（FV画像がクリーム背景の描き下ろしで、
 * ページ内にテーマ切替ボタンも置いていないため）。
 * html に .dark が付いた状態でそのまま描くと、本文がほぼ白・カードが濃紺になり読めなくなる。
 * .lp-light（globals.css）でライトのトークンを再定義し、この階層以下だけ切り離す。
 *
 * ナビゲーションメニューはトップページ（HomeClient）にしかマウントされていなかったため、
 * LP配下ではハンバーガーメニュー自体が存在しなかった。ここに追加して他ページと揃える。
 */
export function LpLightScope({ children }: { children: ReactNode }) {
	return (
		<div className="lp-light min-h-screen bg-background text-foreground">
			<SidebarMenu />
			{children}
		</div>
	);
}
