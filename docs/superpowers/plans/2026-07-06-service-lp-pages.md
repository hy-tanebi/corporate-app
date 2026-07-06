# サービスLPページ実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3D回転カードの飛び先を、ブログ記事レイアウトからLP風の専用3ページ（/service/issues, /service, /works）に置き換える。

**Architecture:** 共有LPコンポーネント（PageHero / LpSection / CtaBlock）を`src/components/lp/`に作り、3ページはRSCの完全静的ページとして実装。3D回転カードはmicroCMS取得をやめ、コード内定数（showcase-cards.ts）から表示する。

**Tech Stack:** Next.js App Router (RSC) / TypeScript / Tailwind CSS / Biome

## Global Constraints

- パッケージ管理はpnpmのみ。新規依存の追加はしない。
- コミットメッセージはConventional Commits（接頭辞は英語、説明は日本語）。
- このリポジトリにテストフレームワークはない。各タスクの検証は `pnpm lint`（エラー0）で行い、最終タスクで `pnpm build` と目視確認を行う。
- スタイリングは既存の配色トークン（`bg-background` `text-foreground` `text-muted-foreground` `bg-secondary` `border-border` `bg-primary` `text-primary-foreground`）を使う。ダークモード対応はトークン任せでよい。
- 全コンポーネント・ページはRSC（`"use client"`を書かない）。
- CTAリンク先はすべて `/#contact`。

**スペック:** `docs/superpowers/specs/2026-07-06-service-lp-pages-design.md`

---

### Task 1: 共有LPコンポーネント（PageHero / LpSection / CtaBlock）

**Files:**
- Create: `src/components/lp/PageHero.tsx`
- Create: `src/components/lp/LpSection.tsx`
- Create: `src/components/lp/CtaBlock.tsx`

**Interfaces:**
- Consumes: なし（`next/link`のみ）
- Produces:
  - `PageHero({ label, title, lead }: { label: string; title: string; lead: string })`
  - `LpSection({ title, children }: { title: string; children: React.ReactNode })`
  - `CtaBlock()` — propsなし

- [ ] **Step 1: PageHero.tsxを作成**

```tsx
import Link from "next/link";

interface PageHeroProps {
	label: string;
	title: string;
	lead: string;
}

export function PageHero({ label, title, lead }: PageHeroProps) {
	return (
		<header className="pt-8 pb-16 lg:pt-12 lg:pb-24">
			<nav className="mb-12 lg:mb-16">
				<Link
					href="/"
					className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					← TANEBI CREATIVE
				</Link>
			</nav>
			<p className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4">
				{label}
			</p>
			<h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight mb-8">
				{title}
			</h1>
			<p className="text-base lg:text-lg leading-relaxed text-muted-foreground max-w-2xl whitespace-pre-line">
				{lead}
			</p>
		</header>
	);
}
```

- [ ] **Step 2: LpSection.tsxを作成**

```tsx
import type { ReactNode } from "react";

interface LpSectionProps {
	title: string;
	children: ReactNode;
}

export function LpSection({ title, children }: LpSectionProps) {
	return (
		<section className="py-12 lg:py-20 border-t border-border">
			<h2 className="text-2xl lg:text-4xl font-bold tracking-tight mb-8 lg:mb-12">
				{title}
			</h2>
			{children}
		</section>
	);
}
```

- [ ] **Step 3: CtaBlock.tsxを作成**

```tsx
import Link from "next/link";

export function CtaBlock() {
	return (
		<section className="my-16 lg:my-24 rounded-2xl bg-secondary px-6 py-12 lg:px-12 lg:py-16 text-center">
			<h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4">
				まずは話を聞いてみる
			</h2>
			<p className="text-muted-foreground mb-8">
				「何を頼めばいいかまだ分からない」という状態での相談で大丈夫です。
				<br className="hidden lg:inline" />
				初回の相談は無料です。
			</p>
			<Link
				href="/#contact"
				className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:opacity-90 transition-opacity"
			>
				無料で相談する →
			</Link>
		</section>
	);
}
```

