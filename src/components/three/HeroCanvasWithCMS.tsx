// src/components/three/HeroCanvasWithCMS.tsx
import { ReactNode } from "react";
import { getBlogPosts, type BlogPost } from "../../lib/microcms";
import HeroCanvas from "./hero-canvas";

// BlogPostをVideoCard用データに変換
function blogPostToVideoSlide(post: BlogPost) {
  // mediaTypeが配列の場合は最初の要素を取得
  let mediaType = post.mediaType || 'image';
  if (Array.isArray(mediaType)) {
    mediaType = mediaType[0] || 'image';
  }
  
  const result = {
    id: post.id,
    title: post.title,
    mediaType: mediaType as 'image' | 'video',
    mp4: mediaType === 'video' ? post.videoUrl : undefined,
    imageSrc: mediaType === 'image' ? post.eyecatch?.url : undefined,
    description: "",
  };
  
  return result;
}

interface HeroCanvasWithCMSProps {
  children: ReactNode;
}

export default async function HeroCanvasWithCMS({ children }: HeroCanvasWithCMSProps) {
  let videoSlides: any[] = [];

  try {
    // microCMSからshowcase記事を取得
    const response = await getBlogPosts(20, 0);
    const showcasePosts = response.contents.filter(post => post.isShowcase);
    
    if (showcasePosts.length > 0) {
      videoSlides = showcasePosts.map(blogPostToVideoSlide);
      console.log(`${showcasePosts.length}件のshowcase記事を変換しました`);
    }
  } catch (error) {
    console.warn('microCMSからの記事取得に失敗、デフォルトデータを使用:', error instanceof Error ? error.message : error);
  }

  return (
    <HeroCanvas videoSlides={videoSlides.length > 0 ? videoSlides : undefined}>
      {children}
    </HeroCanvas>
  );
}