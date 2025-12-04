# Material Design 3 Color System Reference

Material Design 3の色彩システムの詳細なリファレンスです。Dynamic Color（動的カラー）システムに基づいています。

## Color Roles Overview

Material Design 3では、色を「役割（Role）」で管理します。各色には明確な用途があり、一貫性のあるUIを実現します。

## Primary Colors

### Primary
- **用途**: ブランドを表現する主要カラー。最も重要なアクションやコンポーネントに使用
- **使用例**: FAB（Floating Action Button）、重要なボタン、アクティブな状態

### On Primary
- **用途**: Primary色の上に配置されるテキストやアイコン
- **コントラスト**: Primary色に対して十分なコントラストを持つ（通常は白）

### Primary Container
- **用途**: Primaryに関連するコンテナやサーフェスの背景色
- **使用例**: チップ、選択されたアイテム、アクティブなナビゲーション

### On Primary Container
- **用途**: Primary Container上のテキストやアイコン
- **コントラスト**: Primary Containerに対して十分なコントラストを持つ

## Secondary Colors

### Secondary
- **用途**: 二次的なアクションや補助的なUI要素
- **使用例**: フィルターチップ、サブアクション、拡張FAB

### On Secondary
- **用途**: Secondary色の上に配置されるテキストやアイコン

### Secondary Container
- **用途**: Secondaryに関連するコンテナ背景
- **使用例**: 選択可能なアイテムの背景

### On Secondary Container
- **用途**: Secondary Container上のテキストやアイコン

## Tertiary Colors

### Tertiary
- **用途**: アクセントカラー。Primary/Secondaryと対照的な色を使用し、視覚的なバランスを作る
- **使用例**: ハイライト、特別な強調、コントラストが必要な要素

### On Tertiary
- **用途**: Tertiary色の上に配置されるテキストやアイコン

### Tertiary Container
- **用途**: Tertiaryに関連するコンテナ背景

### On Tertiary Container
- **用途**: Tertiary Container上のテキストやアイコン

## Surface Colors

### Surface
- **用途**: カード、シート、ダイアログなどのサーフェス背景
- **特徴**: Backgroundより少し明るい（ライトモード）またはわずかに明るい（ダークモード）

### Surface Dim
- **用途**: 最も暗いサーフェス（ダークモードで使用）

### Surface Bright
- **用途**: 最も明るいサーフェス（ライトモードで使用）

### Surface Container Lowest
- **用途**: 最も低いエレベーションのコンテナ

### Surface Container Low
- **用途**: 低いエレベーションのコンテナ

### Surface Container
- **用途**: デフォルトのコンテナ背景色

### Surface Container High
- **用途**: 高いエレベーションのコンテナ

### Surface Container Highest
- **用途**: 最も高いエレベーションのコンテナ

### On Surface
- **用途**: Surface上の主要なテキストやアイコン
- **コントラスト**: 高コントラスト（87%不透明度推奨）

### On Surface Variant
- **用途**: Surface上の二次的なテキストやアイコン
- **コントラスト**: 中程度のコントラスト（60%不透明度推奨）

### Surface Variant
- **用途**: サーフェスのバリエーション。わずかに異なる色合い

## Outline Colors

### Outline
- **用途**: ボーダー、区切り線、Outlined Button/Cardのアウトライン
- **コントラスト**: 中程度のコントラスト

### Outline Variant
- **用途**: より控えめな区切り線やボーダー
- **コントラスト**: 低コントラスト

## Error Colors

### Error
- **用途**: エラー状態の表示
- **使用例**: エラーメッセージ、バリデーションエラー、破壊的なアクション

### On Error
- **用途**: Error色の上のテキスト/アイコン

### Error Container
- **用途**: エラー関連のコンテナ背景

### On Error Container
- **用途**: Error Container上のテキスト/アイコン

## Background Colors

### Background
- **用途**: アプリケーション全体の背景色
- **特徴**: 最も使用頻度の高いサーフェス

### On Background
- **用途**: Background上のテキスト/アイコン

## Scrim

### Scrim
- **用途**: オーバーレイ（モーダル背景など）
- **通常**: 黒の半透明（rgba(0, 0, 0, 0.32)など）

## Inverse Colors

### Inverse Surface
- **用途**: Snackbar、Tooltipなどの反転サーフェス

### Inverse On Surface
- **用途**: Inverse Surface上のテキスト

### Inverse Primary
- **用途**: Inverse Surface上のPrimaryアクション

