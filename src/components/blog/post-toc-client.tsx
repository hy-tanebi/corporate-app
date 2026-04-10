"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import type { AuthorProfile } from "@/lib/microcms";
import { ProfileCard } from "../profile-card";

// 見出しの型
interface HeadingItem {
	id: string;
	text: string;
	level: number;
	element: HTMLElement;
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

interface TableOfContentsClientProps {
	profile?: AuthorProfile;
}

export function TableOfContentsClient({ profile }: TableOfContentsClientProps) {
	const [headings, setHeadings] = useState<HeadingItem[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [mounted, setMounted] = useState(false);

	// マウント状態を管理
	useEffect(() => {
		setMounted(true);
	}, []);

	// クライアント側で見出しを抽出してIDを付与
	useEffect(() => {
		if (!mounted) return;

		const proseElement = document.querySelector(".prose");
		if (!proseElement) return;

		const headingElements = proseElement.querySelectorAll("h1, h2, h3");
		const headingsData: HeadingItem[] = [];

		headingElements.forEach((element, index) => {
			const id = `heading-${index + 1}`;
			const text = element.textContent || "";
			const level = parseInt(element.tagName.replace("H", ""));

			// IDを設定
			element.id = id;

			headingsData.push({
				id,
				text,
				level,
				element: element as HTMLElement,
			});
		});

		setHeadings(headingsData);
	}, [mounted]);

	// アクティブな見出しの追跡
	useEffect(() => {
		if (headings.length === 0) return;

		const handleScroll = () => {
			const scrollPosition = window.scrollY + 100;

			// ページ最下部付近ならば最後の見出しをアクティブにする
			const scrollBottom = window.scrollY + window.innerHeight;
			const docHeight = document.documentElement.scrollHeight;
			if (scrollBottom >= docHeight - 50) {
				setActiveId(headings[headings.length - 1].id);
				return;
			}

			// 現在のスクロール位置より上にある見出しを取得
			const visibleHeadings = headings.filter((heading) => {
				return heading.element.offsetTop <= scrollPosition;
			});

			if (visibleHeadings.length > 0) {
				const lastVisible = visibleHeadings[visibleHeadings.length - 1];
				setActiveId(lastVisible.id);
			} else if (headings.length > 0) {
				setActiveId(headings[0].id);
			}
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // 初期化時に実行

		return () => window.removeEventListener("scroll", handleScroll);
	}, [headings]);

	const handleHeadingClick = (id: string) => {
		const element = document.getElementById(id);

		if (element) {
			const headerOffset = 80;
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition =
				elementPosition + window.pageYOffset - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	};

	// マウント前は何も表示しない（ハイドレーションエラー防止）
	if (!mounted) {
		return null;
	}

	if (headings.length === 0) {
		// プロフィールだけでも表示（目次がない場合）
		if (profile) {
			return (
				<div className="sticky top-4">
					<ProfileCard profile={profile} />
				</div>
			);
		}
		return null;
	}

	return (
		<div className="sticky top-4 space-y-4">
			{/* プロフィールカード */}
			{profile && <ProfileCard profile={profile} />}

			{/* 目次カード */}
			<Card>
				<details open>
					<summary className="flex items-center gap-2 px-6 py-4 cursor-pointer text-base font-semibold select-none hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
						📋 目次
					</summary>
					<div className="px-6 pb-4">
					<nav>
						{/* タイムライン */}
						<div className="relative">
							{headings.length > 0 && (
								<>
									{/* 縦のライン */}
									<div
										className="absolute w-0.5 bg-gray-200 dark:bg-gray-700"
										style={{
											left: "15px", // 1px右にずらす (14px + 1px)
											top: "24px",
											bottom: "24px",
										}}
									/>

									{/* 進捗ライン */}
									<div
										className="absolute w-0.5 bg-gradient-to-b from-blue-500 via-blue-600 to-purple-600 transition-all duration-500 ease-out"
										style={{
											left: "15px", // 1px右にずらす (14px + 1px)
											top: "24px",
											height: (() => {
												if (!activeId) return "0%";
												const idx = headings.findIndex((h) => h.id === activeId);
												if (idx < 0) return "0%";
												const ratio = headings.length <= 1 ? 1 : idx / (headings.length - 1);
												return `calc((100% - 48px) * ${ratio})`;
											})(),
										}}
									>
										{/* 光る効果（削除：ラインのずれ原因） */}
									</div>
								</>
							)}

							<ul className="space-y-0 text-sm relative">
								{headings.map((heading, index) => {
									const isActive = activeId === heading.id;
									const isPassed =
										headings.findIndex((h) => h.id === activeId) >= index;

									return (
										<li key={heading.id} className="relative">
											<button
												type="button"
												onClick={() => handleHeadingClick(heading.id)}
												className={`
                        block w-full text-left py-3 pr-2 transition-all duration-200 ease-out hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-r-md
                        ${
													isActive
														? "bg-blue-50 text-blue-700 dark:bg-blue-50 dark:text-blue-700"
														: "text-gray-700 dark:text-gray-700"
												}
                      `}
												style={{
													paddingLeft: `${getIndentLevel(heading.level) + 16}px`, // タイムライン分の余白追加
												}}
											>
												{/* タイムラインのドット */}
												<div
													className={`
                          absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300 ease-out
                          ${
														isActive
															? "w-3 h-3 bg-blue-500 border-blue-500 shadow-lg"
															: isPassed
																? "w-2 h-2 bg-blue-400 border-blue-400"
																: "w-2 h-2 bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600"
													}
                        `}
												>
													{/* アクティブ時のリング効果 */}
													{isActive && (
														<div className="absolute inset-0 rounded-full bg-blue-500 opacity-25 animate-ping"></div>
													)}
												</div>

												{/* レベル別アイコン */}
												<div className="flex items-center gap-3">
													<div
														className={`
                          flex items-center justify-center transition-all duration-200
                          ${heading.level === 1 ? "w-5 h-5" : heading.level === 2 ? "w-4 h-4" : "w-3 h-3"}
                        `}
													>
														{heading.level === 1 && (
															<span
																className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}
															>
																📄
															</span>
														)}
														{heading.level === 2 && (
															<span
																className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}
															>
																📝
															</span>
														)}
														{heading.level === 3 && (
															<span
																className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}
															>
																📌
															</span>
														)}
													</div>

													<span
														className={`
                          transition-all duration-200 leading-relaxed
                          ${heading.level === 1 ? "font-semibold text-base" : ""}
                          ${heading.level === 2 ? "font-medium text-sm" : ""}
                          ${heading.level === 3 ? "font-normal text-xs" : ""}
                          ${isActive ? "font-medium" : ""}
                        `}
													>
														{heading.text}
													</span>
												</div>
											</button>
										</li>
									);
								})}
							</ul>
						</div>
					</nav>
					</div>
				</details>
			</Card>
		</div>
	);
}
