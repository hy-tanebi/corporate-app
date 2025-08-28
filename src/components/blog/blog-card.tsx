"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { type BlogPost } from "@/lib/microcms";
import { Clock, Eye, Calendar } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

// 記事の概要を取得（HTMLタグを除去して最初の100文字）
function getPostSummary(content: string): string {
  const textOnly = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
  return textOnly.length > 100 ? `${textOnly.substring(0, 100)}...` : textOnly;
}

// 読了時間を計算（日本語の平均読書速度: 600文字/分）
function getReadingTime(content: string): number {
  const textOnly = content.replace(/<[^>]*>/g, '');
  const charactersCount = textOnly.length;
  return Math.max(1, Math.ceil(charactersCount / 600));
}

export function BlogCard({ post }: BlogCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const summary = getPostSummary(post.content);
  const readingTime = getReadingTime(post.content);

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
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* 表面 */}
          <Link href={`/blog/${post.id}`} className="block absolute inset-0 backface-hidden">
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              {post.eyecatch && (
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
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
                    {post.category.map((cat, index) => (
                      <CategoryBadge key={index} category={cat} size="sm" />
                    ))}
                  </div>
                )}
                <CardTitle className="text-base line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
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
          <Link href={`/blog/${post.id}`} className="block absolute inset-0 backface-hidden rotate-y-180">
            <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-gray-600 cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2 text-gray-800 dark:text-gray-200">
                  {post.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{readingTime}分で読める</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).getMonth() + 1}/{new Date(post.publishedAt).getDate()}
                    </time>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed">
                  {summary}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  {post.category && post.category.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.category.slice(0, 2).map((cat, index) => (
                        <CategoryBadge key={index} category={cat} size="sm" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <Eye className="w-3 h-3" />
                    <span>続きを読む</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* モバイル・タブレット版（lg未満）- 画像拡大アニメーション */}
      <div className="h-full block lg:hidden">
        <Link href={`/blog/${post.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            {post.eyecatch && (
              <div 
                className="relative aspect-video overflow-hidden rounded-t-lg cursor-pointer"
                onClick={handleMobileImageClick}
              >
                <Image
                  src={post.eyecatch.url}
                  alt={post.title}
                  fill
                  className={`object-cover transition-transform duration-500 ease-out ${
                    isImageExpanded ? 'scale-125' : 'scale-100 hover:scale-105'
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