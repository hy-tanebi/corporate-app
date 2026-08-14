# パフォーマンス修正 設計書

作成日: 2026-08-12
状態: レビュー待ち
関連: [パフォーマンス調査レポート](https://claude.ai/code/artifact/89f52a2e-49ca-4e53-8e20-fa45080a7f78)

---

## 1. 背景

本番ビルドを実測したところ、コードの書き方ではなく「どのページに何が載っているか」に問題が集中していた。実測値（gzip後・noModule ポリフィル除く）:

| ページ | 現状 | 内訳 |
|---|---|---|
| `/` | 417 KB | 3Dシーン 229 / React・Next 基盤 104 / アプリ 84 |
| `/blog`, `/blog/[slug]` | 378 KB | 3Dシーン 229 / 基盤 104 / アプリ 45 |
| `/service`, `/service/issues`, `/works` | 257 KB | 基盤 100 / アプリ 157（うちフォント定義CSS 122） |

計測方法は、ビルド後の `index.html` / `blog.html` / `service.html` / `works.html` を解析し、実際に `<script>` / `<link rel="stylesheet">` として参照されるファイルを1つずつ集計した。`next build` が出力する「First Load JS」は動的インポート分を数えないため実態とずれる（トップは表示 407 KB に対し実測 417 KB）。

この設計書は、codex によるセカンドオピニオンレビュー（判定: 要修正）を反映済み。

---

## 2. 方針

### 2.1 分割の原則

変更を3つの層に分け、層ごとにブランチを分ける。

- **A層** — 見た目が変わらない。ビルド出力の数値だけで検証できる
- **B層** — 見た目・体験が変わる。ブラウザでの回帰確認が要る
- **C層** — ビルド基盤が変わる。アプリの変更と混ぜない

理由は、問題が出たときの原因の切り分けと、レビューの負荷を層ごとに揃えるため。A層は表示確認がほぼ不要でレビューが軽く、B層は確認対象が明確になる。

### 2.2 ベースラインを先に作る

Next.js 16 移行を最後に置く。先に上げると Turbopack のチャンク戦略変更と個別改善の効果が混ざり、どちらが効いたのか追えなくなる。

### 2.3 進行中ブランチの扱い

LP関連ファイル（`src/components/lp/fonts.ts`, `PageHero.tsx`, `src/app/service/layout.tsx`, `service/issues/page.tsx`）は `dev` に存在せず、すべて `feature/service-lp-pages` の未マージ資産。したがって LP のフォント修正だけは新ブランチを切らず、そのブランチ内で直す。公開前に直るため、368 KB の CSS は一度も本番に出ない。

---

## 3. 作業単位

### 単位 0: `fix/blog-sitemap-exclude`（dev から / 最初に入れる）

**目的**: 記事0件の `/blog` が `priority: 0.8` / `changeFrequency: "daily"` で sitemap に載り、`/works` と違って noindex も付いていない状態を解消する。

**変更**: `src/app/sitemap.ts:17-22` の `/blog` ブロックを削除する。`robots` は触らない。

noindex ではなく sitemap 除外のみを選んだ理由は、記事を公開したときに戻す箇所が1つで済むため。noindex にすると `robots` と `sitemap.ts` の2箇所を戻す必要があり、戻し忘れのリスクが増える。

**完了条件**: ビルドした `sitemap.xml` に `/blog` の URL が含まれないこと。記事一覧ページ自体は従来どおり表示できること。

---

### 単位 1: `feature/service-lp-pages`（進行中ブランチに追加）

**前提作業**: `src/app/service/page.tsx` の未コミット変更（5行追加 / 6行削除）を先に確認し、コミットするか破棄するかを決める。フォント修正と混ぜない。

**変更**: `src/components/lp/fonts.ts:12` の `weight: ["400","500","700","900"]` を削除する。

Noto Sans JP は可変フォント（ビルド出力の .woff2 を解析し、`fvar` / `gvar` / `avar` / `STAT` テーブルの存在を確認済み）。weight を列挙すると `next/font` は unicode-range ごとの `@font-face` を weight の数だけ複製する。実際の出力は `@font-face` 497個に対し参照ファイルは124個で、124の unicode-range すべてで4つの weight が同一ファイルを指していた。weight を省略すると可変軸の定義（`font-weight: 100 900`）になり、フォントデータは変わらないまま CSS が 1/4 になる。

**完了条件**:

- ビルド出力の CSS で `@font-face` が 497個 → 124個
- CSS サイズ 368 KB → 約 92 KB（gzip 122 KB → 約 31 KB）
- CSS 出力が `font-weight: 100 900` の可変定義になっていること
- `/service` `/service/issues` `/works` の3ページで、以下をブラウザ実機で確認（ユーザー実施）
  - 日本語の `font-bold`（700）と `font-black`（900）の見え方
  - 英数字と和文が混在する箇所、特に Anton と Noto の切り替わり
  - DevTools の computed style で `font-weight` が意図した値に解決されていること
- `pnpm lint` / `pnpm build` がエラー0件

---

### 単位 2: `feature/perf-bundle-trim`（dev から / 見た目は変わらない）

#### 2-a. 計測スクリプト

`scripts/measure-page-weight.mjs` を追加する。ビルド後の `.next/server/app/*.html` を解析し、参照される JS / CSS / preload されたフォントを集計する。

**要件**:

- HTML が参照する stylesheet / script と、preload されたフォント・画像を区別して記録する
- 初回必須チャンクと遅延チャンクを区別する
- raw / gzip / brotli の3つのサイズを出す
- URL の重複を排除する
- `noModule` 属性の付いたポリフィルは別枠にする

**位置づけ**: これは合格基準ではなく回帰検知の道具。ページの実体験（LCP / INP / CLS、CPU 負荷、モバイル GPU）は別途 Lighthouse や実機で見る必要がある。この区別をスクリプトの README コメントに明記する。

**先に入れる理由**: 以降の全ブランチで同じ方法の前後比較ができる。加えて Next.js 16 ではビルド出力から Size / First Load JS が消えるため、移行後の代替手段が要る。

#### 2-b. `src/middleware.ts` の削除

中身は `return NextResponse.next()` のみ。matcher は静的ファイルと API 以外の全パスにマッチし、ビルド出力は 34 kB。全ページの全リクエストで関数が起動している。ファイルごと削除する。

サイズより、余計な実行経路と運用対象が消えることに価値がある。Next.js 16 での `middleware.ts` → `proxy.ts` リネームも同時に不要になる。

#### 2-c. `ContactExperience` の新設と遅延化

**現状**: `src/app/components/MissionSection.tsx:13` が `ContactForm` を静的インポート（使用は `:761`）。MissionSection は `HomeClient` から静的インポートされるため、zod + react-hook-form + radix（gz 34 KB）がトップの初期バンドルに入る。加えて `src/components/Providers.tsx:24` の `<Toaster />` がルートレイアウトにあるため、sonner（gz 9 KB）が全ページに載る。`toast()` の呼び出しは `src/components/contact/contact-form.tsx` の3箇所のみ。

**変更**:

1. `ContactExperience` コンポーネントを新設し、`ContactForm` と、その画面専用の `<Toaster richColors position="top-center" />` を内包する
2. `MissionSection.tsx:22` の `ContactFormSection` を `dynamic(() => import(...), { ssr: false, loading: ... })` に差し替える
3. `Providers.tsx` から `<Toaster />` と sonner の import を削除する

`loading` には高さを固定したプレースホルダを置き、レイアウトのズレを出さない。

**この形にする理由**: `ContactForm` を dynamic 化するだけでは sonner は落ちない。Toaster がルートで静的にレンダリングされ続けるため。両方を同じ動的チャンクに入れることで初めて、zod / react-hook-form / radix / sonner が「お問い合わせ導線に到達したとき」まで遅延する。

**リスクと確認**: dynamic 化しても Next がチャンクを初期 HTML に出す可能性はある。ただしこのリポジトリでは `MissionContent`（同じく `dynamic` + `ssr: false`）の `framer-motion-vendor` が初期 HTML に0件であることを確認済みで、機能する見込みが高い。実ビルドで検証する。

#### 2-d. `AboutThreeImage` の遅延化

**現状**: `src/app/components/AboutThreeImage.tsx:3-10` が `@react-three/fiber` / drei / three を静的インポートしている。`AboutSection.tsx:5` → `MissionSection.tsx:14` → `HomeClient` と静的につながるため、three が初期グラフに入り、`index.html` に `<script src=".../three-vendor-*.js" async>` として出力される。

`HeroCanvasWrapper.tsx:29-37` の `requestIdleCallback` はマウントを遅らせること自体は正しく動いているが、この別経路が効果を打ち消していた。

**変更**: `AboutSection.tsx` から `AboutThreeImage` を `dynamic(() => import("./AboutThreeImage"), { ssr: false })` で読む。プレースホルダで領域の高さを維持する。

**効果**: トップの初期 HTML から three-vendor + react-reconciler が外れる。**総転送量は変わらない**（`requestIdleCallback` 後に読まれる）が、初期ロードのクリティカルパスから生 873 KB のパース・コンパイルが外れる。`AboutThreeImage` はページ最下部の About セクションなので、見た目には影響しない。

**完了条件（単位2全体）**:

- 計測スクリプトの出力で、トップの初期 HTML から `three-vendor` / `ff453dfd`（react-reconciler）/ zod チャンク / sonner が消えていること
- `/blog` と LP から sonner が消えていること
- `sitemap.xml` / 各ページの HTML が生成されること
- トップを最下部までスクロールして、About セクションの3D表現とお問い合わせフォームが従来どおり表示されること
- `/#contact` で直接アクセスしてフォームに到達できること
- フォーム送信の成功・失敗トーストが出ること
- `pnpm lint` / `pnpm build` がエラー0件

---

### 単位 3: `feature/perf-blog-cursor-loading`（単位2のマージ後 / 見た目が変わる）

#### 3-a. blog のカーソル演出を DOM 実装に置き換える

**現状**: `src/app/blog/layout.tsx:1` がブログレイアウトで `MousePointer` を静的インポートしている。中身は `<Canvas>` に `circleGeometry` + `meshBasicMaterial` で黄色い半透明の円を1つ描き、マウスに追従させるだけ。このために three-vendor（生 766 KB / gz 196 KB）と react-reconciler（生 107 KB / gz 33 KB）がブログ全ページに載る。加えて `src/components/three/mouse-pointer.tsx:60` は `useFrame` 内で `setCurrentPosition` を呼んでおり、毎秒60回の React 再レンダリングが走る。

**変更**: `src/components/three/mouse-pointer.tsx` を DOM 実装に置き換える。サイト内に既に three を使わない `src/components/three/HtmlHoverPointer.tsx` があるので、その書き方に揃える。

**実装条件**:

- `useState` を使わず `useRef` + `requestAnimationFrame` + `transform: translate3d()` で追従させる
- `pointer: fine` の端末でのみ有効化する（`matchMedia("(pointer: fine)")`）
- `prefers-reduced-motion: reduce` では追従アニメーションを止める
- `pointer-events: none` を維持し、リンクの hover とキーボード操作を壊さない
- three を使わなくなるので、ファイルを `src/components/three/` から移す

**効果**: `/blog`, `/blog/[slug]` が 378 KB → 149 KB（−61%）。毎秒60回の再レンダリングも解消。

#### 3-b. LoadingScreen の修正

**順序が重要**。以下を別コミットに分け、この順で行う。

**コミット1 — バグ修正（挙動を変えない）**

- `src/components/loading/LoadingScreen.tsx:18-21` の `useEffect` に cleanup を追加する。現状 `document.body.style.overflow = "hidden"` を設定したまま return が無く、途中で unmount や例外が起きるとスクロールが戻らない
- unmount の順序を整理する。現状 `handleStart(true)` は `setHasStarted(true)` の直後に `setTimeout(onLoadingComplete, 0)` を呼び、親の `Providers` が即座に `LoadingScreen` を unmount するため、`transition-opacity duration-1000` のフェードは走らずぶつ切りになっている。フェードを再生してから unmount する形にする

**コミット2 — 演出時間の短縮**

進捗演出を 2000 ms → **700 ms**、完了後の待機を 500 ms → **0 ms** にする。秒数だけを触るコミットにして、実物を見てから数値を調整しやすくする（調整範囲の目安は 600〜800 ms）。

**コミット3 — スクロール封鎖の撤去**

`document.body.style.overflow = "hidden"` をやめる。あわせて `src/app/components/HomeClient.tsx:110-114` の `/#contact` ジャンプ処理から、`document.body.style.overflow === "hidden"` を見る 300 ms リトライを削除する。

リトライを別のフラグに置き換えず削除する理由は、この分岐が防いでいたのは「スクロールがロックされている間の `window.scrollTo` の空振り」だけであり、封鎖をやめれば発生しなくなるため。`MissionSection` の展開待ちは同じ関数内の別の `setTimeout(..., 300)`（`:125-128`）が担っており、そちらは残す。

**効果**: トップで本文が読めるまで 2.5 秒（固定）→ 0.8 秒前後。スクロールは即座に可能になる。

#### 3-c. コメントの訂正

`src/components/three/HeroCanvasWrapper.tsx:29-37` のコメント「Three.js 初期化がメインスレッドの初期処理と競合しなくなり、TBT が改善」は、単位 2-d を入れて初めて成立する。実態に合わせて書き直す。これ自体は性能施策として数えない。

**完了条件（単位3全体）**:

- 計測スクリプトの出力で `/blog` が 378 KB → 149 KB 前後
- ブログ記事ページでカーソル演出が従来どおり動き、リンクの hover とキーボード操作が壊れていないこと
- タッチ端末とマウス無し環境でカーソル演出が出ないこと
- `prefers-reduced-motion: reduce` で追従が止まること
- トップの初回表示が 1 秒以内に本文に到達すること
- **`/#contact` の回帰確認**: 初回直アクセス、LP の CTA からの遷移、リロード後の遷移
- LoadingScreen 表示中にリロード・戻る操作をしてもスクロールが戻ること
- `pnpm lint` / `pnpm build` がエラー0件

---

### 単位 4: `feature/nextjs-16-upgrade`（単位3のマージ後 / 独立）

**目標**: Next.js 15.5.16 → **16.x の固定バージョン**。`latest` 指定は使わない。将来 Next 17 以降が latest になったとき、意図せず大規模アップグレードになるため。

**手順**:

1. 目標バージョンを明記して `next` / `react` / `react-dom` / `@types/react` / `@types/react-dom` を lockfile ごと固定する
2. Node.js の要件（20.9+）、Vercel のビルド環境、pnpm の Corepack 運用を先に確認する
3. codemod を実行する（`@next/codemod` も版を固定）
4. `next.config.ts` の `webpack()` を Turbopack 設定へ移行する
   - `.glsl` の raw-loader → `turbopack.rules`
   - `splitChunks.cacheGroups`（three / framer-motion）→ Turbopack に同等機能なし
5. `splitChunks` を失った影響を計測スクリプトと bundle analyzer で確認する。「自動分割に任せる」で済ませない
6. `.glsl` の import、production build、Vercel のプレビューデプロイを検証する
7. 問題が出た場合の退避として `next build --webpack` が使えることを確認しておく

**影響なしを確認済みの項目**: async `params` / `cookies()` / `headers()` / `draftMode()`（全箇所 await 済み）、並列ルートなし、AMP 未使用、`next lint` 未使用（Biome）、`serverRuntimeConfig` / `publicRuntimeConfig` なし、`unstable_*` なし、`scroll-behavior: smooth` なし、`experimental_ppr` なし、`quality` prop 未使用。

**注意**: `images.minimumCacheTTL` の既定が 60 秒 → 4 時間に変わる（microCMS 画像のキャッシュが伸びる方向で有利）。`images.qualities` の既定が `[75]` のみになるが `quality` prop 未使用のため影響なし。

**完了条件**: `pnpm build` がエラー0件。計測スクリプトの出力が単位3終了時点から悪化していないこと。Vercel のプレビューデプロイで全ページが表示できること。`.glsl` を使う3D表現が壊れていないこと。

---

### 単位 5: `chore/pnpm-supply-chain`（単位4とは独立）

Next.js 16 移行の必須作業ではないため、独立した PR に分ける。依存供給網ポリシーの変更であり、性質が違う。

- `packageManager` を pnpm 9.15.0 → 10.26 以降に更新する
- `pnpm-workspace.yaml` を追加し、`minimumReleaseAge: 10080` / `blockExoticSubdeps: true` / `verifyDepsBeforeRun: error` を設定する
- CI の `pnpm/action-setup` に `version:` を書かない（現状すでに正しい。維持を確認するだけ）
- `caniuse-lite` を更新する（ビルド時に「12か月古い」警告が出ている）

---

## 4. 今回のスコープ外

### 4-1. GLB のモバイル対応（独立した高優先度タスクとして起票する）

`src/components/three/Astronaut.tsx:21` の `useGLTF("/models/artro_draco.glb")` は 3.6 MB。`hero-canvas.tsx:801` を見る限りモバイルでも表示しており、position と scale が変わるだけ。サイト全体の静的アセット 6.5 MB のうち 3.6 MB がこの1ファイル。

今回のブランチには入れないが、優先度は低くない。トップの主役である以上、モバイル・低速回線・低性能端末への影響を測る必要がある。単なる非表示ではなく、端末能力に応じた軽量モデル / 静止画 fallback / 遅延ロード / LOD を比較する仕事になるため、独立したタスクとして扱う。

### 4-2. 3Dヒーローの実体の性能測定

転送量だけでなく、GLB の転送、WebGL の初期化、shader のコンパイル、メインスレッド占有、LCP、モバイル GPU 負荷を測る必要がある。トップの最大の体験リスク。単位2・3でベースラインを作ったあとに実施する。

### 4-3. `service_issue_fv.png` の WebP 化

1.9 MB / 1265×1244。ただし `next/image` 経由（`src/components/lp/PageHero.tsx:49` で `width` / `height` / `sizes` / `priority` すべて設定済み）なので、訪問者への転送量は既に最適化されている。効くのはリポジトリ容量と Vercel の画像最適化コストのみ。

対応する場合は、この PNG が OG 画像・CSS の background・直接 URL 参照として使われていないことを先に確認する。

---

## 5. 実行順のまとめ

| 順 | ブランチ | 層 | 主な内容 |
|---|---|---|---|
| 1 | `fix/blog-sitemap-exclude` | — | `/blog` を sitemap から外す |
| 2 | `feature/service-lp-pages` | A | LP フォント CSS の重複除去（既存ブランチに追加） |
| 3 | `feature/perf-bundle-trim` | A | 計測スクリプト / middleware 削除 / ContactExperience / AboutThreeImage |
| 4 | `feature/perf-blog-cursor-loading` | B | DOM カーソル / LoadingScreen |
| 5 | `feature/nextjs-16-upgrade` | C | Next.js 16 移行 |
| 6 | `chore/pnpm-supply-chain` | — | pnpm 10.26+ と cooldown 設定 |

1 と 2 は対象ファイルが重ならないため並行して進められる。3 以降は前の単位のマージを待つ。

各ブランチで `pnpm lint` と `pnpm build` をエラー0件で通してからプッシュする（CLAUDE.md 2.3.4）。プッシュと PR 作成はユーザーの指示を待つ。

---

## 6. 期待される効果

| ページ | 現状 | 単位3まで完了後 |
|---|---|---|
| `/` | 417 KB | 374 KB（加えて初期クリティカルパスから 生 873 KB のパース・コンパイルが外れる） |
| `/blog`, `/blog/[slug]` | 378 KB | 149 KB（−61%） |
| `/service` 系3ページ | 257 KB | 157 KB（レンダーブロッキング CSS は 135 KB → 44 KB） |
| トップで本文が読めるまで | 2.5 秒（固定） | 0.8 秒前後 |

数値はすべて gzip 後。Vercel は brotli を使うため実際の転送量はさらに 1〜2 割小さくなるが、削減の比率は変わらない。