- [ ] **Step 4: lint実行**

Run: `pnpm lint`
Expected: エラー0

- [ ] **Step 5: コミット**

```bash
git add src/components/lp/
git commit -m "feat(lp): サービスLPページ用の共有コンポーネントを追加"
```

---

### Task 2: /service/issues ページ（こんなお悩み、ありませんか）

**Files:**
- Create: `src/app/service/issues/page.tsx`

**Interfaces:**
- Consumes: `PageHero` / `LpSection` / `CtaBlock`（Task 1の定義通り）
- Produces: ルート `/service/issues`（完全静的）

- [ ] **Step 1: page.tsxを作成**

コンテンツは `blog/card-01-oshinayami.md` の本文をLP構成に再構成したもの。悩み4つは2×2カードグリッド。

```tsx
import type { Metadata } from "next";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "こんなお悩み、ありませんか | TANEBI CREATIVE",
	description:
		"古いホームページ、属人化したExcel管理、AIの使いどころ。「何とかしたいけど後回しにしている」ことに、一緒に手をつけます。初回相談は無料です。",
};

const issues = [
	{
		title: "ホームページが古いまま、問い合わせも来ない",
		summary: "サイトはあるのに、そこから問い合わせが来た記憶がない。",
		body: [
			"「とりあえず作ったけど、もう何年も触っていない」「電話番号が古いまま載っている」「スマホで見たらレイアウトが崩れている」――こういうサイトが、実は地元にもたくさんあります。",
			"それって、サイトに問題があるというより、サイトへの入口が設計されていないことが多いです。大改修でなくても、情報の整理と問い合わせ導線を見直すだけで変わることはあります。",
		],
	},
	{
		title: "Excel・紙の管理が属人化していてしんどい",
		summary: "その担当者しか分からない。引き継ぎができない。",
		body: [
			"「毎回同じ転記作業に時間がかかる」。こういう状態が続くと、じわじわと業務の負荷になっていきます。",
			"かといって、大きなシステムを入れるほどの規模でもない。まず手順を聞き取って、必要な部分だけをツール化することを考えます。全部をシステム化する必要はありません。",
		],
	},
	{
		title: "事務作業・資料作成に時間がかかっている",
		summary: "毎月同じ資料を手で作っている。議事録が地味に大変。",
		body: [
			"繰り返し作業の中には、AIで置き換えられるものと、そうでないものが混在しています。",
			"むやみにAIを入れることはしません。業務を見てから、置き換えた方がいいもの・置き換えない方がいいものを整理します。",
		],
	},
	{
		title: "AIが気になるけど、何から始めればいいか分からない",
		summary: "ChatGPTは触ってみたけど、業務への活かし方が分からない。",
		body: [
			"AIを入れること自体が目的になると、うまくいきません。業務を先に見て、小さく試すことから始めるのが確実です。",
			"いきなり全部変えなくていいです。",
		],
	},
];

export default function ServiceIssuesPage() {
	return (
		<div className="container mx-auto max-w-5xl px-4">
			<PageHero
				label="ISSUES"
				title="こんなお悩み、ありませんか"
				lead={
					"古いホームページのまま何年も経っている。Excel管理が自分にしか分からない状態になっている。AIが気になってはいるけど、何から手をつけていいか分からない。\nそういう「何とかしたいとは思っているけど、後回しにしてしまっている」ことに、一緒に手をつける仕事をしています。"
				}
			/>

			<LpSection title="よくあるお悩み">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
					{issues.map((issue) => (
						<div
							key={issue.title}
							className="rounded-2xl border border-border p-6 lg:p-8"
						>
							<h3 className="text-lg lg:text-xl font-bold mb-2">
								{issue.title}
							</h3>
							<p className="text-sm font-medium text-muted-foreground mb-4">
								{issue.summary}
							</p>
							{issue.body.map((paragraph) => (
								<p
									key={paragraph}
									className="text-sm lg:text-base leading-relaxed mb-3 last:mb-0"
								>
									{paragraph}
								</p>
							))}
						</div>
					))}
				</div>
			</LpSection>

			<LpSection title="小さく相談できます">
				<p className="text-base lg:text-lg leading-relaxed max-w-2xl">
					「何を頼めばいいかまだ分からない」という状態での相談で大丈夫です。まず話を聞いて、何から手をつけると変わりそうかを一緒に整理します。
				</p>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
```

