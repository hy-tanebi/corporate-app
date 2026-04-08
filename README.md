# TANEBI CREATIVE

> 個人事業 TANEBI CREATIVE のコーポレートサイト（<a href="https://tanebi-net.com" target="_blank" rel="noopener noreferrer">tanebi-net.com</a>）


## はじめに

このリポジトリは、ポートフォリオとしても公開しています。
企画・デザイン・実装・運用を担当しました。


<!-- TODO: デモ動画を埋め込み予定 -->

---

## コンセプト

### 世界観

TANEBI（種火）という社名には、暗闇の中にある小さな火——希望の始まり——という意味が込められています。サイト全体のビジュアルテーマはこの世界観から設計しました。

暗く広い宇宙空間は、クライアントが抱えるさまざまな課題や不確かさを表しています。その中心に輝く三角形がクライアントに合う課題解決であり、「伴走しながら課題解決へ向かう」存在を象徴しています。

### ファーストビューに 3D を選んだ理由

クリエイティブ業として、**最初の数秒で技術力と世界観を同時に伝える**ことを優先しました。テキストや静止画では「説明」にとどまりますが、インタラクティブな 3D 空間は「体験」として記憶に残ります。スクロールに連動して変化するシーンは、サイトを最後まで読み進める動機づけにもなっています。

### 三角形のシンボリズム

三角形は、私が好きな音楽が3つの要素・構成（メロディ・ダンス・リズム）から成り立っていることや、三方良しの概念から着想を得ています。このサイトでもクライアント・課題・解決策という三者の関係性を三角形で表現しています。

三角形はあえて**2層構造**にしています：

- **内側（塗りつぶし）**: 中心となる課題に正面から向き合い、伴走するイメージ
- **外側（ワイヤーフレーム）**: 枠の中に閉じこもらず、常に外へと開拓・取り入れていく柔軟な姿勢

三角形はゆっくりと自転しながら色が変化します。色が固定されていないのは、「解決策は一つではなく、クライアントの状況に応じて柔軟に変わる」ことを表しています。多色展開はクライアントの業種・課題・状況の多様さそのものです。

### 星空と宇宙飛行士

無数の星は「数多ある選択肢や解決の可能性」を表しています。その宇宙空間を漂う宇宙飛行士がクライアントです。広大で不確かな空間の中で、最適な答えを一緒に見つけていく——そのパートナーシップがこのサイトのビジュアルに込めた物語です。

### フォント

**Geist / Geist Mono**（Vercel 製）を採用しています。テクノロジー企業らしい洗練されたサンセリフ体でありながら、高い可読性を持つのが特長です。デプロイ先の Vercel が設計したフォントという技術スタックとの一貫性も、採用の理由の一つです。コード表示には等幅の Geist Mono を使い、技術ブログとしての信頼感も担保しています。

---

## 技術スタック

<p>
  <a href="https://nextjs.org/"><img src="https://skillicons.dev/icons?i=nextjs" alt="Next.js" width="48" height="48" /></a>
  <a href="https://react.dev/"><img src="https://skillicons.dev/icons?i=react" alt="React" width="48" height="48" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://skillicons.dev/icons?i=ts" alt="TypeScript" width="48" height="48" /></a>
  <a href="https://threejs.org/"><img src="https://skillicons.dev/icons?i=threejs" alt="Three.js" width="48" height="48" /></a>
  <a href="https://tailwindcss.com/"><img src="https://skillicons.dev/icons?i=tailwind" alt="Tailwind CSS" width="48" height="48" /></a>
  <a href="https://prisma.io/"><img src="https://skillicons.dev/icons?i=prisma" alt="Prisma" width="48" height="48" /></a>
  <a href="https://supabase.com/"><img src="https://skillicons.dev/icons?i=supabase" alt="Supabase" width="48" height="48" /></a>
  <a href="https://vercel.com/"><img src="https://skillicons.dev/icons?i=vercel" alt="Vercel" width="48" height="48" /></a>
  <a href="https://github.com/features/actions"><img src="https://skillicons.dev/icons?i=githubactions" alt="GitHub Actions" width="48" height="48" /></a>
</p>

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

## 技術選定の理由

<details>
<summary><strong>Next.js 15 (App Router) — Pages Router ではなく App Router を採用した理由</strong></summary>

