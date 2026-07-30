import type { Metadata } from "next";
import { CtaBlock } from "@/components/lp/CtaBlock";
import { notoSansJp } from "@/components/lp/fonts";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";

export const metadata: Metadata = {
	title:
		"実際の取り組み ─ 自社の業務を、自作ツールで改善した話 | TANEBI CREATIVE",
	description:
		"待機確認の業務を自作のWebツールに置き換え、今も毎日使っています。何に困り、何を整理し、どう作ったか。小さく作って使いながら育てる進め方を紹介します。",
	// ページ再設計中のため検索エンジンには載せない（再公開時にこの robots を削除する）
	robots: { index: false, follow: false },
};

export default function WorksPage() {
	return (
		<div className={`${notoSansJp.className} container mx-auto max-w-5xl px-4`}>
			<PageHero
				label="Small start, real use"
				english="Works"
				title="実際の取り組み"
				lead={
					"自社の業務を、自作ツールで改善した話です。待機確認の業務を自作のWebツールに置き換え、今も毎日使っています。\n何に困り、何を整理し、どう作ったか。順番にお見せします。"
				}
				pills={[
					{ label: "できることを見る", href: "/service" },
					{ label: "お悩みから探す", href: "/service/issues" },
				]}
			/>

			<LpSection eyebrow="Story 01" title="何に困っていたか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-loose">
						以前は、特定の業務における「誰が今どの状態にいるか」の管理を、LINEグループや口頭・メモで対応していました。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						少人数のやり取りなので最初は問題なかったのですが、件数や状況のパターンが増えてくると、こういう問題が出てきました。
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-loose marker:text-[#e8590c]">
						<li>最新の状態が分からず、確認のための連絡が増える</li>
						<li>確認のタイミングがバラバラになる</li>
						<li>過去の記録を振り返りたいときに情報が散らばっている</li>
					</ul>
					<p className="text-base lg:text-lg leading-loose">
						「ちゃんとしたシステムを導入するほどの規模でもない。でも、今のやり方はしんどい」という状態でした。
					</p>
				</div>
			</LpSection>

			<LpSection eyebrow="Story 02" title="何を整理したか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-loose">
						まず、この業務の中で「何が分かっていれば判断できるか」を整理しました。必要だったのはシンプルで、
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-loose marker:text-[#e8590c]">
						<li>今、誰がどの状態にいるか（一覧で見える）</li>
						<li>状態が変わったときに記録が残る</li>
						<li>過去の履歴をすぐ確認できる</li>
					</ul>
					<p className="text-base lg:text-lg leading-loose">この3点でした。</p>
					<p className="text-base lg:text-lg leading-loose">
						他にも「あったら便利かも」と思う機能はいくつかありましたが、最初のバージョンには入れませんでした。使ってみてから必要だと分かったものを足す、という順番にしました。
					</p>
				</div>
			</LpSection>

			<LpSection eyebrow="Story 03" title="どう作ったか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-loose">
						Next.js（Webフレームワーク）＋
						Supabase（データベース）で、小さな管理画面を作りました。
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-loose marker:text-[#e8590c]">
						<li>ログイン機能（使う人を限定する）</li>
						<li>一覧画面（誰が今どの状態か、ひと目で分かる）</li>
						<li>更新画面（状態を変えたときに記録が残る）</li>
						<li>履歴画面（過去のやり取りをさかのぼれる）</li>
					</ul>
					<p className="text-base lg:text-lg leading-loose">
						開発期間は、設計から動くものができるまで数日程度。大きなシステムではないので、短期間で形にできました。
					</p>
				</div>
			</LpSection>

			<LpSection eyebrow="Story 04" title="結果、何が楽になったか">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-loose">
						「今どういう状態か」を確認するための連絡が、ほぼゼロになりました。画面を開けば分かるので、わざわざ聞かなくていいです。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						記録も自動的に残るので、「あのときどうだったっけ」を振り返るときもすぐ確認できます。当初想定していた「ここが楽になる」は、だいたい想定通りでした。
					</p>
				</div>
			</LpSection>

			<LpSection eyebrow="Story 05" title="まだ残っている課題">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-loose">
						正直に書いておきます。
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-loose marker:text-[#e8590c]">
						<li>スマホからの操作性は、まだ洗練されていない部分がある</li>
						<li>通知機能（状態が変わったときに知らせる仕組み）は未実装</li>
						<li>データのエクスポート機能は後回しにしていて、今もない</li>
					</ul>
					<p className="text-base lg:text-lg leading-loose">
						「ないと困る機能」は初期バージョンで揃えましたが、「あったら便利な機能」はまだ手をつけていません。毎日使えているので、今は十分という判断で止めています。必要になったら足します。
					</p>
				</div>
			</LpSection>

			<LpSection
				eyebrow="Stance"
				title="この経験から、依頼を受けるときに意識していること"
			>
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-loose">
						自社で作って使い続けているものがある、というのは、「言うだけ」とは違う自信になっています。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						業務ツールを作るとき、よく起きるのが「要件を詰めすぎて最初のバージョンが大きくなり、完成する前に止まる」というパターンです。自分で経験したので、最初は小さく・使いながら育てる、という順番を強く意識しています。
					</p>
					<p className="text-base lg:text-lg leading-loose">
						「全部揃ってから始めなくていい」「使ってみてから調整すればいい」という進め方を、依頼を受ける仕事でも大事にしています。
					</p>
				</div>
			</LpSection>

			<LpSection eyebrow="Now" title="開発中の取り組み">
				<div className="max-w-2xl space-y-4">
					<p className="text-base lg:text-lg leading-loose">
						現在、他にも2つ取り組んでいます。まだ開発中で、完成時期は未定です。
					</p>
					<ul className="space-y-2 pl-5 list-disc text-base lg:text-lg leading-loose marker:text-[#e8590c]">
						<li>
							<strong>AI問い合わせ導線パッケージ</strong>:
							説明が複雑な事業者向けに、問い合わせ前の「整理と案内」をAIで対応する仕組み（商談対応中）
						</li>
						<li>
							<strong>地域向けWeb相談ナビ</strong>:
							自治体と連携した、困りごとの相談先を案内するアプリ（開発中）
						</li>
					</ul>
					<p className="text-base lg:text-lg leading-loose">
						いずれも、自分が関わっている現場の課題から出発しています。「こういうの、うちでもできるかな」と思った方、気軽に話しかけてください。
					</p>
				</div>
			</LpSection>

			<CtaBlock />
		</div>
	);
}
