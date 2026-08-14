import {
	Bot,
	Globe,
	Inbox,
	ListChecks,
	RefreshCw,
	SearchCheck,
	ShoppingCart,
	Sprout,
	Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { anton, notoSansJp } from "@/components/lp/fonts";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title: "その課題、ここから伸ばせます | TANEBI CREATIVE",
	description:
		"ホームページを作って終わりにしない改善、ネット販売の立て直し、社内業務のツール化、増えすぎたツール費用の見直し、社内でAIを使える状態にすること。「こうしたい」から一緒に進めます。初回相談は無料です。",
	// 事業ポジショニングの見直しに伴いコピーを刷新中のため、確定するまで検索エンジンには載せない。
	// パフォーマンス改善を先に本番へ出すための一時措置。
	// 正式公開時にこの robots を削除し、sitemap.ts と showcase-cards.ts のリンクも戻すこと。
	robots: { index: false, follow: false },
};

/** menuLabel / menuHref は /service の該当メニューへの送り先。見出しの文言も向こうに揃える */
const issues = [
	{
		tag: "WEB",
		icon: Globe,
		title: "ホームページを、掲示板で終わらせない",
		summary: "情報は載っているが、そこから仕事につながっていない。",
		body: [
			"ホームページに会社の情報を並べただけでは、掲示板と同じです。見に来た人は、次に何をすればいいか分からないまま帰っていきます。",
			"SNSやLINEなど、お客さまとの接点は増える一方です。ただ、そこに流した情報は後から探せません。ホームページに集めておけば、知りたいことがすぐ見つかり、声をかけてもらいやすくなります。",
			"サイトと社内の仕組みを、分けて考えません。入口から次の連絡までを一続きにして、利益につながる形にします。",
		],
		menuLabel: "Webサイトの制作・改善",
		menuHref: "/service#web",
	},
	{
		tag: "EC",
		icon: ShoppingCart,
		title: "ネットでの販売を、もう一段伸ばしたい",
		summary: "これから始めたい。あるいは、始めたけれど伸びていない。",
		body: [
			"ネット販売は、始めるときにつまずくところと、続けてからつまずくところが違います。どちらの段階にいるかで、手をつける場所が変わります。",
			"これから始める場合は、既存のサービスを使って早く出す形と、自社に合わせてつくり込む形があります。扱う商品数や送料・決済の条件で向き不向きが変わるので、そこを伺ってから合う方を選びます。",
			"すでに運営している場合は、買う手前で止まっている箇所を見るところから入れます。カートまで進んで買われずに終わっているなら、伸ばせる余地がそこに残っています。",
		],
		menuLabel: "Webサイトの制作・改善",
		menuHref: "/service#web",
	},
	{
		tag: "TOOL",
		icon: ListChecks,
		title: "社内の困りごとを洗い出して、ツールで解決したい",
		summary: "手間がかかっているのは分かるが、どこから直せばいいか分からない。",
		body: [
			"「その担当者しか分からない」「毎回同じ転記に時間がかかる」「紙とExcelを行ったり来たりしている」。ひとつずつは小さくても、積み上がると人の時間を奪い続けます。",
			"まず業務の流れを一緒に見て、どこに時間が消えているかを洗い出します。手を動かす前に、この工程を必ず挟みます。",
			"そのうえで、必要な部分だけをツールに置き換えます。全部をシステム化する必要はありません。今の業務を止めずに、動くところから順に移していきます。",
		],
		menuLabel: "業務ツールの開発",
		menuHref: "/service#tools",
	},
	{
		tag: "COST",
		icon: Wallet,
		title: "増えすぎたツールの費用を、見直したい",
		summary: "何のために契約したのか分からないサービスがある。",
		body: [
			"「担当者ごとに別々のサービスを契約している」「使っていないのに毎月引き落とされている」。少しずつ増えたものは、全体でいくらかかっているかが見えにくくなります。",
			"まず契約しているものを一覧にして、業務のどこで何を使っているかを整理します。そのうえで、まとめられるものは業務に合わせたツールに一元化します。",
			"すべてをつくり直すという話ではありません。解約するだけで済むものもあります。",
		],
		menuLabel: "業務ツールの開発",
		menuHref: "/service#tools",
	},
	{
		tag: "INBOX",
		icon: Inbox,
		title: "問い合わせの窓口がバラバラで、把握しきれていない",
		summary: "電話もメールもSNSも、それぞれの担当者のところで止まっている。",
		body: [
			"サイトのフォーム、代表メール、担当者の携帯、SNSのメッセージ、紹介の電話。入口が増えるほど、全体で何件来ていて、どれが未対応なのかが誰にも見えなくなります。取りこぼしは、たいていこの見えないところで起きています。",
			"まず、どこから何が来ているかを洗い出して、受け皿を一つにまとめます。窓口そのものを閉じる必要はありません。お客さまから見た入口は残したまま、入ってきたものが社内の1か所に集まる形にします。",
			"集まれば、誰が担当していて、どこまで返したかが見えます。記録が残るので、どの入口が実際に仕事につながっているかも分かるようになります。",
		],
		menuLabel: "業務ツールの開発",
		menuHref: "/service#tools",
	},
	{
		tag: "AI",
		icon: Bot,
		title: "AIを、社内で使える状態にしたい",
		summary: "触ってはいるが、業務で使えてはいない。",
		body: [
			"AIを入れること自体が目的になると、うまくいきません。まず業務を伺って、AIが向いていること・向いていないことを分けます。置き換えない方がいいものは、そう申し上げます。",
			"自動化だけが使い道ではありません。事業の進め方を考えるときの相談相手にもなりますし、頭の中にしかない段取りを言葉にして、人が変わっても回る形にする道具にもなります。",
			"道具を配っただけでは定着しません。「便利らしい」で終わってしまうのは、自分の仕事のどこで使えるのかが結びついていないからです。実際の業務を題材にして、どの作業にどう使うかを一緒に決め、使い方が分かる人を社内に増やすところまでをお手伝いします。",
			"あわせて、入力してよい情報とだめな情報の線引きなど、社内で使うときのルールも整理します。安心して使える状態にしてから広げた方が、結局は早く進みます。",
		],
		menuLabel: "AI活用の相談",
		menuHref: "/service#ai",
	},
];

