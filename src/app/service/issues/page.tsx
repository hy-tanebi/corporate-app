import { Bot, Clock, FileSpreadsheet, Globe } from "lucide-react";
import type { Metadata } from "next";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { anton, notoSansJp } from "@/components/lp/fonts";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "こんなお悩み、ありませんか | TANEBI CREATIVE",
	description:
		"サイトが古い・まだない、属人化したExcel管理、AIの使いどころ。「何とかしたいけど後回しにしている」ことに、一緒に手をつけます。初回相談は無料です。",
};

const issues = [
	{
		tag: "WEB",
		icon: Globe,
		title: "ホームページが古いまま、もしくはまだない",
		summary: "サイトから問い合わせが来た記憶がない。そもそもサイトがない。",
		body: [
			"「とりあえず作ったけど、もう何年も触っていない」「電話番号が古いまま載っている」「スマホで見たらレイアウトが崩れている」――こういうサイトが、実は地元にもたくさんあります。名刺やチラシはあるけれど、サイトはまだつくっていない、という場合も同じくらいよく伺います。",
			"すでにある場合は、情報の整理と問い合わせ導線を見直すだけで変わることがあります。全ページをつくり直す必要はありません。これからつくる場合も、何を載せるかの整理から一緒に進めます。どちらも「まず現状を見る」ところから始めます。",
		],
	},
	{
		tag: "EXCEL",
		icon: FileSpreadsheet,
		title: "Excel・紙の管理が属人化していてしんどい",
		summary: "その担当者しか分からない。引き継ぎができない。",
		body: [
			"「毎回同じ転記作業に時間がかかる」。こういう状態が続くと、じわじわと業務の負荷になっていきます。",
			"かといって、大きなシステムを入れるほどの規模でもない。まず手順を聞き取って、必要な部分だけをツール化することを考えます。全部をシステム化する必要はありません。",
		],
	},
	{
		tag: "OPS",
		icon: Clock,
		title: "事務作業・資料作成に時間がかかっている",
		summary: "毎月同じ資料を手で作っている。議事録が地味に大変。",
		body: [
			"繰り返し作業の中には、AIで置き換えられるものと、そうでないものが混在しています。",
			"むやみにAIを入れることはしません。業務を見てから、置き換えた方がいいもの・置き換えない方がいいものを整理します。",
		],
	},
	{
		tag: "AI",
		icon: Bot,
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
		<div className={`${notoSansJp.className} container mx-auto max-w-5xl px-4`}>
			<PageHero
				label="Find your first step"
				english="Issues"
				title="こんなお悩み、ありませんか"
				visual={{
					src: "/images/service_issue_fv.png",
					alt: "書類の山や絡まった糸を抱え、疑問や不安を頭に浮かべながら立っている人たちのイラスト",
					width: 1265,
					height: 1244,
				}}
				lead={
					"古いホームページのまま何年も経っている。あるいは、まだサイトをつくっていない。Excel管理が自分にしか分からない状態になっている。AIが気になってはいるけど、何から手をつけていいか分からない。\nそういう「何とかしたいとは思っているけど、後回しにしてしまっている」ことに、一緒に手をつける仕事をしています。"
				}
				pills={[{ label: "できることを見る", href: "/service" }]}
			/>

			<LpSection eyebrow="Issues" title="よくあるお悩み">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
					{issues.map((issue) => (
						<div
							key={issue.tag}
							className="rounded-3xl bg-secondary p-7 lg:p-9"
						>
							<div className="flex items-center gap-3 mb-4">
								<div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-background">
									<issue.icon
										className="h-5 w-5"
										strokeWidth={1.5}
										aria-hidden
									/>
								</div>
								<p
									className={`${anton.className} text-xs tracking-[0.3em] uppercase text-[#e8590c]`}
								>
									{issue.tag}
								</p>
							</div>
							<h3 className="text-lg lg:text-xl font-black leading-snug mb-2">
								{issue.title}
							</h3>
							<p className="text-sm font-bold text-muted-foreground mb-5">
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

			<LpSection eyebrow="Start small" title="小さく相談できます">
				<p className="mx-auto text-left text-base lg:text-lg leading-loose max-w-2xl">
					「何を頼めばいいかまだ分からない」という状態での相談で大丈夫です。まず話を聞いて、何から手をつけると変わりそうかを一緒に整理します。
				</p>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
