# TANEBI CREATIVE コーポレートサイト

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)](https://vercel.com/)

個人事業 TANEBI CREATIVE の公式サイト（[tanebi-net.com](https://tanebi-net.com)）。企画・設計・実装・運用をすべて1人で担当。

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) / React 19 / TypeScript 5 |
| 3Dグラフィックス | Three.js / React Three Fiber / カスタムGLSLシェーダー (16本) |
| スタイリング | Tailwind CSS / shadcn/ui (Radix UI) |
| アニメーション | GSAP / Framer Motion |
| バックエンド | Server Actions / Prisma / Supabase (PostgreSQL) |
| CMS | microCMS |
| メール送信 | Resend |
| バリデーション | Zod / React Hook Form |
| コード品質 | Biome (Linter + Formatter) |
| AI開発 | Claude Code (カスタムスキル / QAレビューエージェント / CLAUDE.md 開発憲章) |
| CI/CD | GitHub Actions → Vercel |
| SEO/AIO | JSON-LD 構造化データ / llms.txt / 動的サイトマップ |
| セキュリティ | sanitize-html (XSS対策) / セキュリティヘッダー / dotenvx (環境変数暗号化) |

## アーキテクチャ設計

### Server Components First

ページコンポーネントは原則 RSC として実装し、`"use client"` は Three.js シーンやフォームなどインタラクション必須の箇所に限定。フォーム送信は Server Actions で完結させ、API ルートを排除した。microCMS からのデータ取得は RSC 内で直接 `await` し、取得済みデータを Client Component に props として渡す構造にしている。

### Three.js の SSR 除外とパフォーマンス最適化

Three.js コンポーネントは `dynamic(() => import("./hero-canvas"), { ssr: false })` でクライアント限定にし、SSR 時のエラーとバンドル肥大化を回避。モバイル判定でパーティクル数を削減（1500 → 800）し、テクスチャキャッシングと `useRef` ベースのスクロール制御で不要な React 再レンダリングを抑止している。

### 三層アニメーション設計

アニメーションを Three.js（3Dシーン全体）/ GSAP（スクロール駆動のDOM制御）/ Framer Motion（コンポーネント遷移）の3層に分離。`hero-canvas.tsx`（1039行）がスクロール進行率に応じてカメラ・パーティクル・カード表示をフレーム単位で制御している。

### SEO/AIO/LLMO 対応

JSON-LD 構造化データ（Organization, WebSite, Service）をトップページに埋め込み、ブログ記事には動的メタデータを生成。`llms.txt` を配置して LLM クローラー向けの情報を提供し、`robots.txt` で GPTBot・Claude-Web・PerplexityBot 等の AI クローラーを許可している。

## ディレクトリ構成

```
src/
├── app/
│   ├── actions/          # Server Actions (お問い合わせ, 応募)
│   ├── blog/             # ブログ機能 (microCMS連携, SSG)
│   ├── components/       # ページ固有コンポーネント (Colocation)
│   ├── page.tsx          # トップページ (RSC, JSON-LD)
│   └── sitemap.ts        # 動的サイトマップ生成
├── components/
│   ├── three/            # Three.js 3Dシーン (16 GLSLシェーダー)
│   ├── blog/             # ブログUI
│   ├── contact/          # お問い合わせフォーム
│   └── ui/               # 共通UIコンポーネント (shadcn/ui)
├── lib/                  # ユーティリティ (microCMS, Prisma, SEO, sanitize)
├── contexts/             # React Context
└── types/                # 型定義
public/
├── shaders/              # GLSLシェーダーファイル (16本)
├── llms.txt              # LLMクローラー向け情報
└── robots.txt            # クローラー制御
```

## 実装ハイライト

<details>
<summary>カスタムGLSLシェーダー（16本）</summary>

vertex/fragment ペア8組のシェーダーを `public/shaders/` に配置し、`raw-loader` で読み込み。星空パーティクルでは恒星のスペクトル分類（O型〜M型）に基づいた色・サイズ分布を実装し、紫星雲・天の川・流れ星・ポータル・流体エフェクトなどの視覚表現を組み合わせている。

</details>

<details>
<summary>スクロール駆動の3Dシーン制御</summary>

`hero-canvas.tsx` でスクロール進行率（0〜1）をリアルタイムに計算し、フェーズごとにカメラ位置・パーティクル表示・動画カードの配置・セクション遷移を制御。値の管理には `useRef` を使い、React の再レンダリングサイクルから切り離すことでフレームレートを維持している。

</details>

<details>
<summary>Server Actions によるフォーム処理</summary>

お問い合わせフォームは Zod スキーマでバリデーション → Resend API でメール送信という Server Action で完結。型安全な状態管理（`ContactState` 型）でエラーハンドリングを行い、API ルートを介さずにフォーム処理を実現している。

</details>

<details>
<summary>セキュリティ対策</summary>

`next.config.ts` でセキュリティヘッダー4種（X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy）を設定。microCMS から取得した HTML コンテンツには `sanitize-html` を適用し、許可タグ・許可属性・許可ドメインを明示的に指定して XSS を防止。環境変数は dotenvx で暗号化管理している。

</details>

<details>
<summary>Claude Code によるAI駆動開発</summary>

`CLAUDE.md` にプロジェクトの開発憲章（技術スタック、Git Flow、コーディング規約、開発ワークフロー）を定義し、AIアシスタントとの協業品質を標準化。用途別のカスタムスキルを作成し、定型作業を自動化している。

- **git-commit-workflow** — Conventional Commits 規約に沿ったコミット・PR作成フロー
- **ci-cd-workflow** — GitHub Actions ワークフローの生成・管理
- **dotenvx-setup** — 環境変数の暗号化管理セットアップ
- **prisma-migration-assistant** — Prisma スキーマ変更時の安全なマイグレーション
- **project-scaffold** — 新規プロジェクトの初期構成生成
- **qa-reviewer** — 実装後のコード品質レビューエージェント

</details>

## CI/CD

PR 作成時に GitHub Actions で Biome lint + Next.js build チェックを自動実行。main ブランチへのマージで Vercel に自動デプロイ。

## ライセンス

ソースコードは参考としてご覧いただけます。サイトのデザイン・コンテンツの無断転用はご遠慮ください。
