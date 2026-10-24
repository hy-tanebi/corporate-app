"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * /service, /service/issues 用の「上に戻る」ボタン。
 *
 * bottom-28 は、以前ルートレイアウトにあった ChatWidget（UFOボタン、bottom-6 right-6,
 * 64px四方）を避けるための位置。ChatWidget は 2026-10-24 に削除したが、見た目を
 * 変えないよう据え置いている。
 *
 * デスクトップ(md:)では sidebar-menu.tsx の折りたたみ状態が画面右端に
 * 常時 80px 幅の帯として表示される（md:w-[80px] md:h-screen）。right-6 のままだと
 * この帯の内側（下）に隠れてしまうため、md:right-24 で帯の左（内側）に逃がす。
 */
export function ScrollToTopButton() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const handleScroll = () => setVisible(window.scrollY > 300);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (!visible) return null;

	return (
		<button
			type="button"
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			className="fixed bottom-28 right-6 md:right-24 z-40 w-12 h-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
			aria-label="ページ上部に戻る"
		>
			<ArrowUp className="w-5 h-5" />
		</button>
	);
}