- [ ] **Step 2: lint実行**

Run: `pnpm lint`
Expected: エラー0

- [ ] **Step 3: 開発サーバーで表示確認**

Run: `pnpm dev` を起動し `http://localhost:3000/service/issues` を開く
Expected: ヒーロー見出し・悩み4カード（PCで2×2）・CTAブロックが表示され、日付/著者/目次などブログ装飾が出ていない

- [ ] **Step 4: コミット**

```bash
git add src/app/service/issues/
git commit -m "feat(lp): お悩みページ(/service/issues)を追加"
```

---

### Task 3: /service ページ（できること ─ ご相談メニュー）

**Files:**
- Create: `src/app/service/page.tsx`

**Interfaces:**
- Consumes: `PageHero` / `LpSection` / `CtaBlock`（Task 1の定義通り）
- Produces: ルート `/service`（完全静的）

- [ ] **Step 1: page.tsxを作成**

コンテンツは `blog/card-02-dekiru.md` の再構成。元記事の「→ 実際の取り組みはこちら」リンクは `/blog/card-jissai` ではなく `/works` に向ける。

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "できること ─ ご相談メニュー | TANEBI CREATIVE",
	description:
		"Webサイト改善の見直し、AI業務改善のミニ相談、小規模業務ツールの開発。どれも「まず話を聞いてから」小さく始められます。初回相談は無料です。",
};

const menus = [
	{
		number: "01",
		title: "Webサイト改善の見直し",
		body: [
			"古くなったサイトの情報整理、問い合わせ導線の確認、スマホ表示・ページ速度の確認、GA4の導入状況の確認と改善提案をします。",
			"「どこから手をつければいいか分からない」という状態でも大丈夫です。まず現状を一緒に整理するところから始めます。全ページをリニューアルしなくても、優先度の高い箇所だけを直すことで費用を抑えることもできます。",
		],
		items: [
			"古い情報・営業時間・電話番号の整理",
			"問い合わせ導線の確認・改善提案",
			"スマホ表示・ページ速度の確認",
			"GA4の導入・活用状況のチェック",
		],
	},
	{
		number: "02",
		title: "AI業務改善のミニ相談",
		body: [
			"業務を聞き取って、AIで置き換えられる作業・置き換えない方がいい作業を整理します。「とりあえずAIを入れれば効率化できる」ということはなく、業務に合った使い方がそれぞれあります。",
			"いきなりシステムを入れるのではなく、まず現状の業務を整理することから始めます。そのうえで、小さく試せるところがあれば一緒に試します。",
		],
		items: [
			"繰り返し作業の洗い出し（文書作成・転記・集計など）",
			"AIで置き換えられる作業・できない作業の整理",
			"ツールの選定・導入支援（ChatGPT、Dify等）",
			"「やらない方がいいAI導入」の整理",
		],
	},
	{
		number: "03",
		title: "小規模業務ツールの開発",
		body: [
			"「大きなシステムは不要だけど、Excelや紙での管理をもう少し整理したい」という場合に対応します。認証・管理画面・データ出力のある小さなWebツールを作ります。",
			"作って終わりではなく、使い続けられる設計にします。",
		],
		items: [
			"紙・Excel管理の簡易Webツール化",
			"管理画面・CSV出力・担当者別の権限設定",
			"既存業務を止めずに少しずつ移行",
		],
	},
];

