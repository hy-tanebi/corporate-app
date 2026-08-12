# パフォーマンス修正 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブログ全ページから Three.js を、LP からフォント CSS の重複を、トップから初期ロードの不要なパース負荷を取り除き、実測で `/blog` 378 KB → 140 KB、LP のレンダーブロッキング CSS 135 KB → 44 KB、トップの本文到達 2.5 秒 → 0.7 秒前後にする。

**Architecture:** 4本のブランチに分ける。まず `/blog` を sitemap から外す（1行）。次に LP のフォント設定を進行中ブランチで直す。次に見た目が変わらない削減（計測スクリプト・middleware 削除・動的インポート2件）。最後に見た目が変わる変更（DOM カーソル・LoadingScreen）。各ブランチは前のブランチのマージを待つ（1と2のみ並行可）。

**Tech Stack:** Next.js 15.5.16 (App Router) / React 19.1.7 / TypeScript / Tailwind CSS v3 / Biome / pnpm / dotenvx / Vercel

**設計書:** `docs/superpowers/specs/2026-08-12-performance-fixes-design.md`

---

## Global Constraints

- **テストフレームワークは存在しない。** `package.json` に test スクリプトはなく、テストファイルも0件。この計画では TDD の代わりに「ビルド出力の実測」を検証手段とする（下記の検証ループ参照）
- **パッケージマネージャは pnpm のみ。** `npm` / `yarn` は使わない
- **ビルドには dotenvx 経由の環境変数が要る。** `pnpm exec dotenvx run -f .env.local -- pnpm exec next build`
- **`pnpm build` の前に dev サーバーを止めること。** 二重起動で `.next` が壊れた実績がある（`doc/progress.md` 2026-08-09）
- **push と PR 作成はユーザーの指示を待つ。** コミットまでで止める
- **`feature/dify-chatbot-widget` はマージしない**（ユーザー指示・保留中のため）
- **コミットメッセージは Conventional Commits、接頭辞は英語・説明文は日本語**（`CLAUDE.md` 2.2）
- **各ブランチのプッシュ前に `pnpm lint` と `pnpm build` をエラー0件で通す**（`CLAUDE.md` 2.3.4）
- **`doc/progress.md` を作業のたびに更新する**（`CLAUDE.md` 1.4）。ただし **`doc/` は gitignore 済み**（`.gitignore:61` の `/doc/`）なので、**更新はするがコミットはしない**。各タスクの「進捗を記録する」ステップにある `git add doc/progress.md` は実行できないので飛ばすこと
- **ブランチ3・4は、`feature/service-lp-pages` が dev にマージされてから切る。** この計画のベースライン（`/` 417 KB、`/blog` 378 KB、`/service` 257 KB）と全タスクの行番号は `feature/service-lp-pages` 上で計測・確認したもの。dev との差は44ファイル/4045行あり、dev から切ると行番号がずれ、後でマージしたときに `Providers.tsx` / `HeroCanvasWrapper.tsx` / `hero-canvas.tsx` / `Astronaut.tsx` / `sitemap.ts` がコンフリクトする。特に Task 11 が削除する `/#contact` の待機処理は dev には存在せず、LP 側のマージで復活してしまう。**マージ後に必ずベースラインを取り直すこと**
- **ブラウザ自動化は使わない。** 表示確認はユーザーが行う（`doc/progress.md` 2026-08-09 の方針）

---

## 検証ループ（テストの代わり）

各タスクの「テスト」は次の3点セット。

```bash
# 1. 静的チェック
pnpm lint
pnpm exec tsc --noEmit

# 2. 本番ビルド（dev サーバーを止めてから）
pnpm exec dotenvx run -f .env.local -- pnpm exec next build

# 3. 実測（タスク3で作るスクリプト。それ以前は各タスクに個別のコマンドを書いてある）
node scripts/measure-page-weight.mjs
```

「失敗を先に確認する」ステップは、**修正前の実測値を記録する**ことで代替する。各タスクに修正前の期待値を書いてあるので、まずそれが再現することを確かめてから手を入れる。

---

## ファイル構成

| ファイル | 扱い | 責務 |
|---|---|---|
| `src/app/sitemap.ts` | 変更 | `/blog` エントリを削除 |
| `src/components/lp/fonts.ts` | 変更 | `weight` 配列を削除 |
| `scripts/measure-page-weight.mjs` | 新規 | ビルド出力からページ別の実転送量を集計する |
| `src/middleware.ts` | 削除 | 空実装 |
| `src/components/contact/contact-experience.tsx` | 新規 | ContactForm と Toaster をまとめ、遅延読み込みの単位にする |
| `src/components/Providers.tsx` | 変更 | Toaster を削除 |
| `src/app/components/MissionSection.tsx` | 変更 | ContactExperience を動的インポート |
| `src/app/components/AboutSection.tsx` | 変更 | AboutThreeImage を動的インポート |
| `src/components/blog/blog-cursor.tsx` | 新規 | DOM 実装のカーソル追従 |
| `src/components/three/mouse-pointer.tsx` | 削除 | Three.js 実装のカーソル |
| `src/app/blog/layout.tsx` | 変更 | MousePointer → BlogCursor |
| `src/components/loading/LoadingScreen.tsx` | 変更 | unmount 順序・cleanup・演出時間・スクロール封鎖 |
| `src/app/components/HomeClient.tsx` | 変更 | `/#contact` の overflow リトライを削除 |
| `src/components/three/HeroCanvasWrapper.tsx` | 変更 | コメントの訂正のみ |

---

# ブランチ1: `fix/blog-sitemap-exclude`

記事0件の `/blog` が `priority: 0.8` / `changeFrequency: "daily"` で sitemap に載り、`/works` と違って noindex も付いていない状態を解消する。

## Task 1: `/blog` を sitemap から外す

**Files:**
- Modify: `src/app/sitemap.ts:17-22`

**Interfaces:**
- Consumes: なし
- Produces: なし（他タスクは依存しない）

- [ ] **Step 1: ブランチを作る**

