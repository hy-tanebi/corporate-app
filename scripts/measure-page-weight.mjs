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

// 第1引数でビルド出力ディレクトリを指定できる。省略時は .next。
// dev サーバーを動かしたまま計測するときは、別ディレクトリにビルドして渡すこと:
//   NEXT_DIST_DIR=.next-measure pnpm exec dotenvx run -f .env.local -- pnpm exec next build
//   node scripts/measure-page-weight.mjs .next-measure
const NEXT_DIR = process.argv[2] || ".next";
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