export default function ServicePage() {
	return (
		<div className="container mx-auto max-w-5xl px-4">
			<PageHero
				label="SERVICE"
				title="できること ─ ご相談メニュー"
				lead={
					"Web改善の見直し、AI業務改善の整理、小さな業務ツールづくり。\nどれも「まず話を聞いてから」始めます。小さく始められます。"
				}
			/>

			<LpSection title="ご相談できること">
				<p className="text-base lg:text-lg leading-relaxed max-w-2xl mb-12">
					TANEBI CREATIVEで対応していることを、3つのメニューとして整理しました。いずれも「決めてから依頼する」ではなく、「まず話してみる」から始められます。
				</p>
				<div className="space-y-12 lg:space-y-16">
					{menus.map((menu) => (
						<div
							key={menu.number}
							className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-12"
						>
							<div>
								<p className="text-sm font-bold tracking-[0.2em] text-muted-foreground mb-2">
									{menu.number}
								</p>
								<h3 className="text-xl lg:text-2xl font-bold mb-4">
									{menu.title}
								</h3>
								{menu.body.map((paragraph) => (
									<p
										key={paragraph}
										className="text-sm lg:text-base leading-relaxed mb-3 last:mb-0"
									>
										{paragraph}
									</p>
								))}
							</div>
							<ul className="self-start rounded-2xl bg-secondary p-6 space-y-3">
								{menu.items.map((item) => (
									<li
										key={item}
										className="text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-foreground"
									>
										{item}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<p className="mt-12 text-sm lg:text-base text-muted-foreground">
					自社でも同じ進め方でツールを作り、毎日使っています。
					<Link href="/works" className="underline hover:text-foreground">
						→ 実際の取り組みはこちら
					</Link>
				</p>
			</LpSection>

			<LpSection title="価格について">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">
						初回の相談は無料です。正式な費用は業務の内容をお聞きしてから提案します。
					</p>
					<p className="text-base lg:text-lg leading-relaxed">
						小さな相談・小さなツールには小さな価格で対応しています（数万円からが目安です）。大手企業向けの価格設定ではなく、地元の小さな事業者に合わせた相談をしています。
					</p>
					<p className="text-base lg:text-lg leading-relaxed">
						「高いものを勧めるつもりはありません。今あるものを活かして、必要な分だけ整理します。」
					</p>
				</div>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
```

- [ ] **Step 2: lint実行**

Run: `pnpm lint`
Expected: エラー0

- [ ] **Step 3: 開発サーバーで表示確認**

`http://localhost:3000/service` を開く
Expected: メニュー3ブロック（本文+右側にチェックリスト風カード）・価格セクション・CTAが表示される。`/works`へのリンクがある（この時点では404で正常。Task 4で解消）

- [ ] **Step 4: コミット**

```bash
git add src/app/service/page.tsx
git commit -m "feat(lp): サービスメニューページ(/service)を追加"
```

---

### Task 4: /works ページ（実際の取り組み）

**Files:**
- Create: `src/app/works/page.tsx`

**Interfaces:**
- Consumes: `PageHero` / `LpSection` / `CtaBlock`（Task 1の定義通り）
- Produces: ルート `/works`（完全静的）

- [ ] **Step 1: page.tsxを作成**

コンテンツは `blog/card-03-jissai.md` の再構成。ストーリー形式（課題→整理→開発→結果→残課題→姿勢→開発中）。元記事の「画面キャプチャ挿入TODO」は対象外（スペックのスコープ外: 新規ビジュアル素材）。

```tsx
import type { Metadata } from "next";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "実際の取り組み ─ 自社の業務を、自作ツールで改善した話 | TANEBI CREATIVE",
	description:
		"待機確認の業務を自作のWebツールに置き換え、今も毎日使っています。何に困り、何を整理し、どう作ったか。小さく作って使いながら育てる進め方を紹介します。",
};

export default function WorksPage() {
	return (
		<div className="container mx-auto max-w-5xl px-4">
			<PageHero
				label="WORKS"
				title="実際の取り組み"
				lead={
					"自社の業務を、自作ツールで改善した話。\n待機確認の業務を、自作のWebツールに置き換えました。今も毎日使っています。"
				}
			/>

			<LpSection title="何に困っていたか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">
						以前は、特定の業務における「誰が今どの状態にいるか」の管理を、LINEグループや口頭・メモで対応していました。
					</p>
					<p className="text-base lg:text-lg leading-relaxed">
						少人数のやり取りなので最初は問題なかったのですが、件数や状況のパターンが増えてくると、こういう問題が出てきました。
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-relaxed">
						<li>最新の状態が分からず、確認のための連絡が増える</li>
						<li>確認のタイミングがバラバラになる</li>
						<li>過去の記録を振り返りたいときに情報が散らばっている</li>
					</ul>
					<p className="text-base lg:text-lg leading-relaxed">
						「ちゃんとしたシステムを導入するほどの規模でもない。でも、今のやり方はしんどい」という状態でした。
					</p>
				</div>
			</LpSection>

			<LpSection title="何を整理したか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">
						まず、この業務の中で「何が分かっていれば判断できるか」を整理しました。必要だったのはシンプルで、
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-relaxed">
						<li>今、誰がどの状態にいるか（一覧で見える）</li>
						<li>状態が変わったときに記録が残る</li>
						<li>過去の履歴をすぐ確認できる</li>
					</ul>
					<p className="text-base lg:text-lg leading-relaxed">この3点でした。</p>
					<p className="text-base lg:text-lg leading-relaxed">
						他にも「あったら便利かも」と思う機能はいくつかありましたが、最初のバージョンには入れませんでした。使ってみてから必要だと分かったものを足す、という順番にしました。
					</p>
				</div>
			</LpSection>

			<LpSection title="どう作ったか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">
						Next.js（Webフレームワーク）＋ Supabase（データベース）で、小さな管理画面を作りました。
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-relaxed">
						<li>ログイン機能（使う人を限定する）</li>
						<li>一覧画面（誰が今どの状態か、ひと目で分かる）</li>
						<li>更新画面（状態を変えたときに記録が残る）</li>
						<li>履歴画面（過去のやり取りをさかのぼれる）</li>
					</ul>
					<p className="text-base lg:text-lg leading-relaxed">
						開発期間は、設計から動くものができるまで数日程度。大きなシステムではないので、短期間で形にできました。
					</p>
				</div>
			</LpSection>

			<LpSection title="結果、何が楽になったか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">
						「今どういう状態か」を確認するための連絡が、ほぼゼロになりました。画面を開けば分かるので、わざわざ聞かなくていいです。
					</p>
					<p className="text-base lg:text-lg leading-relaxed">
						記録も自動的に残るので、「あのときどうだったっけ」を振り返るときもすぐ確認できます。当初想定していた「ここが楽になる」は、だいたい想定通りでした。
					</p>
				</div>
			</LpSection>

			<LpSection title="まだ残っている課題">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">正直に書いておきます。</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-relaxed">
						<li>スマホからの操作性は、まだ洗練されていない部分がある</li>
						<li>通知機能（状態が変わったときに知らせる仕組み）は未実装</li>
						<li>データのエクスポート機能は後回しにしていて、今もない</li>
					</ul>
					<p className="text-base lg:text-lg leading-relaxed">
						「ないと困る機能」は初期バージョンで揃えましたが、「あったら便利な機能」はまだ手をつけていません。毎日使えているので、今は十分という判断で止めています。必要になったら足します。
					</p>
				</div>
			</LpSection>

			<LpSection title="この経験から、依頼を受けるときに意識していること">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">
						自社で作って使い続けているものがある、というのは、「言うだけ」とは違う自信になっています。
					</p>
					<p className="text-base lg:text-lg leading-relaxed">
						業務ツールを作るとき、よく起きるのが「要件を詰めすぎて最初のバージョンが大きくなり、完成する前に止まる」というパターンです。自分で経験したので、最初は小さく・使いながら育てる、という順番を強く意識しています。
					</p>
					<p className="text-base lg:text-lg leading-relaxed">
						「全部揃ってから始めなくていい」「使ってみてから調整すればいい」という進め方を、依頼を受ける仕事でも大事にしています。
					</p>
				</div>
			</LpSection>

			<LpSection title="開発中の取り組み">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-relaxed">
						現在、他にも2つ取り組んでいます。まだ開発中で、完成時期は未定です。
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-relaxed">
						<li>
							<strong>AI問い合わせ導線パッケージ</strong>
							: 説明が複雑な事業者向けに、問い合わせ前の「整理と案内」をAIで対応する仕組み（商談対応中）
						</li>
						<li>
							<strong>地域向けWeb相談ナビ</strong>
							: 自治体と連携した、困りごとの相談先を案内するアプリ（開発中）
						</li>
					</ul>
					<p className="text-base lg:text-lg leading-relaxed">
						いずれも、自分が関わっている現場の課題から出発しています。「こういうの、うちでもできるかな」と思った方、気軽に話しかけてください。
					</p>
				</div>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
```

- [ ] **Step 2: lint実行**

Run: `pnpm lint`
Expected: エラー0

- [ ] **Step 3: 開発サーバーで表示確認**

`http://localhost:3000/works` を開く
Expected: ストーリー7セクション+CTAが表示される。`/service` からの「実際の取り組みはこちら」リンクも通る

- [ ] **Step 4: コミット**

```bash
git add src/app/works/
git commit -m "feat(lp): 実績ページ(/works)を追加"
```

---

### Task 5: 3D回転カードのコード化（CMS依存の除去）

**Files:**
- Create: `src/components/three/showcase-cards.ts`
- Create: `src/components/three/HeroCanvasSection.tsx`（`HeroCanvasWithCMS.tsx` の置き換え）
- Delete: `src/components/three/HeroCanvasWithCMS.tsx`
- Modify: `src/app/page.tsx:1`（import差し替え）

**Interfaces:**
- Consumes: `VideoSlide`型（`src/types/content.ts:3-15`）、`HeroCanvasWrapper`（props: `videoSlides?: VideoSlide[]`）、`HeroStateProvider`
- Produces:
  - `SHOWCASE_CARDS: VideoSlide[]`（3件、`liveUrl`は新3ページ）
  - `HeroCanvasSection({ children }: { children: ReactNode })` — 旧`HeroCanvasWithCMS`と同じJSX構造でasyncでない

- [ ] **Step 1: showcase-cards.tsを作成**

画像は`public/images/`の既存webpを仮アサイン（差し替えは後日ユーザーが実施可能）。

```ts
import type { VideoSlide } from "../../types/content";

// トップの3D回転カード。CMSではなくコードで管理する。
export const SHOWCASE_CARDS: VideoSlide[] = [
	{
		id: "service-issues",
		title: "こんなお悩み、ありませんか",
		mediaType: "image",
		imageSrc: "/images/hero_dx_support.webp",
		description:
			"古いホームページ、属人化したExcel管理、AIの使いどころ。「何とかしたい」に一緒に手をつけます。",
		category: "サービス",
		liveUrl: "/service/issues",
	},
	{
		id: "service-menu",
		title: "できること ─ ご相談メニュー",
		mediaType: "image",
		imageSrc: "/images/hero_human_app.webp",
		description:
			"Web改善の見直し、AI業務改善の整理、小さな業務ツールづくり。どれも「まず話を聞いてから」始めます。",
		category: "サービス",
		liveUrl: "/service",
	},
	{
		id: "works-internal-tool",
		title: "実際の取り組み",
		mediaType: "image",
		imageSrc: "/images/hero_sync_human_app.webp",
		description:
			"待機確認の業務を自作のWebツールに置き換えました。今も毎日使っています。",
		category: "事例",
		liveUrl: "/works",
	},
];
```

- [ ] **Step 2: HeroCanvasSection.tsxを作成**

CMS取得(try/catch・`getBlogPosts`・`blogPostToVideoSlide`)を丸ごと廃止し、定数を渡すだけにする。JSX構造は旧`HeroCanvasWithCMS.tsx:61-80`と同一。

```tsx
import type { ReactNode } from "react";
import { HeroStateProvider } from "../../contexts/HeroStateProvider";
import HeroCanvasWrapper from "./HeroCanvasWrapper";
import { SHOWCASE_CARDS } from "./showcase-cards";

interface HeroCanvasSectionProps {
	children: ReactNode;
}

export default function HeroCanvasSection({
	children,
}: HeroCanvasSectionProps) {
	return (
		<HeroStateProvider>
			{/* 3D Scene (Client Side Only via Dynamic Import with ssr: false) */}
			<HeroCanvasWrapper videoSlides={SHOWCASE_CARDS} />

			{/* Main Content (SSR Safe) - Rendered independently of 3D Canvas */}
			<div
				style={{
					position: "relative",
					zIndex: 10,
					minHeight: "1000vh",
					pointerEvents: "none",
				}}
			>
				{children}
			</div>
		</HeroStateProvider>
	);
}
```

- [ ] **Step 3: page.tsxのimportを差し替え、旧ファイルを削除**

`src/app/page.tsx` の1行目:

```tsx
// 旧: import HeroCanvasWithCMS from "@/components/three/HeroCanvasWithCMS";
import HeroCanvasSection from "@/components/three/HeroCanvasSection";
```

ファイル内の `<HeroCanvasWithCMS>` / `</HeroCanvasWithCMS>` を `<HeroCanvasSection>` / `</HeroCanvasSection>` に置換。

```bash
git rm src/components/three/HeroCanvasWithCMS.tsx
```

- [ ] **Step 4: 他に旧コンポーネントの参照が残っていないか確認**

Run: `grep -rn "HeroCanvasWithCMS" src`
Expected: ヒットなし

- [ ] **Step 5: lint実行と表示確認**

Run: `pnpm lint`
Expected: エラー0

`http://localhost:3000/` を開く
Expected: 3Dカードが3枚表示され、各カードのリンク先が `/service/issues` `/service` `/works` になっている（`/blog/...`ではない）

- [ ] **Step 6: コミット**

```bash
git add src/components/three/showcase-cards.ts src/components/three/HeroCanvasSection.tsx src/app/page.tsx
git commit -m "refactor(three): 3D回転カードをmicroCMS取得からコード内定数に変更"
```

---

### Task 6: サイトマップ追加・下書きmdのアーカイブ・最終検証

**Files:**
- Modify: `src/app/sitemap.ts:8-21`（staticPagesに3件追加）
- Move: `blog/card-01-oshinayami.md` `blog/card-02-dekiru.md` `blog/card-03-jissai.md` → `blog/archive/`

**Interfaces:**
- Consumes: なし
- Produces: sitemap.xmlに `/service` `/service/issues` `/works` が含まれる

- [ ] **Step 1: sitemap.tsのstaticPagesに3ページを追加**

`src/app/sitemap.ts` の `staticPages` 配列（`/blog`エントリの後）に追加:

```ts
		{
			url: `${SITE_URL}/service`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${SITE_URL}/service/issues`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${SITE_URL}/works`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
```

- [ ] **Step 2: 下書きmdをアーカイブへ移動**

```bash
mkdir -p blog/archive
git mv blog/card-01-oshinayami.md blog/card-02-dekiru.md blog/card-03-jissai.md blog/archive/
```

- [ ] **Step 3: lint・build実行（プッシュ前必須チェック）**

Run: `pnpm lint`
Expected: エラー0

Run: `pnpm build`
Expected: ビルド成功。出力に `/service` `/service/issues` `/works` が静的ページ（○ Static）として並ぶ

- [ ] **Step 4: 最終目視確認**

`pnpm dev` で以下を確認:
1. `/` — 3Dカード3枚のリンク先が新ページ
2. `/service/issues` `/service` `/works` — 表示崩れなし、CTA→`/#contact`が動く
3. `/service` →「実際の取り組みはこちら」→ `/works` が通る

- [ ] **Step 5: コミット**

```bash
git add src/app/sitemap.ts blog/
git commit -m "chore: サイトマップに新3ページを追加し、カード下書きmdをアーカイブ"
```

---

## 完了後の手動作業（ユーザー向けメモ）

- microCMS側にカード3記事の下書きが既にある場合は手動で削除する
- カード画像は既存hero画像を仮アサインしているため、専用画像を用意したら `src/components/three/showcase-cards.ts` の `imageSrc` を差し替える
