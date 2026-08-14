import type { BlogPost, BlogPostsResponse } from "./microcms";

// 長文記事（目次あり・スクロール十分）
const MOCK_CONTENT_LONG = `
<h2>はじめに</h2>
<p>この記事では、Next.js App Router を使ったプロジェクト構成について解説します。React Server Components（RSC）を活用することで、パフォーマンスとDXの両立が可能になります。</p>
<p>従来の Pages Router では <code>getServerSideProps</code> や <code>getStaticProps</code> を使ったデータフェッチが主流でしたが、App Router ではコンポーネント自体を <code>async</code> にすることで、より直感的なデータ取得が可能です。この変化はアーキテクチャ全体に影響を与え、コンポーネントの責務分離やキャッシュ戦略の考え方も大きく変わりました。</p>

<h2>プロジェクト構成</h2>
<h3>ディレクトリ構造</h3>
<p>App Router では、<code>app/</code> ディレクトリ内にルーティングを定義します。各ディレクトリが URL のパスセグメントに対応し、<code>page.tsx</code> がそのルートのエントリーポイントになります。</p>

<pre><code>src/
├── app/
│   ├── page.tsx          # / (トップページ)
│   ├── blog/
│   │   ├── page.tsx      # /blog (一覧)
│   │   └── [slug]/
│   │       └── page.tsx  # /blog/:slug (詳細)
│   └── layout.tsx        # 共通レイアウト
├── components/
│   ├── ui/               # 共通UIコンポーネント
│   └── blog/             # ブログ固有コンポーネント
└── lib/                  # ユーティリティ</code></pre>

<p>ポイントは <strong>Colocation</strong>（コロケーション）の原則です。特定のページでしか使わないコンポーネントは、そのページのディレクトリ内に配置します。共通で使うものだけを <code>components/</code> に置くことで、どこで何が使われているかが一目でわかります。</p>

<h3>Server Components と Client Components の使い分け</h3>
<p>原則として、すべてのコンポーネントは Server Component として作成します。<code>"use client"</code> を付与するのは、以下のケースに限定します。</p>

<ul>
<li>ユーザーインタラクション（クリック、ホバー、フォーム入力）が必要な場合</li>
<li>ブラウザ API（<code>window</code>, <code>localStorage</code>）へのアクセスが必要な場合</li>
<li><code>useState</code>, <code>useEffect</code> などの React Hooks を使用する場合</li>
</ul>

<p>この使い分けにより、クライアントに送信される JavaScript のバンドルサイズを最小化できます。たとえば、このサイトではブログ記事の本文は完全にサーバーサイドでレンダリングされ、クライアントには HTML として届きます。Three.js のような重いライブラリだけが Client Component として切り出されています。</p>

<h3>レイアウトの階層設計</h3>
<p>App Router の <code>layout.tsx</code> はネストが可能です。ルートレイアウトでは共通のヘッダー・フッター・メタデータを定義し、<code>blog/layout.tsx</code> のようなサブレイアウトでセクション固有のナビゲーションやスタイルを追加できます。</p>
<p>レイアウトは遷移時にも再レンダリングされないため、パフォーマンスの面でも有利です。たとえば、ブログ一覧から記事詳細に遷移する際、共通レイアウト部分はそのまま維持され、変更があったコンテンツ部分だけが差し替わります。</p>

<h2>データフェッチング</h2>
<p>Server Component 内で直接 <code>async/await</code> を使ってデータを取得できます。これにより、<code>useEffect</code> でのフェッチが不要になり、ウォーターフォールを防ぎやすくなります。</p>

<blockquote>
<p>Server Components でのデータフェッチは、コンポーネントレベルでのキャッシュ戦略と組み合わせることで、最も効果的に機能します。</p>
</blockquote>

<p>このサイトでは microCMS からのデータ取得をすべて Server Component で行っています。ブログ一覧ページでは <code>getBlogPosts()</code> を呼び出し、取得したデータを Client Component である <code>BlogTabs</code> に props として渡しています。</p>

<h3>キャッシュと再検証</h3>
<p>Next.js の <code>fetch</code> は自動的にキャッシュされます。ただし、CMS のコンテンツは更新頻度が高いため、On-Demand Revalidation を採用しました。microCMS の Webhook を受け取る API ルート（<code>/api/revalidate</code>）を設置し、記事の公開・更新・削除時にキャッシュを破棄して再生成します。</p>
<p>この仕組みにより、通常時はキャッシュされた高速なレスポンスを返しつつ、CMS で記事を更新した瞬間に最新のコンテンツが反映されます。ISR（Incremental Static Regeneration）のように一定時間ごとに再検証するのではなく、実際に変更が起きたタイミングでのみ再検証するため、無駄なリクエストが発生しません。</p>

<h2>パフォーマンス最適化</h2>
<h3>画像の最適化</h3>
<p>Next.js の <code>Image</code> コンポーネントを使用することで、自動的に WebP/AVIF への変換、遅延読み込み、サイズ最適化が行われます。ブログのアイキャッチ画像では <code>sizes</code> 属性を適切に設定し、ビューポートに応じた最適なサイズの画像を配信しています。</p>
<p>また、Three.js で使用するテクスチャは <code>useTexture</code> フックでキャッシュし、同じテクスチャが複数のコンポーネントから参照されても一度だけ読み込まれるようにしています。</p>

<h3>フォントの最適化</h3>
<p><code>next/font</code> を使用して、Geist フォントをセルフホストしています。外部リクエストが発生しないため、CLS（Cumulative Layout Shift）を防ぎ、パフォーマンスを向上させています。</p>
<p>Geist は Vercel が設計したフォントで、テクノロジー企業向けに最適化されたサンセリフ体です。コード表示には等幅の Geist Mono を使い分けることで、技術ブログとしての可読性を高めています。</p>

<h3>Three.js のパフォーマンス</h3>
<p>Three.js のシーンは <code>dynamic import</code> + <code>ssr: false</code> でクライアント限定にしています。SSR 時に Three.js が読み込まれないため、サーバーサイドのレンダリング速度に影響しません。</p>
<p>さらに、モバイル端末ではパーティクル数を 1500 から 800 に削減し、GPU 負荷を軽減しています。スクロール位置の管理には <code>useRef</code> を使い、React の再レンダリングサイクルから切り離すことで、60fps のフレームレートを維持しています。</p>

<h2>セキュリティ対策</h2>
<p>外部から取得した HTML コンテンツ（microCMS のブログ記事）には <code>sanitize-html</code> を適用し、XSS を防止しています。許可するタグ・属性・ドメインを明示的に指定するホワイトリスト方式を採用しています。</p>
<p>環境変数は dotenvx で暗号化管理しており、<code>.env.local</code> に平文で秘密情報を置く必要がありません。セキュリティヘッダーは <code>next.config.ts</code> で 4 種（X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy）を設定しています。</p>

<h2>CI/CD パイプライン</h2>
<p>GitHub Actions で PR 作成時に Biome lint と Next.js build チェックを自動実行しています。lint エラーやビルドエラーがある PR はマージできない仕組みにすることで、main ブランチの品質を保っています。</p>
<p>Vercel との連携により、<code>dev</code> ブランチへのマージでステージング環境に、<code>main</code> ブランチへのマージで本番環境に自動デプロイされます。PR ごとにプレビューデプロイも生成されるため、レビュー時に実際の動作を確認できます。</p>

<h2>まとめ</h2>
<p>Next.js App Router は、Server Components を中心としたアーキテクチャにより、パフォーマンスと開発体験を大幅に改善します。特に、コンテンツ中心のサイトでは、その恩恵を最大限に受けることができます。</p>
<p>このプロジェクトでは、RSC First の原則に従いつつ、Three.js のような重いクライアント処理だけを Client Component に分離する設計を徹底しました。結果として、初回読み込みのパフォーマンスを維持しながら、リッチなインタラクティブ体験を提供できています。</p>
<p>技術選定においては「なぜその技術を選んだか」を常に意識し、トレードオフを理解した上で判断することが重要です。流行りの技術を闇雲に採用するのではなく、プロジェクトの要件に対して最適な選択をすることが、長期的に保守しやすいコードベースにつながります。</p>
`;

