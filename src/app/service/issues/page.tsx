import type { Metadata } from "next";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { anton, notoSansJp } from "@/components/lp/fonts";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "こんなお悩み、ありませんか | TANEBI CREATIVE",
	description:
		"古いホームページ、属人化したExcel管理、AIの使いどころ。「何とかしたいけど後回しにしている」ことに、一緒に手をつけます。初回相談は無料です。",
};

const issues = [
	{
		tag: "WEB",
		title: "ホームページが古いまま、問い合わせも来ない",
		summary: "サイトはあるのに、そこから問い合わせが来た記憶がない。",
		body: [
			"「とりあえず作ったけど、もう何年も触っていない」「電話番号が古いまま載っている」「スマホで見たらレイアウトが崩れている」――こういうサイトが、実は地元にもたくさんあります。",
			"それって、サイトに問題があるというより、サイトへの入口が設計されていないことが多いです。大改修でなくても、情報の整理と問い合わせ導線を見直すだけで変わることはあります。",
		],
	},
	{
		tag: "EXCEL",
		title: "Excel・紙の管理が属人化していてしんどい",
		summary: "その担当者しか分からない。引き継ぎができない。",
		body: [
			"「毎回同じ転記作業に時間がかかる」。こういう状態が続くと、じわじわと業務の負荷になっていきます。",
			"かといって、大きなシステムを入れるほどの規模でもない。まず手順を聞き取って、必要な部分だけをツール化することを考えます。全部をシステム化する必要はありません。",
		],
	},
	{
		tag: "OPS",
		title: "事務作業・資料作成に時間がかかっている",
		summary: "毎月同じ資料を手で作っている。議事録が地味に大変。",
		body: [
			"繰り返し作業の中には、AIで置き換えられるものと、そうでないものが混在しています。",
			"むやみにAIを入れることはしません。業務を見てから、置き換えた方がいいもの・置き換えない方がいいものを整理します。",
		],
	},
	{
		tag: "AI",
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
				lead={
					"古いホームページのまま何年も経っている。Excel管理が自分にしか分からない状態になっている。AIが気になってはいるけど、何から手をつけていいか分からない。\nそういう「何とかしたいとは思っているけど、後回しにしてしまっている」ことに、一緒に手をつける仕事をしています。"
				}
				pills={[
					{ label: "できることを見る", href: "/service" },
					{ label: "実際の取り組み", href: "/works" },
				]}
			/>

			<LpSection eyebrow="Issues" title="よくあるお悩み">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
					{issues.map((issue) => (
						<div
							key={issue.tag}
							className="rounded-3xl bg-secondary p-7 lg:p-9"
						>
							<p
								className={`${anton.className} text-xs tracking-[0.3em] uppercase text-[#e8590c] mb-3`}
							>
								{issue.tag}
							</p>
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
				<p className="text-base lg:text-lg leading-loose max-w-2xl">
					「何を頼めばいいかまだ分からない」という状態での相談で大丈夫です。まず話を聞いて、何から手をつけると変わりそうかを一緒に整理します。
				</p>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
