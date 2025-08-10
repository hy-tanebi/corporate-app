# CLAUDE.md: ポートフォリオサイト開発憲章

このファイルは、AIコーディングアシスタントClaudeが当プロジェクトで開発支援を行う際の、基本原則とルールを定めたものである。Claudeは、全ての応答とコード生成において、このファイルの内容を最優先事項として遵守すること。

---

## 1. プロジェクト概要

### 1.1. プロジェクト名
ポートフォリオ兼技術ブログサイト

### 1.2. 目的
- Next.js, Supabase, Three.js, microCMS等を用いたモダンなWeb開発スキルを証明する。
- 採用担当者やクライアントに対し、技術力とデザインセンスをアピールする。
- 自身の作品や知見をブログ記事として発信する。

### 1.3. 主要技術スタック
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **パッケージ管理**: pnpm
- **バックエンド/DB**: Supabase
- **ヘッドレスCMS**: microCMS
- **3Dグラフィックス**: Three.js (react-three-fiber, drei)
- **スタイリング**: Tailwind CSS
- **品質管理**: Biome (Formatter/Linter)
- **デプロイ**: Vercel

---

## 2. Git / GitHub 運用ルール

### 2.1. ブランチ戦略 (Git Flow)
- `main`: 本番環境。Vercelの本番デプロイに紐づく。直接のコミットは厳禁。
- `dev`: 開発の統合ブランチ。全ての`feature`ブランチは`dev`にマージされる。
- `feature/*`: 機能開発ブランチ。必ず`dev`から作成し、作業完了後は`dev`へのプルリクエストを作成する。

### 2.2. コミットメッセージ (Conventional Commits)
全てのコミットメッセージは[Conventional Commits](https://www.conventionalcommits.org/)の規約に従うこと。
- `feat:`: 新機能の追加
- `fix:`: バグ修正
- `docs:`: ドキュメントの変更
- `style:`: コードスタイルのみの変更（フォーマット修正など）
- `refactor:`: リファクタリング
- `test:`: テストの追加・修正
- `ci:`: CI/CD設定の変更
- `chore:`: 上記以外の雑務

例: `feat: Add header component`

### 2.3. プルリクエスト
- 全ての`feature`ブランチは、`dev`ブランチへのプルリクエストを通じてマージする。
- プルリクエストのタイトルは、変更内容が分かりやすいように記述する。
- Vercelのプレビューデプロイと、GitHub Actionsの`lint`チェックが成功することをマージの必須条件とする。

---

## 3. Next.js 開発ベストプラクティス (App Router)

### 3.1. 基本方針: RSC (React Server Components) First
**最重要原則。** コンポーネントは原則として**React Server Components (RSC)**として作成する。クライアントサイドでのインタラクティブ性や、ブラウザAPI（`window`など）へのアクセスが必要な場合にのみ、ファイルの先頭に`"use client"`を記述し、**Client Component**とすること。

### 3.2. 状態管理 (State Management)
**`useState`と`useEffect`の安易な使用は避ける。**
- **URL Stateを優先**: フィルター、ソート、検索クエリ、ページの表示状態など、UIの状態管理には、まずURLのSearch Params (`useSearchParams`, `useRouter`) の活用を検討する。これにより、状態がURLに反映され、共有やリフレッシュが可能になる。
- **サーバーサイドの状態管理**: サーバーから取得したデータは、サーバー側で管理・加工し、必要なものだけをコンポーネントにpropsとして渡す。クライアント側で加工するために`useState`や`useEffect`を使うのは避ける。
- **クライアントでの複雑な状態管理**: どうしてもクライアント側でグローバルな状態管理が必要な場合は、`useState`を多用するのではなく、`Zustand`や`Jotai`のような軽量な状態管理ライブラリの導入を検討する。

### 3.3. データフェッチング (Data Fetching)
- RSC内でのデータフェッチングは、コンポーネントを`async function`として定義し、直接`await fetch(...)`を記述する。
- `useEffect`内でのデータフェッチングは、原則として行わない。
- Next.jsが拡張した`fetch` APIを積極的に利用し、キャッシュや再検証（revalidation）の仕組みを活用する。

### 3.4. データ更新 (Mutations)
- フォームの送信やデータの更新処理は、**Server Actions**を第一選択とする。
- `action.ts`ファイルにロジックを記述し、フォームの`action`属性やイベントハンドラから呼び出すことで、APIルートを別途作成する手間を省き、堅牢なデータ更新処理を実装する。

### 3.5. ファイル構成
- コンポーネントやロジックは、可能な限りそれらを使用するルートの近くに配置する（Colocation）。例えば、特定のページでしか使わないコンポーネントは、そのページの`app/path/to/page/`ディレクトリ内に`components`フォルダを作って配置する。

---

## 4. その他

### 4.1. パッケージ管理
- **パッケージマネージャーは`pnpm`を使用すること。** `npm`や`yarn`ではなく、`pnpm`でのみ依存関係の管理を行う。
- 新しい依存関係のインストール: `pnpm add [package-name]`
- 開発依存関係のインストール: `pnpm add -D [package-name]`
- スクリプトの実行: `pnpm run [script-name]` または `pnpm [script-name]`
- 依存関係の削除: `pnpm remove [package-name]`

### 4.2. コーディング規約
- コードのフォーマットと静的解析は、**Biome**に完全に従う。エディタの保存時自動フォーマットを有効にし、常に規約が守られた状態を維持する。
- 個人の判断でBiomeのルールを無視しないこと。