// 短文記事（見出し少ない・スクロール不要）
const MOCK_CONTENT_SHORT = `
<h2>React Three Fiber とは</h2>
<p>React Three Fiber（R3F）は、Three.js を React のコンポーネントモデルで扱うためのライブラリです。宣言的に3Dシーンを構築でき、React のライフサイクルと自然に統合されます。</p>
<p><code>Canvas</code> コンポーネントがシーンのルートになります。内部に配置したコンポーネントが Three.js のオブジェクトとして描画されます。アニメーションには <code>useFrame</code> フックを使い、毎フレーム呼ばれるコールバック内で ref 経由でオブジェクトのプロパティを直接操作します。</p>
`;

// 中間パターン（見出しあり・やや短い）
const MOCK_CONTENT_MEDIUM = `
<h2>Biome とは</h2>
<p>Biome は Rust 製の高速な Linter + Formatter です。ESLint と Prettier の役割を1つのツールで担い、設定ファイルも <code>biome.json</code> 一つで完結します。</p>

<h2>導入手順</h2>
<p>既存プロジェクトへの導入は簡単です。</p>
<pre><code>pnpm add -D @biomejs/biome
pnpm biome init</code></pre>
<p>生成された <code>biome.json</code> をプロジェクトに合わせてカスタマイズします。保存時の自動フォーマットを有効にすれば、開発中は意識することなくコードスタイルが統一されます。</p>

<h2>ESLint + Prettier との比較</h2>
<p>ESLint と Prettier を併用する場合、<code>eslint-config-prettier</code> でルールの競合を防ぐ設定が必要です。Biome はこの問題を根本的に解消し、1つの設定ファイルですべてをカバーします。実行速度も Rust 製ゆえに ESLint の 10〜20 倍高速です。</p>
`;

