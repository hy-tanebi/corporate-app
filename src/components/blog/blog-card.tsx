"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { BlogPost } from "@/lib/microcms";
import { Clock, Calendar } from "lucide-react";

interface BlogCardProps {
	post: BlogPost;
}

// 記事の概要を取得（HTMLタグを除去して最初の100文字）
function getPostSummary(content: string | undefined): string {
	if (!content) return "";
	const textOnly = content
		.replace(/<[^>]*>/g, "")
		.replace(/\n/g, " ")
		.trim();
	return textOnly.length > 100 ? `${textOnly.substring(0, 100)}...` : textOnly;
}

// 読了時間を計算（日本語の平均読書速度: 600文字/分）
function getReadingTime(content: string | undefined): number {
	if (!content) return 1;
	const textOnly = content.replace(/<[^>]*>/g, "");
	const charactersCount = textOnly.length;
	return Math.max(1, Math.ceil(charactersCount / 600));
}

export function BlogCard({ post }: BlogCardProps) {
	const [isImageExpanded, setIsImageExpanded] = useState(false);
	const readingTime = getReadingTime(post.content);

	// Force white background in dark mode
	useEffect(() => {
		const cards = document.querySelectorAll('[data-card="blog-card"]');
		cards.forEach((card) => {
			const element = card as HTMLElement;
			element.style.backgroundColor = "white";
			element.style.setProperty("background-color", "white", "important");
		});
	}, []);

	const handleMobileImageClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsImageExpanded(!isImageExpanded);
	};

	return (
		<>
			{/* デスクトップ版（lg以上）- ホバーで浮き上がる */}
			<div className="h-full hidden lg:block">
				<Link href={`/blog/${post.id}`}>
					<Card
						className="h-full cursor-pointer !bg-white dark:!bg-white relative z-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
						data-card="blog-card"
						style={{
							backgroundColor: "white !important",
							border: "2px solid rgb(209 213 219)",
							boxShadow:
								"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
							color: "rgb(3 7 18) !important",
						}}
					>
						{post.eyecatch && (
							<div className="relative aspect-video overflow-hidden border-b border-gray-200">
								<Image
									src={post.eyecatch.url}
									alt={post.title}
									fill
									className="object-cover"
									sizes="25vw"
								/>
							</div>
						)}
						<CardHeader className="pb-3">
							{post.category && post.category.length > 0 && (
								<div className="mb-2 flex flex-wrap gap-1">
									{post.category.map((cat) => (
										<CategoryBadge key={cat} category={cat} size="sm" linkable={false} />
									))}
								</div>
							)}
							<CardTitle className="text-base line-clamp-2">
								{post.title}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<div className="flex items-center justify-between">
								<time
									className="text-xs text-gray-500"
									dateTime={post.publishedAt}
								>
									{new Date(post.publishedAt)
										.toISOString()
										.split("T")[0]
										.replace(/-/g, "/")}
								</time>
								<div className="flex items-center gap-1 text-xs text-gray-600">
									<Clock className="w-3 h-3" />
									<span>{readingTime}分</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</Link>
			</div>

			{/* モバイル・タブレット版（lg未満）- 画像拡大アニメーション */}
			<div className="h-full block lg:hidden">
				<Link href={`/blog/${post.id}`}>
					<Card
						className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer !bg-white dark:!bg-white relative z-10 shadow-lg"
						data-card="blog-card"
						style={{
							backgroundColor: "white !important",
							border: "2px solid rgb(209 213 219) !important",
							color: "rgb(3 7 18) !important",
						}}
					>
						{post.eyecatch && (
							<button
								type="button"
								className="relative aspect-video overflow-hidden cursor-pointer w-full p-0 border-0"
								onClick={handleMobileImageClick}
							>
								<Image
									src={post.eyecatch.url}
									alt={post.title}
									fill
									className={`object-cover transition-transform duration-500 ease-out ${
										isImageExpanded ? "scale-125" : "scale-100 hover:scale-105"
									}`}
									sizes="(max-width: 768px) 50vw, 50vw"
								/>
								{/* 拡大時のオーバーレイ */}
								{isImageExpanded && (
									<div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
										<div className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
											タップで元に戻す
										</div>
									</div>
								)}
							</button>
						)}
						<CardHeader className="pb-3">
							{post.category && post.category.length > 0 && (
								<div className="mb-2 flex flex-wrap gap-1">
									{post.category.map((cat) => (
										<CategoryBadge key={cat} category={cat} size="sm" linkable={false} />
									))}
								</div>
							)}
							<CardTitle className="text-sm line-clamp-2">
								{post.title}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<div className="flex items-center justify-between">
								<time
									className="text-xs text-gray-500 dark:text-gray-400"
									dateTime={post.publishedAt}
								>
									{new Date(post.publishedAt)
										.toISOString()
										.split("T")[0]
										.replace(/-/g, "/")}
								</time>
								<div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
									<Clock className="w-3 h-3" />
									<span>{readingTime}分</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</Link>
			</div>
		</>
	);
}
