---
name: material-design
description: Create UI designs following Google Material Design 3 specifications. Use when designing components, selecting colors, implementing layouts, or ensuring Material Design compliance. Covers color systems, typography, elevation, motion, and component patterns for modern web applications.
---

# Material Design 3 Assistant

このスキルは、Google Material Design 3（Material You）の最新仕様に基づいた、モダンで統一感のあるUIデザインの作成を支援します。

## When to Use This Skill

このスキルは以下のような場面で使用します：

- Material Design 3に準拠したコンポーネントの実装
- 色彩システム（Color System）の設計と適用
- タイポグラフィの選定とスタイル設定
- レイアウトとスペーシングの設計
- エレベーション（影）とサーフェス（面）の実装
- アニメーションとモーションの設計
- アクセシビリティ（Accessibility）の確保
- レスポンシブデザインの実装

## Core Concepts

Material Design 3は、以下の主要な原則に基づいています：

### 1. Material as a Metaphor
物理的な素材（紙や光）のメタファーを用いて、直感的なインターフェースを作成

### 2. Bold, Graphic, Intentional
大胆で視覚的に明確なデザイン要素の使用

### 3. Motion Provides Meaning
意味のあるアニメーションで、ユーザー体験を向上

### 4. Adaptive Design (Material You)
ユーザーの好みや環境に適応する動的な色彩システム

## Color System

Material Design 3では、Dynamic Color（動的カラー）システムを採用しています。

### Primary Colors (主要カラー)
- **Primary**: ブランドカラー、主要なアクション
- **On Primary**: Primaryの上に配置されるテキスト/アイコン
- **Primary Container**: Primary関連のコンテナ背景
- **On Primary Container**: Primary Container上のテキスト

### Secondary & Tertiary Colors
- **Secondary**: 二次的なアクション
- **Tertiary**: アクセントカラー、強調要素

### Surface Colors
- **Surface**: カードや背景などのサーフェス
- **Surface Variant**: バリエーションのあるサーフェス
- **On Surface**: Surface上のテキスト
- **On Surface Variant**: 二次的なテキスト

### Other Important Colors
- **Outline**: ボーダーや区切り線
- **Outline Variant**: より薄い区切り線
- **Error**: エラー表示
- **Background**: アプリケーション背景

### Color Roles Example (Tailwind CSS)

詳細は [color-system.md](color-system.md) を参照してください。

## Typography

Material Design 3のタイポグラフィスケール：

### Display (最大の見出し)
- **Display Large**: 57px / 400 weight
- **Display Medium**: 45px / 400 weight
- **Display Small**: 36px / 400 weight

### Headline (大見出し)
- **Headline Large**: 32px / 400 weight
- **Headline Medium**: 28px / 400 weight
- **Headline Small**: 24px / 400 weight

### Title (小見出し)
- **Title Large**: 22px / 400 weight
- **Title Medium**: 16px / 500 weight
- **Title Small**: 14px / 500 weight

### Body (本文)
- **Body Large**: 16px / 400 weight
- **Body Medium**: 14px / 400 weight
- **Body Small**: 12px / 400 weight

### Label (ラベル・ボタン)
- **Label Large**: 14px / 500 weight
- **Label Medium**: 12px / 500 weight
- **Label Small**: 11px / 500 weight

推奨フォント: **Roboto**, **Noto Sans**, または **Inter**

## Elevation & Shadows

Material Design 3では、エレベーションレベルに応じた影を使用します。

### Elevation Levels
- **Level 0**: 影なし（デフォルトのサーフェス）
- **Level 1**: 軽い浮き上がり（カードなど）
- **Level 2**: 中程度の浮き上がり（FABなど）
- **Level 3**: 高い浮き上がり（ダイアログなど）
- **Level 4**: 最高レベル（モーダルなど）
- **Level 5**: 特別な強調

### Shadow Classes (Tailwind CSS)
```css
/* Level 1 */
shadow-md

/* Level 2 */
shadow-lg

/* Level 3 */
shadow-xl

/* Level 4 */
shadow-2xl
```

