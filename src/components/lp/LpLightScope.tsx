import type { ReactNode } from "react";

/**
 * LPページをライト固定で描画するためのスコープ。
 *
 * LPは PageHero や LpSection で bg-secondary / text-foreground といったテーマ連動トークンを
 * 使っているが、ダークモード用の配色は用意していない（FV画像がクリーム背景の描き下ろしで、
 * ページ内にテーマ切替ボタンも置いていないため）。
 * html に .dark が付いた状態でそのまま描くと、本文がほぼ白・カードが濃紺になり読めなくなる。
 * .lp-light（globals.css）でライトのトークンを再定義し、この階層以下だけ切り離す。
 */
export function LpLightScope({ children }: { children: ReactNode }) {
	return (
		<div className="lp-light min-h-screen bg-background text-foreground">
			{children}
		</div>
	);
}