const MOCK_POSTS: BlogPost[] = [
	{
		id: "mock-nextjs-app-router",
		title: "Next.js App Router でのプロジェクト構成ガイド",
		content: MOCK_CONTENT_LONG,
		category: ["技術", "Next.js"],
		eyecatch: { url: "/images/ogp.jpg", width: 1200, height: 630 },
		publishedAt: "2026-01-15T09:00:00.000Z",
		createdAt: "2026-01-15T09:00:00.000Z",
		updatedAt: "2026-01-20T12:00:00.000Z",
		revisedAt: "2026-01-20T12:00:00.000Z",
	},
	{
		id: "mock-threejs-r3f",
		title: "Three.js × React Three Fiber でインタラクティブな3Dシーンを作る",
		content: MOCK_CONTENT_SHORT,
		category: ["技術", "Three.js"],
		eyecatch: { url: "/images/ogp.jpg", width: 1200, height: 630 },
		publishedAt: "2026-02-01T09:00:00.000Z",
		createdAt: "2026-02-01T09:00:00.000Z",
		updatedAt: "2026-02-05T12:00:00.000Z",
		revisedAt: "2026-02-05T12:00:00.000Z",
	},
	{
		id: "mock-biome-setup",
		title: "Biome で ESLint + Prettier を置き換える",
		content: MOCK_CONTENT_MEDIUM,
		category: ["技術"],
		eyecatch: { url: "/images/ogp.jpg", width: 1200, height: 630 },
		publishedAt: "2026-03-10T09:00:00.000Z",
		createdAt: "2026-03-10T09:00:00.000Z",
		updatedAt: "2026-03-10T09:00:00.000Z",
		revisedAt: "2026-03-10T09:00:00.000Z",
	},
];

export function getMockBlogPosts(limit = 12, offset = 0): BlogPostsResponse {
	const sliced = MOCK_POSTS.slice(offset, offset + limit);
	return {
		contents: sliced,
		totalCount: MOCK_POSTS.length,
		offset,
		limit,
	};
}

export function getMockBlogPost(id: string): BlogPost | undefined {
	return MOCK_POSTS.find((p) => p.id === id) ?? MOCK_POSTS[0];
}