## Spacing & Layout

### Spacing Scale (8dpグリッド)
Material Designは8dpグリッドシステムを使用：

- **4px**: 最小スペーシング
- **8px**: 小
- **12px**: 小〜中
- **16px**: 中（基本単位）
- **24px**: 中〜大
- **32px**: 大
- **48px**: 特大
- **64px**: 最大

### Layout Grid
- **Mobile**: 4カラムグリッド、16px margin
- **Tablet**: 8カラムグリッド、24px margin
- **Desktop**: 12カラムグリッド、24px margin

## Common Components

### Button Variants

1. **Filled Button** (最も強調)
   - Primary actionに使用
   - 背景色: Primary
   - テキスト色: On Primary

2. **Outlined Button** (中程度の強調)
   - Secondary actionに使用
   - ボーダー: Outline
   - テキスト色: Primary

3. **Text Button** (最も控えめ)
   - 低優先度のactionに使用
   - テキスト色: Primary

4. **Elevated Button**
   - 影付きで浮き上がって見えるボタン

5. **Tonal Button**
   - 背景色: Primary Container
   - テキスト色: On Primary Container

詳細なコンポーネント例は [examples/](examples/) ディレクトリを参照してください。

### Card Variants

1. **Elevated Card**
   - shadow-md を使用
   - 背景: Surface

2. **Filled Card**
   - 背景: Surface Variant
   - 影なし

3. **Outlined Card**
   - ボーダー: Outline
   - 背景: Surface

## Motion & Animation

### Duration
- **Short**: 100-200ms（小さな変化）
- **Medium**: 250-400ms（標準的な変化）
- **Long**: 400-700ms（大きな変化）

### Easing Functions
- **Standard**: cubic-bezier(0.4, 0.0, 0.2, 1) - デフォルト
- **Deceleration**: cubic-bezier(0.0, 0.0, 0.2, 1) - 入場
- **Acceleration**: cubic-bezier(0.4, 0.0, 1, 1) - 退場
- **Sharp**: cubic-bezier(0.4, 0.0, 0.6, 1) - 一時的な変化

### Common Animations
- **Fade**: opacity変化
- **Scale**: transform: scale()
- **Slide**: transform: translateX/Y()
- **Ripple**: ボタンクリック時の波紋効果

## Accessibility Guidelines

### Contrast Ratios
- **Large Text (18px+)**: 最低 3:1
- **Normal Text**: 最低 4.5:1
- **UI Components**: 最低 3:1

### Touch Targets
- **最小サイズ**: 48x48px
- **推奨サイズ**: 48x48px以上

### Focus Indicators
- キーボードナビゲーション時に明確なフォーカス表示
- Outline colorを使用

## Instructions

Material Design 3に準拠したコンポーネントを作成する際は、以下の手順に従います：

### Step 1: Color Scheme の定義
1. プロジェクトのブランドカラーを決定
2. Material Theme Builder（https://m3.material.io/theme-builder）を使用して、完全な色彩システムを生成
3. CSS変数またはTailwind configに色を定義

### Step 2: Typography の設定
1. プロジェクトに適したフォントを選択（Roboto推奨）
2. Material Design 3のタイポグラフィスケールをTailwind configまたはCSS変数に設定
3. line-heightとletter-spacingを適切に設定

### Step 3: Component の実装
1. 必要なコンポーネント（Button, Card, etc.）を特定
2. 適切なバリアント（Filled, Outlined, Text）を選択
3. 色、サイズ、スペーシングをMaterial Design仕様に従って実装
4. アクセシビリティ要件を満たす

### Step 4: Layout の構築
1. 8dpグリッドシステムに基づいたスペーシングを使用
2. レスポンシブグリッド（4/8/12カラム）を実装
3. 適切なmarginとpaddingを適用

### Step 5: Animation の追加
1. ユーザーインタラクション（hover, focus, active）に対する視覚的フィードバックを追加
2. 適切なdurationとeasing functionを使用
3. パフォーマンスを考慮（60fps維持）

