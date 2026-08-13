# サービスLPページ設計 — カード記事のWebページ化

日付: 2026-07-06
ステータス: 承認待ち

## 背景と目的

トップページの3D回転カード3枚は、現在microCMSの `isShowcase: true` 記事（`/blog/記事ID`）にリンクしており、飛び先がブログ記事レイアウト（日付・カテゴリバッジ・目次・著者カード付き）で表示される。サービス紹介という内容に対して「ブログ記事」の見た目が合っていない。

これを、COOSY（coosy.co.jp）のサービスページのような「Webページらしい」LP風デザイン（大見出し・セクション構成・明確なCTA）の専用ページに置き換える。

## 決定事項

| 論点 | 決定 |
|---|---|
| コンテンツ管理 | microCMSをやめ、コード管理（Next.js専用ページ） |
| ページ構成 | 3ページに分割 |
| ビジュアル | 既存サイトのトーン（配色トークン・フォント）を維持し、構造だけLP風にする |
| 3D回転カード | CMS取得をやめ、コード内定数化 |

## ルーティング

3ページすべてRSC・完全静的生成。

| ページ | URL | 役割 |
|---|---|---|
| こんなお悩み、ありませんか | `/service/issues` | 共感の入口。悩み4つ →「小さく相談できます」→ CTA |
| できること ─ ご相談メニュー | `/service` | サービスメニューの提示 |
| 実際の取り組み | `/works` | 事例による信頼づくり。自社ツール改善の話 |

## ファイル配置

```
src/app/service/page.tsx          ← できること
src/app/service/issues/page.tsx   ← お悩み
src/app/works/page.tsx            ← 実績
src/components/lp/PageHero.tsx    ← 共有: 英字ラベル + 大見出し + リード文
src/components/lp/LpSection.tsx   ← 共有: セクション枠（余白・見出しスタイル統一）
src/components/lp/CtaBlock.tsx    ← 共有: 「まずは話を聞いてみる」→ /#contact
src/components/three/showcase-cards.ts ← 3カードの定数定義
```

## 共有LPコンポーネント

すべてRSC。propsは最小限。

- **PageHero** — props: `label`（英字ラベル 例 "SERVICE"）、`title`、`lead`。上部に「← TANEBI CREATIVE」のホーム戻りリンクを含む（このサイトにはグローバルヘッダーがないため）。見出しは `text-4xl〜6xl` の太字。既存の配色トークン（`--foreground` 等）を使用。
- **LpSection** — props: `title`、`children`。セクション間の大きな余白（`py-16〜24`）と見出しスタイルを統一。
- **CtaBlock** — 固定文言「まずは話を聞いてみる／初回相談無料」+ `/#contact` へのボタン。3ページ共通で末尾に配置。

## 各ページのセクション構成

素材は既存の下書き `blog/card-01-oshinayami.md` / `card-02-dekiru.md` / `card-03-jissai.md` の本文。

- **`/service/issues`**: PageHero「こんなお悩み、ありませんか」→ 悩み4つを2×2カードグリッド（HP古い／Excel属人化／事務作業／AI迷子。各カードに見出し+要約+本文）→「小さく相談できます」→ CtaBlock
- **`/service`**: PageHero「できること」→ ご相談メニューをメニューごとのセクションで提示（見出し大+説明+関連タグ）→ CtaBlock
- **`/works`**: PageHero「実際の取り組み」→ 事例をストーリー形式（課題→やったこと→結果）で提示 → CtaBlock

ブログ用の装飾（日付・著者・目次・カテゴリバッジ・「ブログ一覧に戻る」）は一切出さない。

## 3D回転カードのコード化

- `src/components/three/showcase-cards.ts` に3カードの定数を定義:
  - `{ title: "こんなお悩み、ありませんか", imageSrc: "/images/cards/issues.jpg", liveUrl: "/service/issues" }`
  - `{ title: "できること ─ ご相談メニュー", imageSrc: "/images/cards/service.jpg", liveUrl: "/service" }`
  - `{ title: "実際の取り組み", imageSrc: "/images/cards/works.jpg", liveUrl: "/works" }`
- `HeroCanvasWithCMS.tsx` からmicroCMSのshowcase取得（`getBlogPosts` → `isShowcase` フィルタ）を削除し、定数を渡すだけにする。CMS障害・APIキー未設定でもカードは必ず表示される。
- カード画像は `public/images/cards/` に静的配置。画像が未用意の場合はタイトルテキスト表示のみで動作する設計とする。

## 後片付け

- `blog/card-01〜03.md` は `blog/archive/` へ移動（microCMSには投稿しない。CMS側に下書きが既にあれば手動削除）。
- ブログ機能（`/blog`）と `isShowcase` フィールド定義はそのまま残す（通常記事の運用は継続）。
- `src/app/sitemap.ts` に新3ページを追加。
- 各ページに `metadata`（title / description）を設定。ブログ用JSON-LDは使わない。

## エラーハンドリング / テスト

- 3ページは完全静的のため実行時エラー要因なし。
- 完了条件: `pnpm lint` と `pnpm build` が通ること。開発サーバーで3ページ+トップの3Dカードのリンク先を目視確認。

## スコープ外

- ブログ記事レイアウト自体の変更
- microCMSスキーマの変更（`isShowcase` フィールドの削除等）
- COOSY風イラストなど新規ビジュアル素材の制作