## Tailwind CSS Configuration Example

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary
        primary: 'rgb(var(--md-sys-color-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--md-sys-color-on-primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--md-sys-color-primary-container) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--md-sys-color-on-primary-container) / <alpha-value>)',

        // Secondary
        secondary: 'rgb(var(--md-sys-color-secondary) / <alpha-value>)',
        'on-secondary': 'rgb(var(--md-sys-color-on-secondary) / <alpha-value>)',
        'secondary-container': 'rgb(var(--md-sys-color-secondary-container) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--md-sys-color-on-secondary-container) / <alpha-value>)',

        // Tertiary
        tertiary: 'rgb(var(--md-sys-color-tertiary) / <alpha-value>)',
        'on-tertiary': 'rgb(var(--md-sys-color-on-tertiary) / <alpha-value>)',
        'tertiary-container': 'rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)',
        'on-tertiary-container': 'rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)',

        // Error
        error: 'rgb(var(--md-sys-color-error) / <alpha-value>)',
        'on-error': 'rgb(var(--md-sys-color-on-error) / <alpha-value>)',
        'error-container': 'rgb(var(--md-sys-color-error-container) / <alpha-value>)',
        'on-error-container': 'rgb(var(--md-sys-color-on-error-container) / <alpha-value>)',

        // Surface
        surface: 'rgb(var(--md-sys-color-surface) / <alpha-value>)',
        'on-surface': 'rgb(var(--md-sys-color-on-surface) / <alpha-value>)',
        'surface-variant': 'rgb(var(--md-sys-color-surface-variant) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)',

        // Outline
        outline: 'rgb(var(--md-sys-color-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--md-sys-color-outline-variant) / <alpha-value>)',

        // Background
        background: 'rgb(var(--md-sys-color-background) / <alpha-value>)',
        'on-background': 'rgb(var(--md-sys-color-on-background) / <alpha-value>)',
      }
    }
  }
}
```

## CSS Variables Example (Light Mode)

```css
:root {
  /* Primary */
  --md-sys-color-primary: 103 80 164;
  --md-sys-color-on-primary: 255 255 255;
  --md-sys-color-primary-container: 234 221 255;
  --md-sys-color-on-primary-container: 33 0 94;

  /* Secondary */
  --md-sys-color-secondary: 98 91 113;
  --md-sys-color-on-secondary: 255 255 255;
  --md-sys-color-secondary-container: 232 222 248;
  --md-sys-color-on-secondary-container: 30 25 43;

  /* Tertiary */
  --md-sys-color-tertiary: 125 82 96;
  --md-sys-color-on-tertiary: 255 255 255;
  --md-sys-color-tertiary-container: 255 216 228;
  --md-sys-color-on-tertiary-container: 55 11 30;

  /* Error */
  --md-sys-color-error: 179 38 30;
  --md-sys-color-on-error: 255 255 255;
  --md-sys-color-error-container: 249 222 220;
  --md-sys-color-on-error-container: 65 14 11;

  /* Surface */
  --md-sys-color-surface: 254 247 255;
  --md-sys-color-on-surface: 28 27 31;
  --md-sys-color-surface-variant: 231 224 236;
  --md-sys-color-on-surface-variant: 73 69 79;

  /* Outline */
  --md-sys-color-outline: 121 116 126;
  --md-sys-color-outline-variant: 202 196 208;

  /* Background */
  --md-sys-color-background: 254 247 255;
  --md-sys-color-on-background: 28 27 31;
}
```

## CSS Variables Example (Dark Mode)

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Primary */
    --md-sys-color-primary: 208 188 255;
    --md-sys-color-on-primary: 56 30 114;
    --md-sys-color-primary-container: 79 55 139;
    --md-sys-color-on-primary-container: 234 221 255;

    /* Secondary */
    --md-sys-color-secondary: 204 194 220;
    --md-sys-color-on-secondary: 51 45 65;
    --md-sys-color-secondary-container: 74 68 88;
    --md-sys-color-on-secondary-container: 232 222 248;

    /* Tertiary */
    --md-sys-color-tertiary: 239 184 200;
    --md-sys-color-on-tertiary: 73 37 50;
    --md-sys-color-tertiary-container: 99 59 72;
    --md-sys-color-on-tertiary-container: 255 216 228;

    /* Error */
    --md-sys-color-error: 242 184 181;
    --md-sys-color-on-error: 105 0 5;
    --md-sys-color-error-container: 147 0 10;
    --md-sys-color-on-error-container: 249 222 220;

    /* Surface */
    --md-sys-color-surface: 28 27 31;
    --md-sys-color-on-surface: 230 225 229;
    --md-sys-color-surface-variant: 73 69 79;
    --md-sys-color-on-surface-variant: 202 196 208;

    /* Outline */
    --md-sys-color-outline: 147 143 153;
    --md-sys-color-outline-variant: 73 69 79;

    /* Background */
    --md-sys-color-background: 28 27 31;
    --md-sys-color-on-background: 230 225 229;
  }
}
```

## Usage Examples

### Button with Primary Color
```tsx
<button className="bg-primary text-on-primary px-6 py-3 rounded-full">
  Primary Action
</button>
```

### Card with Surface Color
```tsx
<div className="bg-surface text-on-surface rounded-xl shadow-md p-6">
  <h2 className="text-on-surface">Card Title</h2>
  <p className="text-on-surface-variant">Secondary text</p>
</div>
```

### Error Message
```tsx
<div className="bg-error-container text-on-error-container p-4 rounded-lg">
  <p>An error occurred</p>
</div>
```

## Color Generation Tools

### Material Theme Builder
https://m3.material.io/theme-builder

1. ブランドカラー（Primary）を入力
2. 自動的に全ての色役割を生成
3. ライトモード・ダークモード両対応
4. CSS、JSON、Kotlinなどでエクスポート可能

### Material Color Utilities
https://github.com/material-foundation/material-color-utilities

プログラマティックに色を生成するためのライブラリ（TypeScript, Java, C++, Dart, Swift対応）

## Best Practices

1. **常に色の役割を使用する**: `bg-blue-500`ではなく`bg-primary`を使用
2. **コントラスト比を確認**: WCAG AA基準（4.5:1）以上を維持
3. **ダークモード対応**: 全ての色役割にダークモード用の値を定義
4. **ブランド一貫性**: Material Theme Builderで生成した色を使用
5. **セマンティックな使用**: Errorは破壊的アクション、Primaryはポジティブアクションなど

## Accessibility Considerations

- **On-color variants**: 常に十分なコントラストを持つ
- **Container variants**: より控えめな背景として使用
- **Variant colors**: 二次的な情報に使用し、主要情報には使わない
- **Testing**: Chrome DevToolsのアクセシビリティチェッカーで確認
