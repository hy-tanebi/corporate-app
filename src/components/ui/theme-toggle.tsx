"use client";

import { useTheme } from "@/contexts/theme-context";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(resolvedTheme === "light" ? "dark" : "light");
	};

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-900 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-300 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-50 dark:focus:ring-offset-gray-900"
			aria-label={`${resolvedTheme === "light" ? "ダーク" : "ライト"}モードに切り替え`}
		>
			<Sun
				className={`absolute h-5 w-5 transform transition-all duration-300 ${
					resolvedTheme === "light"
						? "rotate-0 scale-100 opacity-100"
						: "rotate-90 scale-0 opacity-0"
				}`}
			/>
			<Moon
				className={`absolute h-5 w-5 transform transition-all duration-300 ${
					resolvedTheme === "dark"
						? "rotate-0 scale-100 opacity-100"
						: "-rotate-90 scale-0 opacity-0"
				}`}
			/>
		</button>
	);
}
