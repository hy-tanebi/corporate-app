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
