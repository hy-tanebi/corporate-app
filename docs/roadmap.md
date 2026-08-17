# 残作業ロードマップ

このサイトで着手待ちになっている技術的な課題の一覧。
最終更新: 2026-08-17（PR #189 で本番リリース済みの状態）

> 実測値・判断の経緯・コピー方針などの詳細は、リポジトリ管理外の `doc/progress.md` にある。
> このファイルは「何が残っているか」と「なぜ必要か」を公開できる範囲で記録するもの。

---

## 着手待ちの項目

### 1. TANEBI CREATIVE 詳細ページの作成

トップページの 3D カード 1 枚目のリンク先が、詳細ページ未作成のため暫定で `/#about`（トップ内の ABOUT セクション）を指している。ページを作成したら `src/components/three/showcase-cards.ts` の `liveUrl` を差し替えるだけでよい。

### 2. `/blog` 一覧ページを sitemap に戻す

記事が 0 件だった時期に `src/app/sitemap.ts` から除外したまま戻していない。個別記事（`/blog/:id`）は動的に生成されるが、一覧ページ自体が載っていない。本番には実記事があるため、戻す判断ができる状態。

### 3. `/blog` のカーソル追従を DOM 実装に置き換える

`src/app/blog/layout.tsx` がマウス追従の円 1 個のために `MousePointer` を静的インポートしており、three-vendor（gzip 196KB）と react-reconciler（gzip 33KB）の計 **229KB** がブログ全ページに載っている。CSS の `transform` で代替できる。

同ファイルは `useFrame` 内で `setState` しており、毎秒 60 回の再レンダリングが走る問題も抱えている。トップページの `HtmlHoverPointer` で採用した「ref + 単一 rAF + `transform`」の実装に揃えるのが自然。

### 4. GLB のモバイル条件ロード

`Astronaut.tsx` の `useGLTF("/models/artro_draco.glb")` は 0.83MB（Blender の decimate で 3.58MB から削減済み）。モバイルでも無条件で読み込んでおり、位置と縮尺が変わるだけになっている。回線と GPU メモリの負担を考えると、モバイルでは静止画へのフォールバックや読み込み自体の見送りを検討する余地がある。

### 5. Next.js 16 移行（15.5.16 → 16.x）

**唯一の実質的なブロッカーは `next.config.ts` の `webpack()`。** Next 16 は `next build` が Turbopack 既定になり、webpack 設定があるとビルドが失敗する。

- `.glsl` の raw-loader → `turbopack.rules` へ移行可能
- `splitChunks.cacheGroups`（three / framer-motion の分離）→ Turbopack に同等機能がないため、自動分割に任せて `scripts/measure-page-weight.mjs` で実測して判断する
- 逃げ道として `next build --webpack` がある

影響がないことを確認済みの項目: async params / cookies / headers / draftMode（すべて `await` 済み）、並列ルート、AMP、`next lint`（Biome を使用）、`runtimeConfig`、`unstable_*`、`scroll-behavior: smooth`、`quality` prop。キャッシュ API の破壊的変更も、`unstable_cache` / `revalidateTag` / `export const revalidate` の使用が 0 件のため影響しない。

あわせて `packageManager` を pnpm 10.26 以降に固定し、`pnpm-workspace.yaml` に `minimumReleaseAge` 等のサプライチェーン対策を入れるのが自然なタイミング。

### 6. 液体シェーダーの局所化

`hover-fluid-fragment.glsl` は全画面の全ピクセルで `fbm`（3オクターブ）を計算しており、`grad()` がそれを4回呼ぶ。しかし歪みが必要なのは実質ポインタ周辺だけ。

- 半径外は早期に元の UV をサンプルして返す
- ベースの微弱な揺れは、毎ピクセルの `fbm` ではなく低解像度のノイズテクスチャをスクロールさせて代替する

古い PC での負荷に効く。描画パスの2パス化（実施済み）の次に効果が大きい。

### 7. FBO の解像度とアンチエイリアス（品質側の課題）

`useFBO` に `window.innerWidth / innerHeight`（CSS ピクセル）を渡している一方、canvas の DPR は `[1, 1.5]`。**FBO が画面より低解像度のまま拡大表示されており、常時わずかにボケている。** また `samples: 0` のため、見えている映像にアンチエイリアスが一切かかっていない。

液体メッシュは画面全体を上書きするため、見えている画素はすべて FBO 由来。つまり canvas 側の `antialias: true` は使われないまま費用だけ払っている状態でもある。

すぐ上げる必要はない。上げる前に項目6（シェーダーの局所化）を先に済ませること。着手する場合の指針:

