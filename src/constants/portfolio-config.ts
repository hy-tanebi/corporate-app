import { fallbackConfig } from '../data/fallback-content';

// ポートフォリオ全体の設定
export const PORTFOLIO_CONFIG = {
  // フォールバック設定
  fallback: fallbackConfig,
  
  // アニメーション設定
  animation: {
    cardRotationInertia: 2.0,
    videoEase: 5.0,
    cardDwellFraction: 0.95,
    circleSmoothExpand: 0.25,
    circleSmoothShrink: 18.0,
  },
  
  // レイアウト設定
  layout: {
    cardWidth: 1.2,
    cardHeight: 0.7,
    tetraRadius: 1.5,
    sceneScale: 1.2,
  },
  
  // フェーズ設定
  phases: {
    thirdPhaseStart: 0.5,
    thirdPhaseEnd: 0.88,
    videoStartProgress: 0.57,
    returnScrollStart: 0.82,
    returnScrollEnd: 0.86,
    circleScrollStart: 0.865, // RETURN_SCROLL_END + 0.005
    circleScrollEnd: 0.9995,
  },
} as const;

// 環境変数による設定の上書き
export function getPortfolioConfig() {
  return {
    ...PORTFOLIO_CONFIG,
    // 環境別の設定があれば上書き
    fallback: {
      ...PORTFOLIO_CONFIG.fallback,
      useLocalAssets: process.env.NODE_ENV === 'production',
    },
  };
}