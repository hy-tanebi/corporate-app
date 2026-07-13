import {
	FileText,
	MessageCircle,
	RefreshCw,
	SearchCheck,
	Sprout,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { anton, notoSansJp } from "@/components/lp/fonts";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "できること ─ ご相談メニュー | TANEBI CREATIVE",
	description:
		"Webサイト改善の見直し、AI業務改善のミニ相談、小規模業務ツールの開発。どれも「まず話を聞いてから」小さく始められます。初回相談は無料です。",
};

const menus = [
	{
		id: "web",
		en: "Web",
		title: "Webサイト改善の見直し",
		body: [
			"古くなったサイトの情報整理、問い合わせ導線の確認、スマホ表示・ページ速度の確認、GA4の導入状況の確認と改善提案をします。",
			"「どこから手をつければいいか分からない」という状態でも大丈夫です。まず現状を一緒に整理するところから始めます。全ページをリニューアルしなくても、優先度の高い箇所だけを直すことで費用を抑えることもできます。",
		],
		items: [
			"ABテストで問い合わせ・成約につながる導線と文言を検証",
			"問い合わせ導線の確認・改善提案",
			"スマホ表示・ページ速度の確認",
			"GA4の導入・活用状況のチェック",
		],
	},
	{
		id: "ai",
		en: "AI",
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
		id: "tools",
		en: "Tools",
		title: "小規模業務ツールの開発",
		body: [
			"「大きなシステムは不要だけど、Excelや紙での管理をもう少し整理したい」という場合に対応します。認証・管理画面・データ出力のある小さなWebツールを作ります。",
			"複数のSaaSを別々に契約して使い分けている場合は、業務に合わせてカスタマイズしたツールに一元化する開発も行います。ツールの数と月々の費用を、まとめて見直せます。",
			"作って終わりではなく、使い続けられる設計にします。",
		],
		items: [
			"紙・Excel管理の簡易Webツール化",
			"複数SaaS契約の整理・ツール一元化",
			"管理画面・CSV出力・担当者別の権限設定",
			"既存業務を止めずに少しずつ移行",
		],
	},
];

const steps = [
	{
		number: "1",
		icon: MessageCircle,
		title: "まず話を聞く",
		description:
			"現状の困りごとをそのまま伺います。資料の準備は不要です。初回の相談は無料です。",
	},
	{
		number: "2",
		icon: SearchCheck,
		title: "現状の整理",
		description:
			"業務やサイトを一緒に見ながら、何から手をつけると変わりそうかを整理します。",
	},
	{
		number: "3",
		icon: FileText,
		title: "提案・お見積もり",
		description:
			"必要な分だけの内容と費用を提案します。ここまでは費用がかかりません。",
	},
	{
		number: "4",
		icon: Sprout,
		title: "小さく着手",
		description:
			"優先度の高いところから小さく始めます。既存の業務を止めずに進めます。",
	},
	{
		number: "5",
		icon: RefreshCw,
		title: "使いながら調整",
		description:
			"使ってみて分かったことをもとに、必要なものだけを足していきます。",
	},
];

export default function ServicePage() {
	return (
		<div className={`${notoSansJp.className} container mx-auto max-w-5xl px-4`}>
			<PageHero
				label="What we can do"
				english="Service"
				title="できること ─ ご相談メニュー"
				lead={
					"Web改善の見直し、AI業務改善の整理、小さな業務ツールづくり。\nどれも「まず話を聞いてから」始めます。小さく始められます。"
				}
				pills={[
					{ label: "Webサイト改善", href: "#web" },
					{ label: "AI業務改善", href: "#ai" },
					{ label: "業務ツール開発", href: "#tools" },
				]}
			/>

			<LpSection eyebrow="Menu" title="ご相談できること">
				<p className="mx-auto text-center text-base lg:text-lg leading-loose max-w-2xl mb-14 lg:mb-20">
					TANEBI
					CREATIVEで対応していることを、3つのメニューとして整理しました。いずれも「決めてから依頼する」ではなく、「まず話してみる」から始められます。
				</p>
				<div className="space-y-16 lg:space-y-24">
					{menus.map((menu) => (
						<div key={menu.id} id={menu.id} className="scroll-mt-8">
							<p
								className={`${anton.className} text-5xl lg:text-7xl leading-none uppercase tracking-[0.04em] text-foreground/10 mb-3`}
							>
								{menu.en}
							</p>
							<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12">
								<div>
									<h3 className="text-2xl lg:text-3xl font-black mb-5">
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
								<div className="self-start lg:pt-1">
									<p className="text-xs font-bold tracking-widest text-muted-foreground mb-3">
										例えばこんなこと
									</p>
									<ul>
										{menu.items.map((item) => (
											<li
												key={item}
												className="flex gap-3 py-3 border-t border-border text-sm leading-relaxed"
											>
												<span aria-hidden className="text-[#e8590c]">
													—
												</span>
												{item}
											</li>
										))}
									</ul>
									<p className="mt-4 text-xs leading-relaxed text-muted-foreground">
										その他、課題に感じていることがありましたら、
										<br />
										<Link
											href="/#contact"
											className="font-bold text-foreground underline underline-offset-4 hover:text-[#e8590c] transition-colors"
										>
											お気軽にご相談ください
										</Link>
										。
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
				<p className="mt-14 text-sm lg:text-base text-muted-foreground">
					自社でも同じ進め方でツールを作り、毎日使っています。{" "}
					<Link
						href="/works"
						className="group inline-flex items-center gap-2 rounded-full border border-foreground px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-foreground hover:text-background ml-1"
					>
						実際の取り組みはこちら
						<span
							aria-hidden
							className="transition-transform group-hover:translate-x-0.5"
						>
							→
						</span>
					</Link>
				</p>
			</LpSection>

			<LpSection eyebrow="Flow" title="ご相談の流れ">
				<p className="mx-auto text-center text-base lg:text-lg leading-loose max-w-2xl mb-10 lg:mb-14">
					どのメニューも、進め方は同じです。全部揃ってから始めなくて大丈夫です。
				</p>
				<ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 lg:gap-5">
					{steps.map((step) => (
						<li
							key={step.number}
							className="flex flex-col items-center text-center rounded-2xl border border-border bg-background p-6 lg:p-7 transition-shadow hover:shadow-md"
						>
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary mb-5">
								<step.icon
									className="h-6 w-6"
									strokeWidth={1.5}
									aria-hidden
								/>
							</div>
							<p
								className={`${anton.className} text-xs tracking-[0.25em] uppercase text-[#e8590c] mb-1.5`}
							>
								Step {step.number}
							</p>
							<h3 className="text-base lg:text-lg font-black mb-2">
								{step.title}
							</h3>
							<p className="text-xs lg:text-sm leading-relaxed text-muted-foreground">
								{step.description}
							</p>
						</li>
					))}
				</ol>
			</LpSection>

			<LpSection eyebrow="Price" title="価格について">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<p className="text-base lg:text-lg leading-loose">
						初回の相談は無料です。正式な費用は業務の内容をお聞きしてから提案します。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						小さな相談・小さなツールには小さな価格で対応しています（数万円からが目安です）。大手企業向けの価格設定ではなく、地元の小さな事業者に合わせた相談をしています。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						「高いものを勧めるつもりはありません。今あるものを活かして、必要な分だけ整理します。」
					</p>
				</div>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
