"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { BlogPost } from "@/lib/microcms";
import { Clock, Eye, Calendar } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

// 記事の概要を取得（HTMLタグを除去して最初の100文字）
function getPostSummary(content: string): string {
  const textOnly = content
    .replace(/<[^>]*>/g, "")
    .replace(/\n/g, " ")
    .trim();
  return textOnly.length > 100 ? `${textOnly.substring(0, 100)}...` : textOnly;
}

// 読了時間を計算（日本語の平均読書速度: 600文字/分）
function getReadingTime(content: string): number {
  const textOnly = content.replace(/<[^>]*>/g, "");
  const charactersCount = textOnly.length;
  return Math.max(1, Math.ceil(charactersCount / 600));
}

export function BlogCard({ post }: BlogCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const summary = getPostSummary(post.content);
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
      {/* デスクトップ版（lg以上）- フリップアニメーション */}
      <div
        className="perspective-1000 h-full hidden lg:block"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          } `}
          style={{
            border: "2px solid rgb(209 213 219)",
            backgroundColor: "white",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          }}
        >
          {/* 表面 */}
          <Link
            href={`/blog/${post.id}`}
            className="block absolute inset-0 backface-hidden"
          >
            <Card
              className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer !bg-white dark:!bg-white relative z-10"
              data-card="blog-card"
              style={{
                backgroundColor: "white !important",
                border: "none !important",
                color: "rgb(3 7 18) !important",
              }}
            >
              {post.eyecatch && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.eyecatch.url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              )}
              <CardHeader className="pb-3 border-l-2 border-t-2 border-r-2">
                {post.category && post.category.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {post.category.map((cat, index) => (
                      <CategoryBadge key={index} category={cat} size="sm" />
                    ))}
                  </div>
                )}
                <CardTitle className="text-base line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 border-l-2 border-b-2 border-r-2">
                <time
                  className="text-xs text-gray-500 dark:text-gray-400"
                  dateTime={post.publishedAt}
                >
                  {new Date(post.publishedAt)
                    .toISOString()
                    .split("T")[0]
                    .replace(/-/g, "/")}
                </time>
              </CardContent>
            </Card>
          </Link>

          {/* 裏面 */}
          <Link
            href={`/blog/${post.id}`}
            className="block absolute inset-0 backface-hidden rotate-y-180"
          >
            <Card
              className="h-full cursor-pointer !bg-white dark:!bg-white relative z-10 flex flex-col"
              data-card="blog-card"
              style={{
                backgroundColor: "white !important",
                backgroundImage: "none !important",
                border: "none !important",
                color: "rgb(3 7 18) !important",
              }}
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex-shrink-0 mb-4">
                  <h3 className="text-lg line-clamp-2 text-gray-800 dark:text-gray-800 font-semibold mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{readingTime}分で読める</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).getMonth() + 1}/
                        {new Date(post.publishedAt).getDate()}
                      </time>
                    </div>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-center mb-6">
                  <p className="text-base text-gray-700 dark:text-gray-700 leading-relaxed line-clamp-4 h-24 overflow-hidden">
                    {summary}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-300">
                  {post.category && post.category.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.category.slice(0, 2).map((cat, index) => (
                        <CategoryBadge key={index} category={cat} size="sm" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-600 font-medium">
                    <Eye className="w-4 h-4" />
                    <span>続きを読む</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
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
              <div
                className="relative aspect-video overflow-hidden cursor-pointer"
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
              </div>
            )}
            <CardHeader className="pb-3">
              {post.category && post.category.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {post.category.map((cat, index) => (
                    <CategoryBadge key={index} category={cat} size="sm" />
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