React Server Components（RSC）をファーストクラスで扱える点が決め手です。このサイトはブログ記事や会社情報など**読み取り中心のコンテンツが大半**であり、サーバー側でデータ取得・レンダリングを完結させることで、クライアントに送る JavaScript 量を最小化できます。Pages Router の `getServerSideProps` / `getStaticProps` でも SSR/SSG は可能ですが、App Router なら**コンポーネント単位で server/client を選択**でき、Three.js シーンのような重いクライアント処理だけを `"use client"` で切り出す設計が自然に書けます。

また、Server Actions によりフォーム送信を API ルートなしで実装でき、コードベースがシンプルになる点も採用理由の一つです。

</details>

<details>
<summary><strong>Three.js / React Three Fiber — コーポレートサイトに 3D を導入した理由</strong></summary>

クリエイティブ事業のサイトとして「技術力を体験として伝える」ことが目的です。静的な画像やテキストでは差別化が難しいため、ファーストビューに 3D シーンを配置し、スクロールに連動したインタラクティブな演出を実装しました。

React Three Fiber を選んだのは、**React のコンポーネントモデルと Three.js を統合**できるためです。素の Three.js だと React のライフサイクルとの整合を自前で管理する必要がありますが、R3F なら `useFrame` や `useRef` で React の作法に沿った 3D 開発ができます。drei ライブラリで定型処理（OrbitControls, Text など）も効率化しています。

</details>

<details>
<summary><strong>microCMS と Supabase の使い分け — なぜ CMS を分離したか</strong></summary>

**microCMS** → ブログ記事（コンテンツ管理）  
**Supabase** → お問い合わせ・応募データ（リレーショナルデータ）

Supabase 単体でブログも管理できますが、記事の執筆・編集・画像管理・プレビューといった**編集体験は専用 CMS の方が圧倒的に優れています**。microCMS は日本語対応の管理画面と、リッチエディタによる直感的な記事作成が強みです。一方、お問い合わせデータのようなリレーショナルデータは Supabase（PostgreSQL）で型安全に管理する方が適切です。

「コンテンツはコンテンツ管理に最適化されたサービスで、データはデータベースで」という責務の分離を意識した選定です。

</details>

<details>
<summary><strong>Biome — ESLint + Prettier ではなく Biome を採用した理由</strong></summary>

ESLint と Prettier の組み合わせでは、設定ファイルの競合（`eslint-config-prettier` の導入が必要）や、2 つのツール間のルール整合性の維持にコストがかかります。Biome は **Linter と Formatter を単一ツールに統合**しており、設定ファイルは `biome.json` 一つで完結します。

Rust 製で実行速度も高速（ESLint 比で 10〜20 倍程度）なため、保存時の自動フォーマットや CI での lint チェックがストレスなく回ります。個人開発で設定管理の負荷を下げつつ、コード品質を保つ選択として合理的と判断しました。

</details>

<details>
<summary><strong>GSAP + Framer Motion — アニメーションライブラリを 2 つ併用する理由</strong></summary>

役割を明確に分離しています：

- **GSAP** → ScrollTrigger によるスクロール駆動の DOM アニメーション（セクション遷移、パララックス）。タイムラインベースの精密な制御が必要な場面で使用しています。
- **Framer Motion** → コンポーネントの mount/unmount アニメーション（フェードイン、スライド）。React の宣言的な記法と相性が良く、`animate` / `exit` props で簡潔に書けます。

1 つのライブラリに統一することも検討しましたが、GSAP は「スクロール位置に応じた精密制御」、Framer Motion は「React コンポーネントの状態遷移」とそれぞれ得意領域が異なるため、適材適所で使い分ける設計としました。

</details>

<details>
<summary><strong>Server Actions — API ルートを使わない理由</strong></summary>

お問い合わせフォームや応募フォームの送信処理を、`app/actions/` に Server Actions として実装しています。従来の API ルート（`app/api/`）を経由する方法と比較して：

- **型安全**: フォームの入力値と Server Action の引数が TypeScript で直接つながります
- **コード量の削減**: `fetch()` による API 呼び出しと、API ルート側のハンドラ定義が不要です
- **コロケーション**: フォームコンポーネントとサーバー処理が近い場所に配置され、コードの見通しが良くなります

外部から呼び出される API が不要な（＝自サイトのフォーム送信のみ）ユースケースでは、Server Actions の方がシンプルに実装できます。

</details>

<details>
<summary><strong>Prisma — Supabase を使うのに ORM を挟む理由</strong></summary>

Supabase は `supabase-js` クライアントを提供していますが、Prisma を ORM として採用した理由は**型安全性とマイグレーション管理**です。`prisma generate` でスキーマから TypeScript 型が自動生成されるため、データベースの構造変更がコンパイル時に検出できます。また、`prisma migrate` でスキーマ変更の履歴を Git 管理でき、環境間の差異を防げます。

