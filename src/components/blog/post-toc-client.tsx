"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import type { AuthorProfile } from "@/lib/microcms";
import { ProfileCard } from "../profile-card";
import { List, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import Image from "next/image";

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
			return 8;
		case 2:
			return 20;
		case 3:
			return 32;
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
	const [mobileOpen, setMobileOpen] = useState(false);

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

			const scrollBottom = window.scrollY + window.innerHeight;
			const docHeight = document.documentElement.scrollHeight;
			if (scrollBottom >= docHeight - 50) {
				setActiveId(headings[headings.length - 1].id);
				return;
			}

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
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, [headings]);

	const handleHeadingClick = useCallback((id: string) => {
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

		setMobileOpen(false);
	}, []);

	// モバイルメニュー開閉時にbodyスクロールを制御
	useEffect(() => {
		if (mobileOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	if (!mounted) {
		return null;
	}

	// 目次コンテンツ（PC/モバイル共通）
	const tocContent = (
		<nav>
			<div className="relative">
				{headings.length > 0 && (
					<>
						<div
							className="absolute w-0.5 bg-gray-200 dark:bg-gray-700"
							style={{
								left: "15px",
								top: "24px",
								bottom: "24px",
							}}
						/>
						<div
							className="absolute w-0.5 bg-gradient-to-b from-blue-500 via-blue-600 to-purple-600 transition-all duration-500 ease-out"
							style={{
								left: "15px",
								top: "24px",
								height: (() => {
									if (!activeId) return "0%";
									const idx = headings.findIndex((h) => h.id === activeId);
									if (idx < 0) return "0%";
									const ratio =
										headings.length <= 1 ? 1 : idx / (headings.length - 1);
									return `calc((100% - 48px) * ${ratio})`;
								})(),
							}}
						/>
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
										paddingLeft: `${getIndentLevel(heading.level) + 16}px`,
									}}
								>
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
										{isActive && (
											<div className="absolute inset-0 rounded-full bg-blue-500 opacity-25 animate-ping" />
										)}
									</div>

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
	);

	// 目次なし：プロフィールだけ表示
	if (headings.length === 0) {
		if (profile) {
			return (
				<>
					{/* PC: サイドバー */}
					<div className="hidden lg:block sticky top-4">
						<ProfileCard profile={profile} />
					</div>
					{/* モバイル: スティッキーバー */}
					{profile?.avatar?.url && (
						<MobileStickyBar
							profile={profile}
							headings={[]}
							onTocToggle={() => {}}
						/>
					)}
				</>
			);
		}
		return null;
	}

	return (
		<>
			{/* PC: サイドバー（既存） */}
			<div className="hidden lg:block sticky top-4 space-y-4">
				{profile && <ProfileCard profile={profile} />}
				<Card>
					<details open>
						<summary className="flex items-center gap-2 px-6 py-4 cursor-pointer text-base font-semibold select-none hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
							📋 目次
						</summary>
						<div className="px-6 pb-4">{tocContent}</div>
					</details>
				</Card>
			</div>

			{/* モバイル: スティッキーバー */}
			<MobileStickyBar
				profile={profile}
				headings={headings}
				onTocToggle={() => setMobileOpen(true)}
			/>

			{/* モバイル: 目次オーバーレイ */}
			{mobileOpen && (
				<div className="fixed inset-0 z-[60] lg:hidden">
					{/* 背景オーバーレイ */}
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						onClick={() => setMobileOpen(false)}
						aria-label="目次を閉じる"
					/>
					{/* 目次パネル（右からスライドイン） */}
					<div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl animate-slide-in-right overflow-y-auto">
						<div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
							<span className="font-semibold text-gray-900">📋 目次</span>
							<button
								type="button"
								onClick={() => setMobileOpen(false)}
								className="p-1 rounded-md hover:bg-gray-100 transition-colors"
								aria-label="目次を閉じる"
							>
								<X className="w-5 h-5 text-gray-600" />
							</button>
						</div>
						<div className="px-4 py-4">{tocContent}</div>
					</div>
				</div>
			)}
		</>
	);
}

// モバイル用スティッキーバー（上部固定）
function MobileStickyBar({
	profile,
	headings,
	onTocToggle,
}: {
	profile?: AuthorProfile;
	headings: HeadingItem[];
	onTocToggle: () => void;
}) {
	const { resolvedTheme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(resolvedTheme === "light" ? "dark" : "light");
	};

	return (
		<div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-2">
			<div className="flex items-center justify-between max-w-5xl mx-auto">
				{/* プロフィール */}
				<div className="flex items-center gap-2 min-w-0">
					{profile?.avatar?.url && (
						<div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-600">
							<Image
								src={profile.avatar.url}
								alt={profile.name || ""}
								fill
								className="object-cover"
								sizes="32px"
							/>
						</div>
					)}
					{profile?.name && (
						<span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
							{profile.name}
						</span>
					)}
				</div>

				{/* 右側：目次トグル + テーマ切替 */}
				<div className="flex items-center gap-2">
					{headings.length > 0 && (
						<button
							type="button"
							onClick={onTocToggle}
							className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							<List className="w-4 h-4" />
							<span>目次</span>
						</button>
					)}
					<button
						type="button"
						onClick={toggleTheme}
						className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
						aria-label={`${resolvedTheme === "light" ? "ダーク" : "ライト"}モードに切り替え`}
					>
						{resolvedTheme === "light" ? (
							<Sun className="h-4 w-4" />
						) : (
							<Moon className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
