"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	List,
	Music,
	Calendar,
	Wrench,
	Mail,
	MessageCircle,
	ChevronRight,
	Eye,
	EyeOff,
	X,
	BookOpen,
	ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TocSection {
	id: string;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	description?: string;
}

const sections: TocSection[] = [
	{
		id: "activity-content",
		title: "活動内容",
		icon: Music,
		description: "私たちの音楽活動について",
	},
	{
		id: "practice-schedule",
		title: "練習日程",
		icon: Calendar,
		description: "練習スケジュールと会場案内",
	},
	{
		id: "instruments",
		title: "使用楽器",
		icon: Wrench,
		description: "演奏に使用する楽器一覧",
	},
	{
		id: "participation-flow",
		title: "参加の流れ",
		icon: ArrowRight,
		description: "見学・体験参加について",
	},
	{
		id: "application-form",
		title: "お問い合わせフォーム",
		icon: MessageCircle,
		description: "応募・質問はこちらから",
	},
	{
		id: "contact-email",
		title: "メール連絡",
		icon: Mail,
		description: "直接メールでのお問い合わせ",
	},
];

export function TableOfContents() {
	const [activeSection, setActiveSection] = useState<string>("");
	const [isVisible, setIsVisible] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// レスポンシブ判定
	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 1024);
		};

		checkIsMobile();
		window.addEventListener("resize", checkIsMobile);

		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);

	// スクロール監視とアクティブセクション更新
	useEffect(() => {
		let ticking = false;

		const updateActiveSection = () => {
			if (ticking) return;
			ticking = true;

			requestAnimationFrame(() => {
				const scrollY = window.scrollY;
				const viewportTop = scrollY + 100; // ヘッダー等の高さを考慮

				// 各セクションの位置を取得
				const sectionPositions = sections
					.map((section) => {
						const element = document.getElementById(section.id);
						if (!element) return null;

						const rect = element.getBoundingClientRect();
						return {
							id: section.id,
							top: rect.top + scrollY,
							bottom: rect.bottom + scrollY,
						};
					})
					.filter(Boolean);

				// 現在のスクロール位置を通過したセクションの中で最後のものを選択
				let activeSection = sectionPositions[0]?.id || "";

				for (const section of sectionPositions) {
					if (section && section.top <= viewportTop) {
						activeSection = section.id;
					} else {
						break;
					}
				}

				// ページの最下部近くにいる場合は、最後のセクションを強制的にアクティブにする
				const documentHeight = document.documentElement.scrollHeight;
				const windowHeight = window.innerHeight;
				const scrollBottom = scrollY + windowHeight;

				if (scrollBottom >= documentHeight - 200) {
					// 200pxの余裕を持たせる
					const lastSection = sectionPositions[sectionPositions.length - 1];
					if (lastSection) {
						activeSection = lastSection.id;
					}
				}

				setActiveSection(activeSection);
				ticking = false;
			});
		};

		// 初回実行
		updateActiveSection();

		// スクロールイベントリスナーを追加
		window.addEventListener("scroll", updateActiveSection, { passive: true });
		window.addEventListener("resize", updateActiveSection);

		return () => {
			window.removeEventListener("scroll", updateActiveSection);
			window.removeEventListener("resize", updateActiveSection);
		};
	}, []);

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			// クリック時に即座にアクティブセクションを設定
			setActiveSection(sectionId);

			// ヘッダーの高さやその他の固定要素を考慮
			const headerOffset = 80; // 上部に余白を追加（目次が正しく動作するよう調整）
			const elementPosition =
				element.getBoundingClientRect().top + window.pageYOffset - headerOffset;

			window.scrollTo({
				top: elementPosition,
				behavior: "smooth",
			});

			// スクロール完了後にアクティブセクションを再設定（念のため）
			setTimeout(() => {
				setActiveSection(sectionId);
			}, 1000);
		}

		// モバイルでメニューが開いている場合は閉じる
		if (isMobile && isMenuOpen) {
			setIsMenuOpen(false);
		}
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const toggleVisibility = () => {
		setIsVisible(!isVisible);
	};

	return (
		<>
			{/* モバイル版: 目次ボタン */}
			{isMobile && (
				<>
					{/* 目次ボタン（ライトモードボタンの下に配置） */}
					<div className="fixed top-20 right-4 z-40">
						<Button
							onClick={toggleMenu}
							size="sm"
							className="h-12 w-12 rounded-xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 border-2 border-white/20"
							title="目次を開く"
						>
							<motion.div
								animate={{ rotate: isMenuOpen ? 180 : 0 }}
								transition={{ duration: 0.3 }}
							>
								{isMenuOpen ? (
									<X className="w-5 h-5 text-white" />
								) : (
									<BookOpen className="w-5 h-5 text-white" />
								)}
							</motion.div>
						</Button>

						{/* ボタンの説明ラベル */}
						<AnimatePresence>
							{!isMenuOpen && (
								<motion.div
									initial={{ opacity: 0, x: 10 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 10 }}
									className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none whitespace-nowrap"
								>
									目次
									<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-gray-900/90 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* オーバーレイ */}
					<AnimatePresence>
						{isMenuOpen && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
								onClick={() => setIsMenuOpen(false)}
							/>
						)}
					</AnimatePresence>

					{/* サイドバーメニュー */}
					<AnimatePresence>
						{isMenuOpen && (
							<motion.div
								initial={{ x: "100%" }}
								animate={{ x: 0 }}
								exit={{ x: "100%" }}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
								className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
							>
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
												<List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
											</div>
											<div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
													目次
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													ページ内容一覧
												</p>
											</div>
										</div>
									</div>

									<div className="space-y-3">
										{sections.map((section, index) => {
											const Icon = section.icon;
											const isActive = activeSection === section.id;

											return (
												<motion.button
													key={section.id}
													onClick={() => scrollToSection(section.id)}
													className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
														isActive
															? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 shadow-md"
															: "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 border-l-4 border-transparent"
													}`}
													initial={{ opacity: 0, x: 50 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 }}
													whileTap={{ scale: 0.98 }}
												>
													<div className="flex items-start gap-4">
														<div
															className={`p-2 rounded-lg transition-colors ${
																isActive
																	? "bg-blue-500 text-white"
																	: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500"
															}`}
														>
															<Icon className="w-4 h-4" />
														</div>
														<div className="flex-1 min-w-0">
															<div
																className={`text-base font-semibold transition-colors ${
																	isActive
																		? "text-blue-900 dark:text-blue-100"
																		: "text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
																}`}
															>
																{section.title}
															</div>
															{section.description && (
																<div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
																	{section.description}
																</div>
															)}
														</div>
														<ChevronRight
															className={`w-4 h-4 transition-all mt-1 ${
																isActive
																	? "text-blue-600 dark:text-blue-400 translate-x-2"
																	: "text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2"
															}`}
														/>
													</div>
												</motion.button>
											);
										})}
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</>
			)}

			{/* PC版: サイドバー（右側配置） */}
			{!isMobile && (
				<div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 w-80">
					<AnimatePresence>
						{isVisible && (
							<motion.div
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 50 }}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
							>
								<Card className="shadow-xl border-2 border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
									<CardContent className="p-6">
										<div className="flex items-center gap-3 mb-6">
											<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
												<List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
											</div>
											<div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
													目次
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													ページ内容一覧
												</p>
											</div>
										</div>

										<div className="space-y-3">
											{sections.map((section, index) => {
												const Icon = section.icon;
												const isActive = activeSection === section.id;

												return (
													<motion.button
														key={section.id}
														onClick={() => scrollToSection(section.id)}
														className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
															isActive
																? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 shadow-md"
																: "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 border-l-4 border-transparent"
														}`}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.1 }}
														whileHover={{ scale: 1.02 }}
														whileTap={{ scale: 0.98 }}
													>
														<div className="flex items-start gap-4">
															<div
																className={`p-2 rounded-lg transition-colors ${
																	isActive
																		? "bg-blue-500 text-white"
																		: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500"
																}`}
															>
																<Icon className="w-4 h-4" />
															</div>
															<div className="flex-1 min-w-0">
																<div
																	className={`text-base font-semibold transition-colors ${
																		isActive
																			? "text-blue-900 dark:text-blue-100"
																			: "text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
																	}`}
																>
																	{section.title}
																</div>
																{section.description && (
																	<div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
																		{section.description}
																	</div>
																)}
															</div>
															<ChevronRight
																className={`w-4 h-4 transition-all mt-1 ${
																	isActive
																		? "text-blue-600 dark:text-blue-400 translate-x-2"
																		: "text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2"
																}`}
															/>
														</div>
													</motion.button>
												);
											})}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>

					{/* 表示切り替えボタン */}
					<div className="mt-4">
						<Button
							onClick={toggleVisibility}
							size="sm"
							variant="outline"
							className="h-10 px-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-50 hover:border-blue-300"
						>
							{isVisible ? (
								<>
									<EyeOff className="w-4 h-4 mr-2" />
									非表示
								</>
							) : (
								<>
									<Eye className="w-4 h-4 mr-2" />
									目次を表示
								</>
							)}
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