Supabase クライアントは RLS（Row Level Security）やリアルタイム機能が必要な場合に有効ですが、このサイトではサーバーサイドからの単純な CRUD が中心のため、Prisma の型安全なクエリビルダーの方が開発効率が高いと判断しました。

</details>

<details>
<summary><strong>Claude Code — AI を開発ワークフローに組み込んだ理由</strong></summary>

個人開発では、設計・実装・レビュー・テストをすべて1人で回す必要があります。コードレビューの目がない環境では品質の属人化が避けられず、疲労時のミスや設計判断のブレが蓄積しやすくなります。

Claude Code を導入した目的は、**1人開発でもチーム開発に近い品質管理プロセスを維持すること**です。具体的には：

- **CLAUDE.md（開発憲章）**: 技術スタック、Git Flow、コーディング規約、開発ワークフローを明文化し、AI アシスタントとの協業品質を標準化しています。人間が忘れがちなルール（Conventional Commits、lint/build の事前チェックなど）を AI 側が常に参照することで、品質のばらつきを抑えています
- **カスタムスキル（Skills）**: 定型だが手順の多い作業をスラッシュコマンドとして定義し、再現性のある開発フローを実現しています。スキルはスコープに応じてグローバル・ローカルに使い分けています
  - **グローバルスキル**（`~/.claude/skills/` — 全プロジェクト共通）: `ci-cd-workflow`（GitHub Actions ワークフロー生成）/ `git-commit-workflow`（Conventional Commits 規約に沿ったコミット・PR フロー）/ `dotenvx-setup`（環境変数の暗号化管理）/ `project-scaffold`（新規プロジェクトの初期構成生成）/ `git-worktree-workflow`（複数ブランチの並行開発）
  - **ローカルスキル**（`.claude/skills/` — このプロジェクト専用）: `claude-skill-creator`（スキル作成ガイド）/ `material-design`（UI コンポーネント設計）
  - **インストール済みスキル**: `prisma-migration-assistant`（スキーマ変更の安全なマイグレーション）/ `vercel-react-best-practices`（Next.js パフォーマンス最適化）/ `shadcn-ui`（コンポーネント実装）
- **QA レビューエージェント**: 実装完了後にコード品質レビューを実行し、セキュリティリスクやパフォーマンス上の問題を機械的にチェックしています

また、Claude Code はターミナル上で動作する CLI ツールでありながら、対話的な UI/UX が非常に直感的です。コードの差分表示、ファイル操作の確認プロンプト、ツール実行の可視化など、**開発者が「何が起きているか」を常に把握できる設計**になっており、AI の出力をブラックボックスにしない点が信頼して使える理由の一つです。

AI に任せきりにするのではなく、**「AI が従うべきルールを人間が設計し、AI がそのルールに基づいて支援する」**という構造を作ることで、開発速度と品質を両立させています。

</details>

## アーキテクチャ

### システム全体図

```mermaid
graph LR
    User["ユーザー"]

    subgraph Vercel["Vercel"]
        NextJS["Next.js 15<br/>(App Router)"]
        RSC["React Server<br/>Components"]
        SA["Server Actions"]
    end

    subgraph External["外部サービス"]
        microCMS["microCMS"]
        Resend["Resend"]
    end

    subgraph Supabase["Supabase"]
        PostgreSQL[("PostgreSQL")]
    end

    subgraph CI["CI/CD"]
        GHA["GitHub Actions"]
    end

    User -->|"リクエスト"| NextJS
    NextJS --> RSC
    NextJS --> SA
    RSC -->|"記事取得"| microCMS
    SA -->|"メール送信"| Resend
    SA -->|"Prisma ORM"| PostgreSQL
    GHA -->|"lint + build"| Vercel
```

### レンダリング構成

```mermaid
graph TB
    subgraph Server["Server Components (RSC)"]
        TopPage["トップページ<br/>page.tsx"]
        BlogList["ブログ一覧<br/>blog/page.tsx"]
        BlogPost["ブログ記事<br/>blog/[slug]/page.tsx"]
    end

    subgraph Client["Client Components"]
        ThreeJS["Three.js シーン<br/>hero-canvas.tsx"]
        Form["お問い合わせフォーム<br/>React Hook Form + Zod"]
        Animations["アニメーション<br/>GSAP / Framer Motion"]
    end

    subgraph Actions["Server Actions"]
        Contact["contact.ts<br/>メール送信"]
        Application["application.ts<br/>応募処理"]
    end

    TopPage -->|"dynamic import<br/>ssr: false"| ThreeJS
    TopPage --> Animations
    TopPage --> Form
    Form -->|"action"| Contact
    Form -->|"action"| Application
    BlogList -->|"await fetch"| CMS["microCMS"]
    BlogPost -->|"await fetch"| CMS
```