```bash
git checkout dev
git pull origin dev
git checkout -b fix/blog-sitemap-exclude
```

- [ ] **Step 2: 修正前の状態を確認する**

```bash
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
grep -c "<loc>https://tanebi-net.com/blog</loc>" .next/server/app/sitemap.xml.body
```

Expected: `1`（一覧ページのURLが含まれている）

**厳密一致で数えること。** `grep -c "tanebi-net.com/blog"` だと記事URL（`/blog/xxx`）も数えてしまい判定できない。またローカルは `USE_MOCK_BLOG=true` なので、記事URLとして mock記事3件（`mock-nextjs-app-router` 等）が必ず出る。これは正常。

- [ ] **Step 3: `/blog` のエントリを削除する**

`src/app/sitemap.ts` の `staticPages` 配列から、次のブロックを丸ごと削除する。

```ts
		{
			url: `${SITE_URL}/blog`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
```

記事の動的エントリを作る `blogPages` の処理（`getBlogPosts` を呼ぶ try/catch）は**残す**。記事が入れば個別 URL は自動で載る。`public/robots.txt` は変更しない。

- [ ] **Step 4: ビルドして消えたことを確認する**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
grep -c "<loc>https://tanebi-net.com/blog</loc>" .next/server/app/sitemap.xml.body
grep -o "<loc>[^<]*</loc>" .next/server/app/sitemap.xml.body
```

Expected: 1つ目は `0`（一覧URLが消えている）。2つ目の一覧にトップと mock記事3件だけが並び、`<loc>https://tanebi-net.com/blog</loc>` が無いこと。ビルドが成功すること。

- [ ] **Step 5: コミット**

```bash
git add src/app/sitemap.ts
git commit -m "fix(seo): 記事0件の /blog を sitemap から除外"
```

- [ ] **Step 6: 進捗を記録する**

`doc/progress.md` の先頭に日付セクションを追加し、この変更と「記事を公開したら `sitemap.ts` に `/blog` ブロックを戻す」ことを明記してコミットする。

```bash
git add doc/progress.md
git commit -m "docs: /blog の sitemap 除外を記録"
```

---

# ブランチ2: `feature/service-lp-pages`（既存ブランチに追加）

LP のフォント CSS が4倍に重複している問題を、それを作ったブランチ内で直す。**ブランチ1と並行して進めてよい**（対象ファイルが重ならない）。

## Task 2: 未コミット変更の整理

**Files:**
- Modify: `src/app/service/page.tsx`（既存の未コミット変更）

**Interfaces:**
- Consumes: なし
- Produces: クリーンな作業ツリー（Task 3 の前提）

- [ ] **Step 1: 変更内容を確認する**

```bash
git checkout feature/service-lp-pages
git diff src/app/service/page.tsx
```

- [ ] **Step 2: ユーザーに判断を仰ぐ**

差分の内容を提示し、コミットするか破棄するかを聞く。**フォント修正と同じコミットに混ぜないこと。**

- [ ] **Step 3: 判断に従って処理する**

コミットする場合:

```bash
git add src/app/service/page.tsx
git commit -m "feat(lp): <ユーザーが説明した内容>"
```

破棄する場合:

```bash
git checkout -- src/app/service/page.tsx
```

- [ ] **Step 4: 作業ツリーがクリーンなことを確認する**

```bash
git status --short
```

Expected: 出力なし（または未追跡の設計書・計画書のみ）

## Task 3: フォント CSS の重複を除去する

**Files:**
- Modify: `src/components/lp/fonts.ts:5-16`

**Interfaces:**
- Consumes: なし
- Produces: `anton` / `notoSansJp`（エクスポート名は変えない。`PageHero.tsx` などが `.className` で使っている）

- [ ] **Step 1: 修正前の実測値を記録する**

```bash
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node -e '
const fs=require("fs"),zlib=require("zlib");
const f=fs.readdirSync(".next/static/css").map(n=>".next/static/css/"+n)
  .sort((a,b)=>fs.statSync(b).size-fs.statSync(a).size)[0];
const b=fs.readFileSync(f);
console.log(f, "raw", (b.length/1024|0)+"KB", "gz", (zlib.gzipSync(b,{level:6}).length/1024|0)+"KB",
  "@font-face", (b.toString().match(/@font-face/g)||[]).length);
'
```

Expected: `raw 368KB` / `gz 122KB` / `@font-face 497`

- [ ] **Step 2: `weight` 配列を削除する**

`src/components/lp/fonts.ts` を次の内容にする。

```ts
import { Anton, Noto_Sans_JP } from "next/font/google";

// LPページ専用フォント。英字ディスプレイはAnton、本文・和文見出しはNoto Sans JP。
// サイト全体のフォントには影響しない（LPコンテナにのみ適用する）。
export const anton = Anton({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
});

// Noto Sans JP は可変フォント。weight を列挙すると unicode-range ごとの @font-face が
// weight の数だけ複製され、同じ .woff2 を指す定義が4倍出力される（実測 497個 / 参照先は124個）。
// weight を省略すると font-weight: 100 900 の可変定義になり、全ウェイトを維持したまま CSS が 1/4 になる。
// Anton は可変フォントではないため weight: "400" を維持すること。
export const notoSansJp = Noto_Sans_JP({
	subsets: ["latin"],
	display: "swap",
});
```

- [ ] **Step 3: ビルドして CSS が縮んだことを確認する**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node -e '
const fs=require("fs"),zlib=require("zlib");
const f=fs.readdirSync(".next/static/css").map(n=>".next/static/css/"+n)
  .sort((a,b)=>fs.statSync(b).size-fs.statSync(a).size)[0];
const b=fs.readFileSync(f), s=b.toString();
console.log(f, "raw", (b.length/1024|0)+"KB", "gz", (zlib.gzipSync(b,{level:6}).length/1024|0)+"KB",
  "@font-face", (s.match(/@font-face/g)||[]).length);
