"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type HeadingItem, scrollToHeading } from "@/lib/table-of-contents";

interface TableOfContentsProps {
	headings: HeadingItem[];
}

// 見出しレベルに応じたインデント計算
function getIndentLevel(level: number): number {
	switch (level) {
		case 1:
			return 8; // h1: 基本インデント
		case 2:
			return 20; // h2: 少し右にインデント
		case 3:
			return 32; // h3: さらに右にインデント
		default:
			return 8;
	}
}

export function TableOfContents({ headings }: TableOfContentsProps) {
	const [activeId, setActiveId] = useState<string>("");

	// クライアント側でIDを付与
	useEffect(() => {
		// プロースエリア内の見出しにIDを付与
		const proseElement = document.querySelector(".prose");
		if (proseElement) {
			const headingElements = proseElement.querySelectorAll("h1, h2, h3");
			headingElements.forEach((element, index) => {
				if (!element.id) {
					element.id = `heading-${index + 1}`;
				}
			});
		}
	}, []);

	// 現在のスクロール位置に基づいてアクティブな見出しを更新
	useEffect(() => {
		const handleScroll = () => {
			const headingElements = headings
				.map((heading) => ({
					id: heading.id,
					element: document.getElementById(heading.id),
				}))
				.filter((item) => item.element);

			const scrollPosition = window.scrollY + 100; // オフセット調整

			// 現在のスクロール位置より上にある見出しを取得
			const visibleHeadings = headingElements.filter((item) => {
				if (!item.element) return false;
				return item.element.offsetTop <= scrollPosition;
			});

			if (visibleHeadings.length > 0) {
				// 最後の見出し（最も下にある見出し）をアクティブにする
				const lastVisible = visibleHeadings[visibleHeadings.length - 1];
				setActiveId(lastVisible.id);
			} else if (headingElements.length > 0) {
				// すべての見出しがスクロール位置より下にある場合は最初の見出しをアクティブ
				setActiveId(headingElements[0].id);
			}
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // 初期化時に実行

		return () => window.removeEventListener("scroll", handleScroll);
	}, [headings]);

	if (headings.length === 0) {
		return null;
	}

	const handleHeadingClick = (id: string) => {
		console.log("Table of Contents clicked:", id); // デバッグログ
		scrollToHeading(id);
	};

	return (
		<Card className="sticky top-4 max-h-[80vh] overflow-auto">
			<CardHeader className="pb-3">
				<CardTitle className="text-base flex items-center gap-2">
					📋 目次
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<nav>
					<ul className="space-y-1 text-sm">
						{headings.map((heading) => (
							<li key={heading.id}>
								<button
									type="button"
									onClick={() => handleHeadingClick(heading.id)}
									className={`
                    block w-full text-left py-1 px-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                    ${
											activeId === heading.id
												? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium"
												: "text-gray-700 dark:text-gray-300"
										}
                    ${heading.level === 1 ? "font-semibold text-base" : ""}
                    ${heading.level === 2 ? "font-medium text-sm" : ""}
                    ${heading.level === 3 ? "font-normal text-sm" : ""}
                  `}
									style={{
										paddingLeft: `${getIndentLevel(heading.level)}px`,
									}}
								>
									<span className="flex items-center gap-2">
										{heading.level === 1 && (
											<span className="text-blue-500">■</span>
										)}
										{heading.level === 2 && (
											<span className="text-green-500">●</span>
										)}
										{heading.level === 3 && (
											<span className="text-orange-500">▲</span>
										)}
										{heading.text}
									</span>
								</button>
							</li>
						))}
					</ul>
				</nav>
			</CardContent>
		</Card>
	);
}
