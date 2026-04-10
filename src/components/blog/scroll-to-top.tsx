"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setVisible(window.scrollY > 300);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (!visible) return null;

	return (
		<button
			type="button"
			onClick={scrollToTop}
			className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-all duration-200 opacity-80 hover:opacity-100"
			aria-label="ページ上部に戻る"
		>
			<ArrowUp className="w-5 h-5" />
		</button>
	);
}
