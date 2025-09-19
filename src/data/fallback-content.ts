import { VideoSlide, FallbackConfig } from '../types/content';

// フォールバック用のコンテンツデータ
export const fallbackVideoSlides: VideoSlide[] = [
  {
    id: "fallback-1",
    title: "プロジェクト準備中 1",
    mediaType: "image",
    imageSrc: "/images/placeholder-project-1.jpg", // 後で画像を追加予定
    description: "新しいプロジェクトを準備中です",
  },
  {
    id: "fallback-2", 
    title: "プロジェクト準備中 2",
    mediaType: "image",
    imageSrc: "/images/placeholder-project-2.jpg", // 後で画像を追加予定
    description: "技術検証を行っています",
  },
  {
    id: "fallback-3",
    title: "プロジェクト準備中 3", 
    mediaType: "image",
    imageSrc: "/images/placeholder-project-3.jpg", // 後で画像を追加予定
    description: "デザインを検討中です",
  },
  {
    id: "fallback-4",
    title: "プロジェクト準備中 4",
    mediaType: "image", 
    imageSrc: "/images/placeholder-project-4.jpg", // 後で画像を追加予定
    description: "実装を計画中です",
  },
];

// フォールバック設定
export const fallbackConfig: FallbackConfig = {
  useLocalAssets: true,
  maxItems: 4,
  defaultMediaType: 'image',
};

// 環境別フォールバック（開発時のみ外部動画を使用可能）
export const developmentFallbackSlides: VideoSlide[] = [
  {
    id: "dev-fallback-1",
    title: "開発用サンプル 1",
    mediaType: "video",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    imageSrc: "/images/placeholder-project-1.jpg",
    description: "開発用のサンプル動画です",
  },
  {
    id: "dev-fallback-2",
    title: "開発用サンプル 2", 
    mediaType: "video",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    imageSrc: "/images/placeholder-project-2.jpg",
    description: "開発用のサンプル動画です",
  },
  {
    id: "dev-fallback-3",
    title: "開発用サンプル 3",
    mediaType: "video", 
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    imageSrc: "/images/placeholder-project-3.jpg",
    description: "開発用のサンプル動画です",
  },
  {
    id: "dev-fallback-4",
    title: "開発用サンプル 4",
    mediaType: "video",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    imageSrc: "/images/placeholder-project-4.jpg", 
    description: "開発用のサンプル動画です",
  },
];

// 環境に応じたフォールバックデータを取得
export function getFallbackVideoSlides(): VideoSlide[] {
  // 開発環境では動画付きのサンプルを使用、本番では画像のみ
  if (process.env.NODE_ENV === 'development') {
    return developmentFallbackSlides;
  }
  return fallbackVideoSlides;
}

// フォールバックデータのバリデーション
export function validateVideoSlide(slide: any): slide is VideoSlide {
  return (
    typeof slide?.id === 'string' &&
    typeof slide?.title === 'string' &&
    ['video', 'image'].includes(slide?.mediaType) &&
    typeof slide?.description === 'string' &&
    (slide.mediaType === 'video' ? typeof slide?.mp4 === 'string' : true) &&
    (slide.mediaType === 'image' ? typeof slide?.imageSrc === 'string' : true)
  );
}

// 安全なフォールバックデータの取得
export function getSafeVideoSlides(slides?: VideoSlide[]): VideoSlide[] {
  if (!slides || slides.length === 0) {
    return getFallbackVideoSlides();
  }
  
  // データの検証
  const validSlides = slides.filter(validateVideoSlide);
  if (validSlides.length === 0) {
    return getFallbackVideoSlides(); 
  }
  
  return validSlides;
}