---

## アーキテクチャ設計

### Server Components First

ページコンポーネントは原則 RSC として実装し、`"use client"` は Three.js シーンやフォームなどインタラクション必須の箇所に限定しています。フォーム送信は Server Actions で完結させ、API ルートを排除しました。microCMS からのデータ取得は RSC 内で直接 `await` し、取得済みデータを Client Component に props として渡す構造にしています。

### Three.js の SSR 除外とパフォーマンス最適化

Three.js コンポーネントは `dynamic(() => import("./hero-canvas"), { ssr: false })` でクライアント限定にし、SSR 時のエラーとバンドル肥大化を回避しています。モバイル判定でパーティクル数を削減（1500 → 800）し、テクスチャキャッシングと `useRef` ベースのスクロール制御で不要な React 再レンダリングを抑止しています。

### 三層アニメーション設計

アニメーションを Three.js（3Dシーン全体）/ GSAP（スクロール駆動のDOM制御）/ Framer Motion（コンポーネント遷移）の3層に分離しています。`hero-canvas.tsx`（1039行）がスクロール進行率に応じてカメラ・パーティクル・カード表示をフレーム単位で制御しています。

### SEO/AIO/LLMO 対応

JSON-LD 構造化データ（Organization, WebSite, Service）をトップページに埋め込み、ブログ記事には動的メタデータを生成しています。`llms.txt` を配置して LLM クローラー向けの情報を提供し、`robots.txt` で GPTBot・Claude-Web・PerplexityBot 等の AI クローラーを許可しています。

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

vertex/fragment ペア8組のシェーダーを `public/shaders/` に配置し、`raw-loader` で読み込んでいます。星空パーティクルでは恒星のスペクトル分類（O型〜M型）に基づいた色・サイズ分布を実装し、紫星雲・天の川・流れ星・ポータル・流体エフェクトなどの視覚表現を組み合わせています。

</details>

<details>
<summary>スクロール駆動の3Dシーン制御</summary>

`hero-canvas.tsx` でスクロール進行率（0〜1）をリアルタイムに計算し、フェーズごとにカメラ位置・パーティクル表示・動画カードの配置・セクション遷移を制御しています。値の管理には `useRef` を使い、React の再レンダリングサイクルから切り離すことでフレームレートを維持しています。

</details>

<details>
<summary>Server Actions によるフォーム処理</summary>

お問い合わせフォームは Zod スキーマでバリデーション → Resend API でメール送信という Server Action で完結しています。型安全な状態管理（`ContactState` 型）でエラーハンドリングを行い、API ルートを介さずにフォーム処理を実現しています。

</details>

<details>
<summary>セキュリティ対策</summary>

`next.config.ts` でセキュリティヘッダー4種（X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy）を設定しています。microCMS から取得した HTML コンテンツには `sanitize-html` を適用し、許可タグ・許可属性・許可ドメインを明示的に指定して XSS を防止しています。環境変数は dotenvx で暗号化管理しています。

</details>

<details>
<summary>Claude Code によるAI駆動開発</summary>

`CLAUDE.md` にプロジェクトの開発憲章（技術スタック、Git Flow、コーディング規約、開発ワークフロー）を定義し、AIアシスタントとの協業品質を標準化しています。用途別のカスタムスキルを作成し、定型作業を自動化しています。

- **git-commit-workflow** — Conventional Commits 規約に沿ったコミット・PR作成フロー
- **ci-cd-workflow** — GitHub Actions ワークフローの生成・管理
- **dotenvx-setup** — 環境変数の暗号化管理セットアップ
- **prisma-migration-assistant** — Prisma スキーマ変更時の安全なマイグレーション
- **project-scaffold** — 新規プロジェクトの初期構成生成
- **qa-reviewer** — 実装後のコード品質レビューエージェント

</details>

## CI/CD

PR 作成時に GitHub Actions で Biome lint + Next.js build チェックを自動実行します。main ブランチへのマージで Vercel に自動デプロイされます。

## ライセンス

ソースコードは参考としてご覧いただけます。サイトのデザイン・コンテンツの無断転用はご遠慮ください。