console.log("可変定義:", /font-weight:\s*100\s+900/.test(s) ? "あり (font-weight: 100 900)" : "★なし — 想定と違う");
'
```

Expected: `raw 92KB` 前後 / `gz 31KB` 前後 / `@font-face 124` / 可変定義: あり

**「可変定義: ★なし」が出た場合は先に進まないこと。** `next/font` が可変フォントとして解決していない可能性があるので、原因を調べてユーザーに報告する。

- [ ] **Step 4: ユーザーに実機確認を依頼する**

以下を伝えて確認してもらう。**確認が取れるまでコミットしない。**

- 確認するページ: `/service`, `/service/issues`, `/works`
- 見るところ:
  1. 日本語の太字（`font-bold` = 700、`font-black` = 900）の太さが変わっていないか
  2. 英数字と和文が混在する箇所、特に Anton の見出しと Noto の本文が隣り合う場所
  3. DevTools の Computed で、見出し要素の `font-weight` が 700 / 900 に解決されているか
- 起動コマンド: `pnpm dev`（**ポート3000が空いていることを先に確認する**）

- [ ] **Step 5: コミット**

```bash
git add src/components/lp/fonts.ts
git commit -m "perf(lp): Noto Sans JP の weight 指定を外し @font-face の4重複を解消"
```

- [ ] **Step 6: 進捗を記録する**

`doc/progress.md` に、実測値（368KB→92KB、@font-face 497→124）とユーザーの実機確認結果を追記してコミットする。

```bash
git add doc/progress.md
git commit -m "docs: LPフォントCSSの重複除去を記録"
```

---

# ブランチ3: `feature/perf-bundle-trim`

見た目が変わらない削減。ブランチ1と2がマージされてから開始する。

## Task 4: 計測スクリプトを作る

**Files:**
- Create: `scripts/measure-page-weight.mjs`

**Interfaces:**
- Consumes: `.next/server/app/**/*.html`、`.next/app-build-manifest.json`
- Produces: `node scripts/measure-page-weight.mjs` で実行できる CLI。以降の全タスクの検証手段

- [ ] **Step 1: ブランチを作る**

```bash
git checkout dev
git pull origin dev
git checkout -b feature/perf-bundle-trim
```

- [ ] **Step 2: スクリプトを作成する**

`scripts/measure-page-weight.mjs` を次の内容で作る。

```js
#!/usr/bin/env node
// ビルド出力から、ページごとに実際に読み込まれる JS / CSS / フォントを集計する。
//
// これは「回帰検知の道具」であって合格基準ではない。
// LCP / INP / CLS、CPU 負荷、モバイル GPU 負荷は Lighthouse や実機で別途見ること。
//
// 使い方: pnpm build のあとに `node scripts/measure-page-weight.mjs`
//
// なぜ必要か:
//   next build の「First Load JS」は動的インポート分を数えないため実態とずれる。
//   さらに Next.js 16 ではこの指標自体がビルド出力から消える。

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const NEXT_DIR = ".next";
const APP_DIR = join(NEXT_DIR, "server", "app");

if (!existsSync(APP_DIR)) {
	console.error(
		"ビルド出力が見つかりません。先に本番ビルドを実行してください:\n" +
			"  pnpm exec dotenvx run -f .env.local -- pnpm exec next build",
	);
	process.exit(1);
}

/** .next/server/app 以下の .html を再帰的に集め、ルートに変換する */
function findPages(dir, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			findPages(full, out);
		} else if (entry.name.endsWith(".html")) {
			const rel = relative(APP_DIR, full).replace(/\.html$/, "");
			out.push({ file: full, route: rel === "index" ? "/" : `/${rel}` });
		}
	}
	return out;
}

/** <script src> を noModule 判定つきで拾う（属性の順序に依存しない） */
function collectScripts(html) {
	const out = [];
	const re = /<script\b[^>]*>/g;
	let m = re.exec(html);
	while (m !== null) {
		const tag = m[0];
		const src = /\ssrc="([^"]+)"/.exec(tag)?.[1];
		if (src?.startsWith("/_next/")) {
			out.push({ url: src, noModule: /\bnomodule\b/i.test(tag) });
		}
		m = re.exec(html);
	}
	return out;
}

/** 指定した rel の <link href> を拾う（属性の順序に依存しない） */
function collectLinks(html, rel, extRe) {
	const out = [];
	const re = /<link\b[^>]*>/g;
	let m = re.exec(html);
	while (m !== null) {
		const tag = m[0];
		const href = /\shref="([^"]+)"/.exec(tag)?.[1];
		if (
			new RegExp(`\\srel="${rel}"`).test(tag) &&
			href?.startsWith("/_next/") &&
			extRe.test(href)
		) {
			out.push(href);
		}
		m = re.exec(html);
	}
	return out;
}

const sizeCache = new Map();

