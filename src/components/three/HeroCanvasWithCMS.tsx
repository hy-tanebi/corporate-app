// src/components/three/HeroCanvasWithCMS.tsx
import type { ReactNode } from "react";
import { getBlogPosts, type BlogPost } from "../../lib/microcms";
import HeroCanvas from "./hero-canvas";

// BlogPostをVideoCard用データに変換
function blogPostToVideoSlide(post: BlogPost) {
  console.log('🔄 変換処理中のpost:', JSON.stringify(post, null, 2));
  
  // mediaTypeが配列の場合は最初の要素を取得
  let mediaType = post.mediaType || "image";
  if (Array.isArray(mediaType)) {
    mediaType = mediaType[0] || "image";
  }

  const result = {
    id: post.id,
    title: post.title,
    mediaType: mediaType as "image" | "video",
    mp4: mediaType === "video" ? post.videoUrl : undefined,
    imageSrc: mediaType === "image" ? post.eyecatch?.url : undefined,
    description: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) : "",
    publishedAt: post.publishedAt,
    category: Array.isArray(post.category) ? post.category[0]?.name : post.category?.name,
    // 記事詳細ページのURL
    liveUrl: `/blog/${post.id}`,
  };

  console.log('🔄 変換結果:', JSON.stringify(result, null, 2));
  return result;
}

interface HeroCanvasWithCMSProps {
  children: ReactNode;
}

export default async function HeroCanvasWithCMS({
  children,
}: HeroCanvasWithCMSProps) {
  let videoSlides: ReturnType<typeof blogPostToVideoSlide>[] = [];

  try {
    // microCMSからshowcase記事を取得
    const response = await getBlogPosts(20, 0);
    const showcasePosts = response.contents.filter((post) => post.isShowcase);

    if (showcasePosts.length > 0) {
      videoSlides = showcasePosts.map(blogPostToVideoSlide);
      console.log(`${showcasePosts.length}件のshowcase記事を変換しました`);
      console.log('🔍 変換前の生データ:', showcasePosts);
      console.log('🔍 変換後のvideoSlides:', videoSlides);
    } else {
      console.log('⚠️ showcase記事が見つかりませんでした');
    }
  } catch (error) {
    console.warn(
      "microCMSからの記事取得に失敗、デフォルトデータを使用:",
      error instanceof Error ? error.message : error
    );
  }

  // テスト用: フォールバックデータを強制使用
  console.log('🔍 最終的なvideoSlides:', videoSlides);
  console.log('🔍 videoSlides.length:', videoSlides.length);
  
  return (
    <HeroCanvas videoSlides={videoSlides.length > 0 ? videoSlides : undefined}>
      {children}
    </HeroCanvas>
  );
}
