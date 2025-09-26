// コンテンツ関連の型定義

export interface VideoSlide {
  id: string;
  title: string;
  mediaType: 'video' | 'image';
  mp4?: string;
  imageSrc?: string;
  description: string;
  publishedAt?: string;
  category?: string;
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface PortfolioContent {
  videoSlides: VideoSlide[];
}

// フォールバック設定の型
export interface FallbackConfig {
  useLocalAssets: boolean;
  maxItems: number;
  defaultMediaType: 'video' | 'image';
}