function sizes(url) {
	if (sizeCache.has(url)) return sizeCache.get(url);
	const file = join(NEXT_DIR, url.replace(/^\/_next\//, ""));
	let result = null;
	if (existsSync(file)) {
		const buf = readFileSync(file);
		result = {
			raw: buf.length,
			gzip: gzipSync(buf, { level: 6 }).length,
			brotli: brotliCompressSync(buf, {
				params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
			}).length,
		};
	}
	sizeCache.set(url, result);
	return result;
}

function sum(urls) {
	const total = { raw: 0, gzip: 0, brotli: 0 };
	for (const u of urls) {
		const s = sizes(u);
		if (!s) continue;
		total.raw += s.raw;
		total.gzip += s.gzip;
		total.brotli += s.brotli;
	}
	return total;
}

const kb = (n) => String(Math.round(n / 1024)).padStart(5);

const manifest = JSON.parse(
	readFileSync(join(NEXT_DIR, "app-build-manifest.json"), "utf8"),
).pages;

const manifestKey = (route) => (route === "/" ? "/page" : `${route}/page`);

const pages = findPages(APP_DIR).sort((a, b) => a.route.localeCompare(b.route));

for (const { file, route } of pages) {
	const html = readFileSync(file, "utf8");
	const scripts = collectScripts(html);
	const css = collectLinks(html, "stylesheet", /\.css$/);
	const fonts = collectLinks(html, "preload", /\.woff2?$/);

	const polyfill = [
		...new Set(scripts.filter((s) => s.noModule).map((s) => s.url)),
	];
	const initial = [
		...new Set([
			...scripts.filter((s) => !s.noModule).map((s) => s.url),
			...css,
		]),
	];
	const lazy = (manifest[manifestKey(route)] ?? [])
		.map((f) => `/_next/${f}`)
		.filter((u) => !initial.includes(u) && !polyfill.includes(u));

	const t = sum(initial);
	console.log(`\n===== ${route} =====`);
	console.log(
		`  初期ロード      raw ${kb(t.raw)} KB / gzip ${kb(t.gzip)} KB / brotli ${kb(t.brotli)} KB   (${initial.length} files)`,
	);
	for (const u of [...initial].sort()) {
		const s = sizes(u);
		if (s) console.log(`     ${kb(s.gzip)} KB gz  ${u.split("/").pop()}`);
	}
	if (lazy.length > 0) {
		const l = sum(lazy);
		console.log(
			`  遅延チャンク    raw ${kb(l.raw)} KB / gzip ${kb(l.gzip)} KB / brotli ${kb(l.brotli)} KB   (${lazy.length} files)`,
		);
	}
	if (polyfill.length > 0) {
		console.log(
			`  polyfill        gzip ${kb(sum(polyfill).gzip)} KB   (noModule・現代のブラウザは読まない)`,
		);
	}
	if (fonts.length > 0) {
		console.log(
			`  preloadフォント raw ${kb(sum(fonts).raw)} KB   (${fonts.length} files)`,
		);
	}
	console.log(`  HTML            raw ${kb(Buffer.byteLength(html))} KB`);
}
```

- [ ] **Step 3: 実行してベースラインを取る**

```bash
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node scripts/measure-page-weight.mjs
```

Expected（ブランチ1・2がマージ済みの dev から切った場合）:

| ルート | 初期ロード gzip |
|---|---|
| `/` | 417 KB 前後 |
| `/blog` | 378 KB 前後 |
| `/service` | 166 KB 前後（フォント修正済みのため） |

`/` と `/blog` の初期ロード一覧に `three-vendor-*.js` と `ff453dfd-*.js` が並んでいることを確認する。これが以降のタスクで消える対象。

**この出力をそのままコピーして手元に保存しておくこと。** 以降のタスクの比較対象になる。

- [ ] **Step 4: lint を通す**

```bash
pnpm lint
```

Biome が `scripts/` を対象にする設定かを確認し、エラーが出たら修正する。

- [ ] **Step 5: コミット**

```bash
git add scripts/measure-page-weight.mjs
git commit -m "chore: ページ別の実転送量を計測するスクリプトを追加"
```

## Task 5: 空の middleware を削除する

**Files:**
- Delete: `src/middleware.ts`

**Interfaces:**
- Consumes: なし
- Produces: なし

- [ ] **Step 1: 中身が空実装であることを再確認する**

```bash
cat src/middleware.ts
```

Expected: `middleware` 関数の中身が `return NextResponse.next();` のみであること。**何か処理が入っていたら削除せず、ユーザーに報告する。**

- [ ] **Step 2: ビルド出力に Middleware が載っていることを確認する**

直前のビルドログに `ƒ Middleware  34 kB` の行があることを確認する。

- [ ] **Step 3: 削除する**

```bash
git rm src/middleware.ts
```

- [ ] **Step 4: ビルドして Middleware が消えたことを確認する**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build 2>&1 | grep -i middleware
```

Expected: 出力なし（`ƒ Middleware` の行が消えている）

- [ ] **Step 5: コミット**

```bash
git commit -m "perf: 何もしない middleware を削除"
```

## Task 6: ContactExperience を新設して遅延読み込みにする

**Files:**
- Create: `src/components/contact/contact-experience.tsx`
- Modify: `src/components/Providers.tsx:6,24`
- Modify: `src/app/components/MissionSection.tsx:13,22-24,761`

**Interfaces:**
- Consumes: `ContactForm`（`src/components/contact/contact-form.tsx` の named export）
- Produces: `ContactExperience`（named export、props なし）

- [ ] **Step 1: ContactExperience を作る**

`src/components/contact/contact-experience.tsx`:

```tsx
"use client";

import { Toaster } from "sonner";
import { ContactForm } from "./contact-form";

/**
 * お問い合わせフォームと、その結果通知用の Toaster をひとまとめにしたもの。
 *
 * この2つを同じ動的チャンクに入れることで、zod / react-hook-form / radix / sonner を
 * 「お問い合わせ導線に到達したとき」まで遅延できる。
 * Toaster をルートレイアウト(Providers.tsx)に戻すと sonner が全ページに載るため、戻さないこと。
 */
export function ContactExperience() {
	return (
		<>
			<ContactForm />
			<Toaster richColors position="top-center" />
		</>
	);
}
```

- [ ] **Step 2: Providers から Toaster を外す**

`src/components/Providers.tsx` から `import { Toaster } from "sonner";` の行と、JSX 内の `<Toaster richColors position="top-center" />` を削除する。削除後の return は次のようになる。

```tsx
	return (
		<>
			{isInitialLandingTop && isTopPage && isLoading && (
				<LoadingScreen onLoadingComplete={handleLoadingComplete} />
			)}
			{children}
		</>
	);
```

`<>...</>` は要素が2つ残るのでそのまま維持する。

- [ ] **Step 3: MissionSection を動的インポートに切り替える**

`src/app/components/MissionSection.tsx` の13行目 `import { ContactForm } from "@/components/contact/contact-form";` を削除し、既存の `import dynamic from "next/dynamic";` の下に次を追加する。

```tsx
// お問い合わせフォームと Toaster を遅延読み込みする。
// これにより zod / react-hook-form / radix / sonner がトップの初期バンドルから外れる。
// 親が min-h-[calc(100dvh+1px)] で1画面分の高さを確保しているためレイアウトは動かないが、
// 読み込み中にセクションが空に見えないようプレースホルダを置く。
const ContactExperience = dynamic(
	() =>
		import("@/components/contact/contact-experience").then(
			(mod) => mod.ContactExperience,
		),
	{
		ssr: false,
		loading: () => <div className="min-h-[560px] w-full" aria-hidden />,
	},
);
```

次に、22-24行目の薄いラッパーを削除する。

```tsx
// 削除する
function ContactFormSection() {
	return <ContactForm />;
}
```

最後に761行目の `<ContactFormSection />` を `<ContactExperience />` に置き換える。

- [ ] **Step 4: ビルドして初期バンドルから消えたことを確認する**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node scripts/measure-page-weight.mjs
```

Expected:
- `/` の初期ロードが 417 KB → **374 KB 前後**（−43 KB）
- `/` の初期ロード一覧から zod を含むチャンク（Task 4 のベースラインで 34 KB gz だったもの）が消えている
- `/blog` と `/service` の初期ロードが **−9 KB**（sonner の分）
- `/` の「遅延チャンク」欄に、消えた分が現れている

チャンクの中身を直接確かめる場合:

```bash
for f in $(node -e '
const fs=require("fs");
const html=fs.readFileSync(".next/server/app/index.html","utf8");
console.log([...new Set(html.match(/\/_next\/static\/chunks\/[^"\\\\]+\.js/g)||[])].join("\n"));
' | sed "s|/_next/|.next/|"); do
  n=$(grep -o "zod" "$f" 2>/dev/null | wc -l)
  [ "$n" -gt 0 ] && echo "★ zod が残っている: $f ($n)"
done
echo "確認完了"
```

Expected: 「★ zod が残っている」の行が出ないこと。

**もし初期ロードから消えていなかった場合は先に進まず、ユーザーに報告する。** その場合は `IntersectionObserver` でフォーム領域の手前に来たときに初めて mount する形（設計書 3.2-c のリスク欄）への切り替えを検討する。

- [ ] **Step 5: ユーザーに実機確認を依頼する**

`pnpm dev` を案内し、次を確認してもらう。**確認が取れるまでコミットしない。**

1. トップを最下部までスクロールして、お問い合わせフォームが従来どおり表示されるか
2. `/#contact` に直接アクセスしてフォームに到達できるか
3. LP（`/service`）の CTA からトップの `/#contact` に遷移できるか
4. フォームを送信して、成功トーストが画面上部中央に出るか
5. 必須項目を空にして送信し、エラー表示が出るか

- [ ] **Step 6: コミット**

```bash
git add src/components/contact/contact-experience.tsx src/components/Providers.tsx src/app/components/MissionSection.tsx
git commit -m "perf: お問い合わせフォームとToasterを遅延読み込みに変更"
```

## Task 7: AboutThreeImage を遅延読み込みにする

**Files:**
- Modify: `src/app/components/AboutSection.tsx:5,217-221`

**Interfaces:**
- Consumes: `AboutThreeImage`（`src/app/components/AboutThreeImage.tsx` の default export。props は `imageSrc: string` / `scale: [number, number]` / `offset: [number, number]`）
- Produces: なし

- [ ] **Step 1: 修正前に three が初期ロードにあることを確認する**

```bash
node scripts/measure-page-weight.mjs | sed -n '/===== \/ =====/,/===== /p' | grep -E "three-vendor|ff453dfd"
```

Expected: 2行出る（`three-vendor-*.js` と `ff453dfd-*.js`）

- [ ] **Step 2: 動的インポートに切り替える**

`src/app/components/AboutSection.tsx` の5行目 `import AboutThreeImage from "./AboutThreeImage";` を削除し、代わりに次を追加する（`import { useEffect, useRef, useState } from "react";` の下）。

```tsx
import dynamic from "next/dynamic";

// AboutThreeImage は @react-three/fiber / drei / three を静的に読む。
// AboutSection -> MissionSection -> HomeClient と静的につながっているため、
// このまま静的インポートするとトップの初期HTMLに three-vendor(生766KB)と
// react-reconciler(生107KB)が出力され、HeroCanvasWrapper の requestIdleCallback による
// 遅延が意味を持たなくなる。動的インポートにすることで初期のクリティカルパスから外す。
// この要素は absolute inset-0 で配置されるためレイアウトには影響しない。
const AboutThreeImage = dynamic(() => import("./AboutThreeImage"), {
	ssr: false,
	loading: () => <div className="absolute inset-0" aria-hidden />,
});
```

使用箇所（217-221行目付近）は変更しない。

- [ ] **Step 3: ビルドして初期ロードから消えたことを確認する**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node scripts/measure-page-weight.mjs
```

Expected:
- `/` の初期ロード一覧から `three-vendor-*.js` と `ff453dfd-*.js` が消えている
- `/` の初期ロード gzip が 374 KB → **145 KB 前後**（−229 KB）
- `/` の「遅延チャンク」欄にその 229 KB が現れている（総転送量は変わらない）
- `/blog` は**変わらない**（`blog/layout.tsx` の MousePointer 経由なので Task 8 で対応）

- [ ] **Step 4: ユーザーに実機確認を依頼する**

`pnpm dev` を案内し、次を確認してもらう。**確認が取れるまでコミットしない。**

1. トップを最下部までスクロールして、About セクションの画像シェーダー表現が従来どおり出るか
2. ヒーローの3D（宇宙・回転カード）が従来どおり動くか
3. モバイル幅（768px 未満）でも About の画像が出るか

- [ ] **Step 5: コミット**

```bash
git add src/app/components/AboutSection.tsx
git commit -m "perf: AboutThreeImage を遅延読み込みにしトップの初期ロードから Three.js を外す"
```

- [ ] **Step 6: 進捗を記録する**

`doc/progress.md` にブランチ3の内容と、Task 4 のベースライン／Task 7 後の実測値を対比で記録してコミットする。

```bash
git add doc/progress.md
git commit -m "docs: 初期バンドル削減の実測値を記録"
```

---

# ブランチ4: `feature/perf-blog-cursor-loading`

見た目・体験が変わる変更。ブランチ3がマージされてから開始する。

## Task 8: blog のカーソルを DOM 実装に置き換える

**Files:**
- Create: `src/components/blog/blog-cursor.tsx`
- Delete: `src/components/three/mouse-pointer.tsx`
- Modify: `src/app/blog/layout.tsx:1,14`

**Interfaces:**
- Consumes: なし
- Produces: `BlogCursor`（named export、props なし）

- [ ] **Step 1: ブランチを作り、ベースラインを取る**

```bash
git checkout dev
git pull origin dev
git checkout -b feature/perf-blog-cursor-loading
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node scripts/measure-page-weight.mjs | sed -n '/===== \/blog =====/,/===== \/blog\//p'
```

Expected: 初期ロード **369 KB 前後**（調査時点の 378 KB からブランチ3の sonner 削除で −9 KB されている）。一覧に `three-vendor-*.js`（196 KB gz）と `ff453dfd-*.js`（33 KB gz）がある

- [ ] **Step 2: DOM 実装のカーソルを作る**

`src/components/blog/blog-cursor.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ブログのカーソル追従ポインタ。
 *
 * 以前は Three.js の <Canvas> に circleGeometry を1つ置いて描いていたが、
 * 円ひとつのために three + react-three-fiber(生 873 KB / gzip 229 KB)を
 * ブログ全ページに載せていたため DOM 実装に置き換えた。
 *
 * 追従は useState ではなく ref + requestAnimationFrame で行う。
 * 旧実装は useFrame の中で setState していたため毎秒60回の再レンダリングが走っていた。
 *
 * サイズの 3.9vh は旧実装の見た目に合わせた値。
 * 旧実装は fov 75 / 距離 10 の空間に半径 0.3 の円を置いており、
 * 画面高さ 2*tan(37.5°)*10 = 15.34 units に対して直径 0.6 units ≒ 3.9% にあたる。
 */
export function BlogCursor() {
	const [enabled, setEnabled] = useState(false);
	const dotRef = useRef<HTMLDivElement>(null);

	// マウスを持つ端末でのみ表示する（タッチ専用端末では出さない）
	useEffect(() => {
		const fine = window.matchMedia("(pointer: fine)");
		const sync = () => setEnabled(fine.matches);
		sync();
		fine.addEventListener("change", sync);
		return () => fine.removeEventListener("change", sync);
	}, []);

	useEffect(() => {
		if (!enabled) return;

		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
		const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
		const current = { x: target.x, y: target.y };
		let targetScale = 1.2;
		let scale = 1.2;
		let frame = 0;
		let stopTimer: ReturnType<typeof setTimeout> | undefined;

		const handleMove = (e: MouseEvent) => {
			target.x = e.clientX;
			target.y = e.clientY;
			// 動いている間は小さく、止まったら大きく（旧実装の挙動）
			targetScale = 0.8;
			clearTimeout(stopTimer);
			stopTimer = setTimeout(() => {
				targetScale = 1.2;
			}, 100);
		};

		const tick = () => {
			// prefers-reduced-motion では補間せず即座に追従させる
			const lerp = reduced.matches ? 1 : 0.1;
			current.x += (target.x - current.x) * lerp;
			current.y += (target.y - current.y) * lerp;
			scale += (targetScale - scale) * lerp;

			const el = dotRef.current;
			if (el) {
				el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
			}
			frame = requestAnimationFrame(tick);
		};

		window.addEventListener("mousemove", handleMove, { passive: true });
		frame = requestAnimationFrame(tick);

		return () => {
			window.removeEventListener("mousemove", handleMove);
			cancelAnimationFrame(frame);
			clearTimeout(stopTimer);
		};
	}, [enabled]);

	if (!enabled) return null;

	return (
		<div
			ref={dotRef}
			aria-hidden
			className="pointer-events-none fixed left-0 top-0 z-10 rounded-full"
			style={{
				width: "3.9vh",
				height: "3.9vh",
				backgroundColor: "rgba(255, 215, 0, 0.6)",
				willChange: "transform",
			}}
		/>
	);
}
```

- [ ] **Step 3: blog レイアウトを差し替える**

`src/app/blog/layout.tsx` の1行目を次に置き換える。

```tsx
import { BlogCursor } from "@/components/blog/blog-cursor";
```

14行目の `<MousePointer />` を `<BlogCursor />` に置き換える。

- [ ] **Step 4: 旧実装を削除する**

```bash
grep -rn "mouse-pointer\|MousePointer" src/
```

Expected: 出力なし（参照が残っていたら先に消す）

```bash
git rm src/components/three/mouse-pointer.tsx
```

- [ ] **Step 5: ビルドして Three.js が消えたことを確認する**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node scripts/measure-page-weight.mjs
```

Expected:
- `/blog` の初期ロードが 369 KB → **140 KB 前後**（−62%。調査時点の 378 KB からは −63%）
- `/blog` の一覧から `three-vendor-*.js` と `ff453dfd-*.js` が消えている
- `/blog/[slug]` も同様に減っている
- `/` は変わらない

- [ ] **Step 6: ユーザーに実機確認を依頼する**

`pnpm dev` を案内し、次を確認してもらう。**確認が取れるまでコミットしない。**

1. `/blog` でマウスを動かして、黄色い丸が従来どおり遅れて追従するか。止めると少し大きくなるか
2. 記事一覧のカードやリンクの hover が従来どおり効くか
3. Tab キーでリンクをたどれるか（フォーカスリングが丸に隠れないか）
4. ブラウザ幅を狭めてタッチ端末をエミュレートし、丸が消えるか
5. OS の「視差効果を減らす」を有効にして、追従が補間なしになるか

- [ ] **Step 7: コミット**

```bash
git add src/components/blog/blog-cursor.tsx src/app/blog/layout.tsx
git commit -m "perf(blog): カーソル演出をThree.jsからDOM実装に置き換え"
```

## Task 9: LoadingScreen の不具合を直す（挙動は変えない）

**Files:**
- Modify: `src/components/loading/LoadingScreen.tsx:13-30,73-81`

**Interfaces:**
- Consumes: `onLoadingComplete: () => void`（`Providers.tsx` から渡される）
- Produces: なし（props の形は変えない）

このタスクは演出時間を変えない。**不具合2件だけを直す。**

- [ ] **Step 1: 現状の不具合を確認する**

`src/components/loading/LoadingScreen.tsx` を読み、次の2点を確認する。

1. 13-16行目の `useEffect` が `document.body.style.overflow = "hidden"` を設定しているが cleanup（return）がない。途中で unmount や例外が起きるとスクロールが戻らない
2. `handleStart(true)` が `setHasStarted(true)` の直後に `setTimeout(onLoadingComplete, 0)` を呼ぶため、親が即座に unmount し、`transition-opacity duration-1000` のフェードが再生されない

- [ ] **Step 2: cleanup を追加する**

13-16行目を次に置き換える。

```tsx
	// スクロール無効化。unmount 時に必ず戻す
	// （cleanup がないと、遷移や例外で unmount したときスクロールが戻らなくなる）
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);
```

- [ ] **Step 3: unmount の順序を直す**

18-30行目の `handleStart` を次に置き換える。`immediate` 引数は呼び出し側が1箇所しかなく、常にフェードを再生させたいので削除する。

```tsx
	const handleStart = useCallback(() => {
		setHasStarted(true);
		document.body.style.overflow = "unset";
		// フェードアウト(transition-opacity duration-1000)を再生しきってから親に完了を伝える。
		// 以前は 0ms で通知していたため、親が即座に unmount しフェードが走っていなかった。
		setTimeout(() => {
			onLoadingComplete();
		}, 1000);
	}, [onLoadingComplete]);
```

- [ ] **Step 4: 呼び出し側を合わせる**

100% 到達時の `useEffect` 内の `handleStart(true);` を `handleStart();` に変更する。

- [ ] **Step 5: 他に呼び出しが残っていないか確認する**

```bash
grep -n "handleStart" src/components/loading/LoadingScreen.tsx
```

Expected: 定義1箇所、呼び出し1箇所、依存配列1箇所のみ。`handleStart(true)` や `handleStart(false)` が残っていないこと。

- [ ] **Step 6: ビルドとユーザー確認**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
```

`pnpm dev` を案内し、次を確認してもらう。

1. トップの初回表示でローディングが出て、**黒い画面がふわっと消える**（従来はぶつ切りだった）
2. ローディング表示中にリロードや戻る操作をしたあと、スクロールできる

- [ ] **Step 7: コミット**

```bash
git add src/components/loading/LoadingScreen.tsx
git commit -m "fix: LoadingScreenのフェードが再生されない不具合とoverflowのcleanup漏れを修正"
```

## Task 10: LoadingScreen の演出時間を短縮する

**Files:**
- Modify: `src/components/loading/LoadingScreen.tsx`（`duration` 定数、100%到達時の待機、フェードの `duration-1000`、`handleStart` の setTimeout）

**Interfaces:**
- Consumes: Task 9 の `handleStart()`（引数なし）
- Produces: なし

秒数だけを触るコミットにする。実物を見てから数値を調整しやすくするため。

- [ ] **Step 1: 進捗演出を 2000ms → 700ms にする**

進捗シミュレーションの `useEffect` 内の `const duration = 2000;` を `const duration = 700;` にする。あわせて上のコメント「約2秒で完了するプログレスシミュレーション」を「約0.7秒で完了するプログレスシミュレーション」に直す。

- [ ] **Step 2: 100%到達後の待機を削除する**

100% 到達時の `useEffect` を次に置き換える。

```tsx
	// 100%到達で完了
	useEffect(() => {
		if (progress === 100) {
			handleStart();
		}
	}, [progress, handleStart]);
```

- [ ] **Step 3: フェード時間を 1000ms → 500ms にする**

`handleStart` の `setTimeout(..., 1000)` を `setTimeout(..., 500)` にし、コメントの `duration-1000` を `duration-500` に直す。

JSX 側のルート要素の `transition-opacity duration-1000` を `transition-opacity duration-500` にする。

- [ ] **Step 4: タイムラインを確認する**

変更後の想定は次のとおり。

| 時刻 | 状態 |
|---|---|
| 0ms | 黒い画面 + プログレスバー |
| 700ms | 100% 到達 → フェード開始・スクロール解放 |
| 1200ms | フェード完了・LoadingScreen が unmount |

本文が読み始められるのは 700ms 時点（フェード中は徐々に見える）。

- [ ] **Step 5: ビルドとユーザー確認**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
```

`pnpm dev` を案内し、体感を確認してもらう。**速すぎる／遅すぎると感じたら `duration` の値だけを 600〜800 の範囲で調整する。**

- [ ] **Step 6: コミット**

```bash
git add src/components/loading/LoadingScreen.tsx
git commit -m "perf: LoadingScreenの演出時間を2.5秒から0.7秒に短縮"
```

## Task 11: スクロール封鎖を撤去する

**Files:**
- Modify: `src/components/loading/LoadingScreen.tsx`（overflow を触る2箇所）
- Modify: `src/app/components/HomeClient.tsx:110-115`

**Interfaces:**
- Consumes: なし
- Produces: なし

- [ ] **Step 1: LoadingScreen から overflow の操作を削除する**

Task 9 で追加した `useEffect`（スクロール無効化と cleanup）を丸ごと削除する。あわせて `handleStart` 内の `document.body.style.overflow = "unset";` の行も削除する。削除後の `handleStart` は次のようになる。

```tsx
	const handleStart = useCallback(() => {
		setHasStarted(true);
		// フェードアウト(transition-opacity duration-500)を再生しきってから親に完了を伝える
		setTimeout(() => {
			onLoadingComplete();
		}, 500);
	}, [onLoadingComplete]);
```

`useEffect` の import が使われなくなっていないかを確認する（進捗シミュレーションと100%到達で使っているので残るはず）。

- [ ] **Step 2: 残っていないか確認する**

```bash
grep -n "overflow" src/components/loading/LoadingScreen.tsx
```

Expected: 出力なし

- [ ] **Step 3: HomeClient のリトライを削除する**

`src/app/components/HomeClient.tsx` の `jumpToContact` から、次の3行を削除する。

```tsx
			if (document.body.style.overflow === "hidden") {
				// LoadingScreenがスクロールをロックしている間はリトライ
				setTimeout(jumpToContact, 300);
				return;
			}
```

あわせて、この関数の上のコメント（106行目付近）から「また、LoadingScreen表示中は body が overflow:hidden でスクロールできないため、解除されるまで待つ。」の1文を削除する。

**`MissionSection` の展開待ちである `setTimeout(..., 300)`（125-128行目付近）は残すこと。** 役割が違う。この分岐が防いでいたのは「スクロールがロックされている間の `window.scrollTo` の空振り」だけで、封鎖をやめれば発生しない。

- [ ] **Step 4: 削除できたか確認する**

```bash
grep -n "overflow" src/app/components/HomeClient.tsx
grep -c "setTimeout" src/app/components/HomeClient.tsx
```

Expected: 1つ目は出力なし。2つ目は削除前より1つ減っていること。

- [ ] **Step 5: ビルド**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
node scripts/measure-page-weight.mjs
```

転送量は変わらないはず。`/blog` が Task 8 の値（149 KB 前後）を維持していることを確認する。

- [ ] **Step 6: ユーザーに回帰確認を依頼する（このブランチで最も重要）**

`pnpm dev` を案内し、次をすべて確認してもらう。**確認が取れるまでコミットしない。**

1. トップの初回表示で、ローディング中でもマウスホイールでスクロールできるか
2. **`/#contact` に直接アクセスして、お問い合わせフォームに到達するか**
3. **`/service` の CTA から `/#contact` に遷移して、フォームに到達するか**
4. `/#contact` の状態でリロードして、フォームに到達するか
5. トップを普通にスクロールして、ミッション → About → コンタクトの遷移が従来どおり動くか
6. ヘッダーのメニューから `/mission` `/about` `/contact` に飛べるか

**2〜4のいずれかが失敗した場合**は、`jumpToContact` の初回遅延（`setTimeout(jumpToContact, 500)`）が LoadingScreen の 700ms より短くなったことが原因の可能性がある。その場合は遅延値の調整をユーザーに提案する。

- [ ] **Step 7: コミット**

```bash
git add src/components/loading/LoadingScreen.tsx src/app/components/HomeClient.tsx
git commit -m "perf: LoadingScreenのスクロール封鎖を撤去し /#contact の待機処理を整理"
```

## Task 12: HeroCanvasWrapper のコメントを訂正する

**Files:**
- Modify: `src/components/three/HeroCanvasWrapper.tsx:26-28`

**Interfaces:**
- Consumes: なし
- Produces: なし

コード自体は変えない。実態と食い違うコメントだけを直す。性能施策としては数えない。

- [ ] **Step 1: コメントを書き換える**

`src/components/three/HeroCanvasWrapper.tsx` の `useEffect` の上のコメントを次に置き換える。

```tsx
	// 初期ロード（LoadingScreen等）が落ち着いてからCanvasをマウントする。
	// これはあくまでマウントの遅延であり、チャンクのダウンロード自体は止められない。
	// トップの初期HTMLに three-vendor が出力されていた原因は
	// AboutSection -> AboutThreeImage の静的インポート側にあり、そちらは動的インポートに変更済み。
	// （2026-08 の調査。詳細は docs/superpowers/specs/2026-08-12-performance-fixes-design.md）
```

- [ ] **Step 2: ビルド**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec dotenvx run -f .env.local -- pnpm exec next build
```

- [ ] **Step 3: コミット**

```bash
git add src/components/three/HeroCanvasWrapper.tsx
git commit -m "docs: HeroCanvasWrapperの実態と食い違うコメントを訂正"
```

- [ ] **Step 4: 進捗を記録する**

`doc/progress.md` にブランチ4の内容、`/blog` の実測値（378 KB → 149 KB）、LoadingScreen の新しいタイムライン、ユーザーの回帰確認結果を記録してコミットする。

```bash
git add doc/progress.md
git commit -m "docs: blogカーソルとLoadingScreenの修正結果を記録"
```

---

# 単位4・5（Next.js 16 移行 / pnpm）について

設計書の単位4（`feature/nextjs-16-upgrade`）と単位5（`chore/pnpm-supply-chain`）は、**この計画には含めず、ブランチ4のマージ後に別の計画を書く。**

理由は、Next 16 の作業の中身が「Turbopack が `splitChunks.cacheGroups` なしでどうチャンクを分けるか」の実測結果に依存するため。いま手順を書いても、Turbopack の出力を推測した内容になり、計画としての精度が出ない。ブランチ3で入れた計測スクリプトで実測してから手順を決める。

そのときに引き継ぐ前提は設計書の「単位 4」「単位 5」に書いてある。特に次の2点を忘れないこと。

- **`latest` 指定を使わない。** Next 16 の固定バージョンを明記する
- **pnpm の `minimumReleaseAge` 等は Next 16 移行と別 PR にする**

---

# 完了後の期待値

| ページ | 現状 | Task 12 完了後 |
|---|---|---|
| `/` 初期ロード | 417 KB | 145 KB 前後（three 229 KB は遅延チャンクへ移動。総転送量は変わらない） |
| `/blog`, `/blog/[slug]` | 378 KB | 140 KB 前後（−63%・総転送量も減る） |
| `/service` 系3ページ | 257 KB | 157 KB 前後（レンダーブロッキング CSS 135 KB → 44 KB） |
| トップで本文が読めるまで | 2.5 秒（固定） | 0.7 秒 |
| sitemap の `/blog` | あり | なし |

すべて gzip 後。計測スクリプトは brotli も出すので、Vercel での実際の転送量はそちらを見る。
