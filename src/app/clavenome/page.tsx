import type { Metadata } from "next";
import { notoSansJp } from "@/components/lp/fonts";
import { HashJumpLink } from "@/components/lp/hash-jump-link";
import { LpSection } from "@/components/lp/LpSection";
import { PageHero } from "@/components/lp/PageHero";
import { buildPageSocialMetadata, SITE_CONFIG } from "@/lib/seo";
import { JaText } from "./components/ja-text";

// iOS アプリ Clavenome のサポート・プライバシーポリシーページ。
// App Store Connect の「サポート URL」「プライバシーポリシー URL」に登録する。
//
// 文面の原本: Claves/docs/site/index.html（アプリ側リポジトリ）。
// 見出し・箇条書き・リンクは原本から変えないこと。
//
// このページには解析タグ・外部リソースを載せない（アプリが「通信ゼロ・収集ゼロ」を掲げているため）。
// GTM は src/components/GTMScript.tsx で /clavenome を除外している。

// 問い合わせ先は専用メールを持たず、サイト共通のお問い合わせフォーム（/#contact）に一本化する。
// /#contact へのリンクは HashJumpLink（doc/progress.md「実装時に必ず守ること」）。
const CONTACT_HREF = "/#contact";

/** 公開日に合わせる。文面を変えたときはここも更新する */
const LAST_UPDATED = "2026-09-15";

const APPLE_PURCHASE_HISTORY_JA = "https://support.apple.com/ja-jp/HT204084";
const APPLE_PURCHASE_HISTORY_EN = "https://support.apple.com/en-us/HT204084";

const CLAVENOME_DESCRIPTION =
	"iOS アプリ Clavenome（アフロリズムに特化した練習用メトロノーム）のサポート窓口とプライバシーポリシー。利用者に関する情報を一切収集しません。";

export const metadata: Metadata = {
	// 屋号は seo.ts の title.template が付けるのでここには書かない
	title: "Clavenome ─ サポート・プライバシーポリシー",
	alternates: { canonical: `${SITE_CONFIG.url}/clavenome` },
	description: CLAVENOME_DESCRIPTION,
	...buildPageSocialMetadata({
		title: "Clavenome ─ Support & Privacy Policy | TANEBI CREATIVE",
		description: CLAVENOME_DESCRIPTION,
		path: "/clavenome",
	}),
};

// JaText でゼロ幅スペースを入れた文節の切れ目だけで折り返す。
// 文節1つが行幅を超える場合（極端に狭い画面）だけ overflow-wrap で逃がす。
const jaBlock =
	"max-w-2xl space-y-4 [word-break:keep-all] [overflow-wrap:anywhere]";
const bodyText = "text-base lg:text-lg leading-loose";
const bulletList = `space-y-2 pl-5 list-disc ${bodyText} marker:text-[#e8590c]`;
const subHeading = "mt-10 mb-3 text-lg lg:text-xl font-bold";
const externalLink = "underline underline-offset-4 hover:text-[#e8590c]";

