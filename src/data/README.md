# フォールバックコンテンツの使用方法

このディレクトリには、CMSデータが取得できない場合のフォールバックコンテンツが含まれています。

## ファイル構成

- `fallback-content.ts` - フォールバック用のコンテンツデータと関連関数
- `../types/content.ts` - コンテンツの型定義
- `../constants/portfolio-config.ts` - ポートフォリオ全体の設定

## 使用方法

### 基本的な使用

```typescript
import { getSafeVideoSlides } from './data/fallback-content';

// CMSデータがある場合
const cmsData = await fetchFromCMS();
const videoSlides = getSafeVideoSlides(cmsData?.videoSlides);

// CMSデータがない場合は自動的にフォールバックが使用される
const videoSlides = getSafeVideoSlides();
```

### 環境別のフォールバック

```typescript
import { getFallbackVideoSlides } from './data/fallback-content';

// 開発環境: 外部動画付きのサンプル
// 本番環境: ローカル画像のみ
const fallbackSlides = getFallbackVideoSlides();
```

### バリデーション

```typescript
import { validateVideoSlide } from './data/fallback-content';

const isValid = validateVideoSlide(someSlideData);
```

## カスタマイズ

`fallback-content.ts` の `fallbackVideoSlides` 配列を編集することで、フォールバックコンテンツをカスタマイズできます。

画像ファイルは `public/images/` ディレクトリに配置してください：
- `placeholder-project-1.jpg`
- `placeholder-project-2.jpg`
- `placeholder-project-3.jpg`
- `placeholder-project-4.jpg`

## 注意事項

- 本番環境では外部リソース（Google動画など）への依存を避けるため、ローカルアセットのみを使用します
- 開発環境では動作確認のため外部動画も利用可能です
- フォールバックデータは必ず型安全性を保つようにしてください