- 標準は FBO を DPR 1.0 のまま維持
- 高性能 GPU で 1.25、高品質モードでのみ canvas 相当（上限 1.5）
- サイズは `window.innerWidth` ではなく R3F の `state.size` と `gl.getPixelRatio()` に追従させる（window と Canvas のサイズは一致しないことがある）
- `samples` は 0 のままでよい。上げるなら `2` から試す
- canvas の `antialias` を `false` にできるか検討する

### 8. `/works` の再設計

現在 noindex で据え置き。sitemap からも除外している。

### 9. コピーの見直し

サービス紹介ページとトップページの文言を、事業ポジショニングに合わせて刷新する。方針と承認済みの案は `doc/progress.md` にある。

---

## 実装時に守ること

過去に踏んだ落とし穴。同種の実装を追加するときは必ず確認する。

### `window.scrollTo({ behavior: "auto" })` の直後は `syncScrollLerp()` を呼ぶ

トップページはスクロール量を平滑化して追従する RAF ループを持つ（1 フレームあたり差分の 8%）。瞬間移動したスクロール位置に追いつくまで **約 717ms（60fps で 43 フレーム）** かかり、その間ループは「まだ画面上部にいる」と判断してセクションの表示状態を巻き戻す。補間値を実位置へ同期させることでこれを断つ。

### `/#...` のリンクは `HashJumpLink` を使う

生の `next/link` で `/#contact` などを張ると、スナップ完了までの中間状態を隠す黒カバーのフラグが立たず、遷移の途中経過がそのまま見えてしまう。`src/components/lp/hash-jump-link.tsx` を使う。

### マウス追従 UI は `left` / `top` ではなく `transform` で動かす

`left` / `top` はレイアウト計算を伴うため、マウス移動のたびにレイアウトシフトとして計上される。DevTools で実測したところ、ホバー中に 176 件のシフトが積み上がっていた。`position: fixed` でも除外されない（fixed が CLS から除外するのはスクロールに伴う見かけ上の移動であって、`left` / `top` の変更ではない）。また `mousemove` は `hadRecentInput` の除外対象（クリック・タップ・キー入力などの離散入力）に当たらない。

### ローカルでのビルド検証コマンド

```bash
NEXT_DIST_DIR=.next-verify pnpm dotenvx run -f .env.local -- pnpm exec next build
```

- 素の `pnpm build` は dotenvx を通らないため、microCMS の URL が暗号化文字列のままになりビルドが落ちる
- `NEXT_DIST_DIR` で出力先を分けないと、稼働中の開発サーバーの `.next` を壊す（過去に 2 回発生）

### 液体エフェクトの描画は2パス構成。FBO の更新頻度を下げてはいけない

トップの液体メッシュは `NoBlending` + `depthTest: false` の全画面メッシュで、**FBO に撮ったシーンを歪ませて canvas に出す合成パス**。つまり PC で見えている絵はシーンそのものではなく FBO のキャプチャであり、**FBO の更新頻度がそのまま画面全体の実効フレームレートになる**。

一度この更新頻度を絞ったことがあるが（PR #188）、スクロール中の演出が 20fps になり、紫のガス表現が荒くなった。歪みシェーダーの `uTime` だけは 60fps で進むため「20fps の映像に 60fps の屈折が掛かる」状態になって特に目立つ。削るべきは更新頻度ではなかった。

現在は合成メッシュを `postScene` に分離し、`useFrame(..., 1)` で R3F の自動描画を止めて次の2パスに固定してある。

```
パス1: シーン    → FBO
パス2: FBO      → canvas（全画面メッシュ1枚だけ）
```

触るときの注意:

- **`useFrame` の renderPriority を 0 に戻さないこと。** 戻すと R3F の自動描画が復活し、シーンと合成メッシュが二重に描かれる
- **このコールバックから抜ける経路では必ず canvas へ描くこと。** 描かないと前フレームが残る
- `gl.clear()` の明示呼び出しは不要（`autoClear` が既定の `true` なので `render()` がクリアする）
- 合成メッシュを `postScene` からメインのシーンへ戻さないこと。戻すと FBO へ撮る際に自分自身が写り込む

### 3D カードの画像は 3:2 で用意する

カードの板は `CARD_W = 3, CARD_H = 2`（`VideoCard3D.tsx`）。テクスチャは板全体に引き伸ばされるため、正方形の画像を渡すと横方向に 1.5 倍伸びる。また `VideoCard3D.tsx` のテクスチャ読み込み失敗ハンドラは空で、**失敗してもエラーが出ずカードが白くなるだけ**なので、差し替え後は必ず目視で確認する。