export default function ClavenomePage() {
	return (
		<div className={`${notoSansJp.className} container mx-auto max-w-5xl px-4`}>
			<PageHero
				label="Support & Privacy"
				english="Clavenome"
				title="アフロリズムに特化した練習用メトロノーム"
				lead="A practice metronome for Afro rhythm patterns"
				pills={[
					{ label: "サポート", href: "#support" },
					{ label: "プライバシーポリシー", href: "#privacy" },
					{ label: "English", href: "#support-en" },
				]}
				visual={{
					src: "/images/icon-1024.png",
					alt: "Clavenome のアプリアイコン",
					width: 1024,
					height: 1024,
				}}
			/>

			<LpSection id="support" eyebrow="Support" title="サポート">
				<div className={jaBlock}>
					<p className={bodyText}>
						<JaText>
							不具合の報告や質問は、下記のお問い合わせフォームからお送りください。
						</JaText>
					</p>
					<ul className={bulletList}>
						<li>
							お問い合わせ:{" "}
							<HashJumpLink href={CONTACT_HREF} className={externalLink}>
								お問い合わせフォーム
							</HashJumpLink>
						</li>
						<li>
							<JaText>
								お使いの iPhone の機種と iOS
								のバージョンを添えていただけると助かります
							</JaText>
						</li>
					</ul>
				</div>
			</LpSection>

			<LpSection id="privacy" eyebrow="Privacy" title="プライバシーポリシー">
				<div className={jaBlock}>
					<p className={bodyText}>
						<strong>
							<JaText>
								Clavenome は、利用者に関する情報を一切収集しません。
							</JaText>
						</strong>
					</p>
					<ul className={bulletList}>
						<li>
							<JaText>アカウント登録はありません</JaText>
						</li>
						<li>
							<JaText>
								インターネット通信を行いません。アプリはオフラインで完結します
							</JaText>
						</li>
						<li>
							<JaText>
								アクセス解析・広告・トラッキングの仕組みを組み込んでいません
							</JaText>
						</li>
						<li>
							<JaText>
								端末に保存するのは「最後に選んだリズム」と「音色」の設定だけで、外部には送信されません。アプリを削除すると消えます
							</JaText>
						</li>
					</ul>

					<h3 className={subHeading}>アプリ内購入について</h3>
					<p className={bodyText}>
						<JaText>
							アプリ内購入がある場合、決済はすべて Apple が処理します。Clavenome
							は氏名・住所・支払い情報を受け取りません。購入の履歴や返金は Apple
							の
						</JaText>{" "}
						<a
							href={APPLE_PURCHASE_HISTORY_JA}
							className={externalLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							「購入履歴を確認する」
						</a>
						<JaText>から確認できます。</JaText>
					</p>

					<h3 className={subHeading}>このポリシーの変更</h3>
					<p className={bodyText}>
						<JaText>
							収集する情報が変わる場合は、このページを更新し、アプリの更新履歴に記載します。
						</JaText>
					</p>

					<p className="pt-6 text-sm text-muted-foreground">
						最終更新日: {LAST_UPDATED}
					</p>
				</div>
			</LpSection>

			<LpSection id="support-en" eyebrow="English" title="Support">
				<div className="max-w-2xl space-y-4">
					<p className={bodyText}>
						For bug reports or questions, use our{" "}
						<HashJumpLink href={CONTACT_HREF} className={externalLink}>
							contact form
						</HashJumpLink>
						. Including your iPhone model and iOS version helps.
					</p>
				</div>
			</LpSection>

			<LpSection id="privacy-en" eyebrow="English" title="Privacy Policy">
				<div className="max-w-2xl space-y-4">
					<p className={bodyText}>
						<strong>
							Clavenome does not collect any information about you.
						</strong>
					</p>
					<ul className={bulletList}>
						<li>No account or sign-up</li>
						<li>No network access. The app works entirely offline</li>
						<li>No analytics, advertising, or tracking SDKs</li>
						<li>
							The only data stored on your device is your last selected rhythm
							and sound. It never leaves the device and is removed when you
							delete the app
						</li>
					</ul>

					<h3 className={subHeading}>In-App Purchases</h3>
					<p className={bodyText}>
						If in-app purchases are offered, all payments are processed by
						Apple. Clavenome never receives your name, address, or payment
						details. You can review purchases and request refunds through
						Apple&apos;s{" "}
						<a
							href={APPLE_PURCHASE_HISTORY_EN}
							className={externalLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							purchase history
						</a>
						.
					</p>

					<h3 className={subHeading}>Changes</h3>
					<p className={bodyText}>
						If the information we collect ever changes, this page and the
						app&apos;s release notes will be updated.
					</p>

					<p className="pt-6 text-sm text-muted-foreground">
						Last updated: {LAST_UPDATED}
					</p>
				</div>
			</LpSection>

			{/* 事業向けの CTA（無料相談）はアプリ利用者向けのページには載せない。
			    問い合わせ先は上のメールアドレスに一本化する */}
			<div className="py-12" />
		</div>
	);
}