/** カードの後ろに置く「進め方」。/service の STEP と同じアイコンを使い、系統を揃える */
const approaches = [
	{
		icon: SearchCheck,
		title: "いきなり作りません",
		description:
			"まず現状を見て、何から手をつけると変わりそうかを一緒に整理します。ここまでは費用がかかりません。",
	},
	{
		icon: Sprout,
		title: "全部を一度に変えません",
		description:
			"効きそうなところから小さく始めます。今動いている業務は止めずに進めます。",
	},
	{
		icon: RefreshCw,
		title: "渡して終わりにしません",
		description:
			"使ってみて分かったことをもとに調整します。社内で回せるようになるまで伴走する月額プランもあります。",
	},
];

export default function ServiceIssuesPage() {
	return (
		<div className={`${notoSansJp.className} container mx-auto max-w-5xl px-4`}>
			<PageHero
				label="From issue to growth"
				english="Issues"
				title="その課題、ここから伸ばせます"
				visual={{
					src: "/images/service_issue_fv.png",
					alt: "書類の山や絡まった糸を抱え、疑問や不安を頭に浮かべながら立っている人たちのイラスト",
					width: 1265,
					height: 1244,
				}}
				lead={
					"ホームページを作ったきりになっている。ネットでの販売が伸びていない。社内の手間をツールで減らしたい。増えたツールの費用を見直したい。社内でAIを使えるようにしたい。\nどれも「困っている」で止めずに、伸ばせるところまで一緒に進めます。"
				}
				pills={[{ label: "できることを見る", href: "/service" }]}
			/>

			<LpSection eyebrow="Issues" title="こうしたい、に応えます">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
					{issues.map((issue) => (
						<div
							key={issue.tag}
							className="flex flex-col rounded-3xl bg-secondary p-7 lg:p-9"
						>
							{/* flex-1 でリンクを下端に押し出し、高さの違うカードでも導線の位置を揃える */}
							<div className="flex-1">
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
							<p className="mt-6 pt-5 border-t border-border text-sm">
								<Link
									href={issue.menuHref}
									className="font-bold text-foreground underline underline-offset-4 hover:text-[#e8590c] transition-colors"
								>
									{issue.menuLabel}
								</Link>
								を見る
							</p>
						</div>
					))}
				</div>
			</LpSection>

			<LpSection eyebrow="Approach" title="進め方について">
				<p className="mx-auto text-left text-base lg:text-lg leading-loose max-w-2xl mb-10 lg:mb-14">
					「何を頼めばいいかまだ分からない」という状態での相談で大丈夫です。どのご相談でも、進め方は変わりません。
				</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
					{approaches.map((approach) => (
						<div
							key={approach.title}
							className="rounded-2xl border border-border bg-background p-6 lg:p-7"
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-background mb-4">
								<approach.icon
									className="h-5 w-5"
									strokeWidth={1.5}
									aria-hidden
								/>
							</div>
							<h3 className="text-base lg:text-lg font-black mb-2">
								{approach.title}
							</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{approach.description}
							</p>
						</div>
					))}
				</div>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
