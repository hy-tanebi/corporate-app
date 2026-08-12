import {
	FileText,
	MessageCircle,
	RefreshCw,
	SearchCheck,
	Sprout,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { anton, notoSansJp } from "@/components/lp/fonts";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "できること ─ ご相談メニュー | TANEBI CREATIVE",
	description:
		"問い合わせを取りこぼさないWebサイトの制作・改善、AI活用の相談、業務ツールの開発。受け取ったあとの社内の流れまで含めて設計します。どれも「まず話を聞いてから」始められます。初回相談は無料です。",
};

type Menu = {
	id: string;
	en: string;
	title: string;
	body: string[];
	items: string[];
	/** 他メニューへの案内。リンクを含むため本文とは別枠で扱う */
	crossRef?: ReactNode;
};

const menus: Menu[] = [
	{
		id: "web",
		en: "Web",
		title: "Webサイトの制作・改善",
		body: [
			"問い合わせが来ないとき、原因は見た目より前にあります。情報が多すぎて肝心なことが埋もれている、知りたいことが書いていない、問い合わせ先が見つからない。人はそこで黙って離れていきます。",
			"情報とゴールへの導線を切り分けて、より目的につながる設計を提案します。",
			"サイトを見ている方に対し、こちらから声をかけたり、その場で疑問に答えたりする仕掛けについてもご提案します。Webサイトを最大限に活かし、見る方の困りごとや目的に寄り添いながら、利益につながる制作を行います。",
		],
		items: [
			"問い合わせを受けたあとの通知・記録・管理までの仕組みづくり",
			"新しいサイトの制作（構成の整理からデザイン・公開まで）",
			"ABテストで問い合わせ・成約につながる導線と文言を検証",
			"ECサイトの制作・カートでの離脱の見直し",
			"予約・会員ページなどのアプリ制作（スマートフォンアプリも対応）",
			"期間を区切った企画やキャンペーンのページ制作・公開後の運用",
			"よくある質問にその場で答えるチャットボットの設置",
		],
		crossRef: (
			<>
				問い合わせを受けたあとの管理や、社内で使うツールそのものは、
				<Link
					href="#tools"
					className="font-bold text-foreground underline underline-offset-4 hover:text-[#e8590c] transition-colors"
				>
					業務ツールの開発
				</Link>
				でも触れています。
			</>
		),
	},
	{
		id: "ai",
		en: "AI",
		title: "AI活用の相談",
		body: [
			"AIの使い道は、作業を自動化することだけではありません。事業の進め方を考えるときの相談相手にもなりますし、頭の中にある段取りを整理する道具にもなります。まずは業務を聞き取って、AIが向いていること・向いていないことを一緒に見極めます。",
			"「Claude CodeやCodexのようなAIツールを使って、開発や事務作業を効率化してみたい。でも周りに詳しい人がいない」という場合もご相談ください。何にどう使えるかを、実際の業務内容を見ながら一緒に考えます。",
			"いきなりシステムを入れるのではなく、まず現状の業務を整理することから始めます。そのうえで、小さく試せるところがあれば一緒に試します。",
		],
		items: [
			"新しいサービスや事業の進め方を、AIを相手に壁打ちしながら形にしていく",
			"頭の中にしかない段取りや判断の基準を言葉にして、人が変わっても回る仕組みにする",
			"社内のマニュアルや過去の問い合わせをAIに読ませて、質問に答える仕組みをつくる",
			"Claude Code・Codexを使った開発・事務作業の効率化",
			"毎回手で書いている書類（見積書・報告書・議事録）の下書きを自動化",
			"社内でAIを使うときのルールづくり（入力してよい情報・だめな情報の線引き）",
		],
	},
	{
		id: "tools",
		en: "Tools",
		title: "業務ツールの開発",
		body: [
			"「この作業に時間がかかっている」「この管理を何とかしたい」という課題に合わせて、社内で使うツールやアプリを開発します。認証・管理画面・データ出力など、必要な機能を業務に沿って組み立てます。",
			"複数のSaaSを別々に契約して使い分けている場合は、まず現状を整理したうえで、業務に合わせたツールに一元化する開発を行います。ツールの数と月々にかかっている費用を、まとめて見直せます。",
			"作って終わりではなく、使い続けられる設計にします。",
		],
		items: [
			"業務の課題に合わせたツールの設計・開発",
			"複数SaaS契約の整理・一元化による月々の費用の見直し",
			"管理画面・CSV出力・担当者別の権限設定",
			"既存業務を止めずに段階的に移行",
		],
		crossRef: (
			<>
				お客さま向けの予約・会員などのアプリは、
				<Link
					href="#web"
					className="font-bold text-foreground underline underline-offset-4 hover:text-[#e8590c] transition-colors"
				>
					Webサイトの制作・改善
				</Link>
				で対応しています。
			</>
		),
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
				visual={{
					src: "/images/service_fv.jpeg",
					alt: "手元の道具やアイデアを見せ合いながら、業務の進め方を話し合っている人たちのイラスト",
					width: 1024,
					height: 1024,
				}}
				lead={
					"Webサイトの制作・改善、AI活用の相談、業務ツールの開発。\nどれも「まず話を聞いてから」始めます。"
				}
				pills={[
					{ label: "Webサイト制作・改善", href: "#web" },
					{ label: "AI活用", href: "#ai" },
					{ label: "業務ツール開発", href: "#tools" },
				]}
			/>

			<LpSection eyebrow="Menu" title="ご相談できること">
				<p className="mx-auto text-left text-base lg:text-lg leading-loose max-w-2xl mb-14 lg:mb-20">
					TANEBI
					CREATIVEで対応していることを、3つのメニューとして整理しました。いずれも「決めてから依頼する」ではなく、「まず話してみる」から始められます。
				</p>
				<div className="space-y-16 lg:space-y-24">
					{menus.map((menu) => (
						<div key={menu.id} id={menu.id} className="scroll-mt-8">
							<p
								className={`${anton.className} font-bold text-5xl lg:text-7xl leading-none uppercase tracking-[0.04em] text-foreground/10 mb-3`}
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
									{menu.crossRef && (
										<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
											{menu.crossRef}
										</p>
									)}
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
					企業さまの現場では、ツールをつくって終わりではなく、導入から運用、業務の進め方の見直しまで一緒に進めています。自分の開発でもAIツールを日常的に使っていますし、自社の業務も自作ツールに置き換えて、今も毎日使っています。
				</p>
			</LpSection>

			<LpSection eyebrow="Flow" title="ご相談の流れ">
				<p className="mx-auto text-left text-base lg:text-lg leading-loose max-w-2xl mb-10 lg:mb-14">
					どのメニューも、進め方は同じです。全部揃ってから始めなくて大丈夫です。
				</p>
				<ol className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 lg:gap-5">
					{steps.map((step, index) => (
						<li
							key={step.number}
							className="relative flex flex-col items-center text-center"
						>
							{index < steps.length - 1 && (
								<span
									aria-hidden
									className="hidden md:block absolute top-7 left-[calc(50%+1.75rem)] w-[calc(100%-3.5rem)] border-t-2 border-dashed border-border"
								/>
							)}
							<div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-background">
								<step.icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
							</div>
							<div className="mt-4 w-full flex-1 rounded-2xl border border-border bg-background p-5 lg:p-6 transition-shadow hover:shadow-md">
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
							</div>
						</li>
					))}
				</ol>
			</LpSection>

			<LpSection eyebrow="Plans" title="ご契約について">
				<div className="mx-auto max-w-2xl space-y-4 text-left">
					<p className="text-base lg:text-lg leading-loose">
						初回の相談は無料です。費用は業務の内容をお聞きしてから提案します。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						お付き合いの形は一つではありません。1つのプロジェクトとして区切って対応することもできますし、社内で回せるようになるまで伴走する月額プランでの対応も行っています。どの形が合いそうかも含めて、相談しながら決められます。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						今あるものを活かして、必要な分だけ整理します。
					</p>
				</div>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