### Step 6: Testing & Refinement
1. 各種画面サイズでのテスト
2. アクセシビリティチェック（コントラスト、フォーカス、キーボード操作）
3. ダークモード対応の確認

## Best Practices

### Colors
- **Always use semantic color tokens**: `bg-primary` ではなく `bg-surface` など、役割に基づいた色名を使用
- **Maintain contrast ratios**: テキストと背景のコントラスト比を常に確認
- **Support dark mode**: ライトモードとダークモード両方をサポート

### Typography
- **Use the type scale consistently**: カスタムフォントサイズは避け、定義されたスケールを使用
- **Limit font weights**: 通常は400と500のみを使用
- **Set proper line height**: 読みやすさのため、適切な行間を確保

### Layout
- **Follow the 8dp grid**: 全てのスペーシングは8の倍数を基準に
- **Use consistent spacing**: コンポーネント間のスペーシングを統一
- **Implement responsive breakpoints**: モバイル、タブレット、デスクトップで適切に調整

### Components
- **Use elevation purposefully**: 影は階層を示すために使用し、装飾目的では使わない
- **Provide visual feedback**: 全てのインタラクティブ要素にhover/focus/active状態を実装
- **Follow component specs**: Material Design公式のコンポーネント仕様を遵守

### Performance
- **Optimize animations**: transform と opacity のみを使用（reflow回避）
- **Use CSS transitions**: 可能な限りCSS transitionsを優先
- **Lazy load heavy components**: Three.jsなど重いコンポーネントは遅延ロード

## AI Assistant Instructions

このスキルが起動された場合：

### Always Do:
1. **Material Design 3の最新仕様を参照**: 古いMaterial Design 2の情報は使用しない
2. **色の役割を正しく使用**: Primary, Secondary, Surface, Backgroundなどの役割を理解して適用
3. **アクセシビリティを最優先**: コントラスト比、タッチターゲットサイズ、フォーカス表示を常に考慮
4. **レスポンシブデザインを実装**: モバイルファーストで、全画面サイズに対応
5. **具体的なコード例を提供**: Tailwind CSSとTypeScriptを使用した実装例を示す
6. **セマンティックなクラス名を使用**: `bg-blue-500`ではなく`bg-primary`のような役割ベースの命名

### Never Do:
1. **Material Design 2の仕様を使用しない**: M3とM2は異なる仕様
2. **カスタム値を安易に使わない**: 定義されたスケール（色、タイポグラフィ、スペーシング）を優先
3. **重要な情報を省略しない**: アクセシビリティやレスポンシブ対応は必須
4. **過度に複雑にしない**: シンプルで保守しやすいコードを優先
5. **ブランドガイドラインを無視しない**: プロジェクト固有のデザイン要件を尊重

### Workflow:
1. **要件の確認**: ユーザーが作成したいコンポーネントや機能を明確化
2. **Material Design仕様の選択**: 適切なコンポーネントバリアントを提案
3. **コード生成**: Tailwind CSS + TypeScript + Next.jsで実装
4. **アクセシビリティチェック**: ARIA属性、コントラスト、キーボード操作を確認
5. **レスポンシブ対応**: 各ブレークポイントでの動作を説明
6. **最適化提案**: パフォーマンスやユーザビリティの改善案を提示

### Code Style:
- React Server Components (RSC) を優先
- `"use client"`は必要な場合のみ使用
- Tailwind CSSのユーティリティクラスを活用
- TypeScriptで型安全性を確保
- コンポーネントは再利用可能に設計

## Additional Resources

- [Material Design 3 Official Site](https://m3.material.io/)
- [Material Theme Builder](https://m3.material.io/theme-builder)
- [Material Design Components](https://m3.material.io/components)
- [Color System Guide](https://m3.material.io/styles/color/overview)
- [Typography Scale](https://m3.material.io/styles/typography/overview)
- [Elevation Levels](https://m3.material.io/styles/elevation/overview)

---

**Note**: このスキルは、Next.js (App Router) + Tailwind CSS + TypeScriptの環境を前提としています。他のフレームワークを使用する場合は、適宜読み替えてください。
