"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * /service, /service/issues 用の「上に戻る」ボタン。
 *
 * ルートレイアウトの ChatWidget（UFOボタン、fixed bottom-6 right-6, 64px四方）と
 * 重ならないよう、その上に表示する。既存の src/components/blog/scroll-to-top.tsx は
 * bottom-6 right-6 のままで ChatWidget と重なる位置にあるため、そちらは真似ていない。
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
			className="fixed bottom-28 right-6 z-40 w-12 h-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
			aria-label="ページ上部に戻る"
		>
			<ArrowUp className="w-5 h-5" />
		</button>
	);
}
