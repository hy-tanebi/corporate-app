import HeroCanvasWithCMS from "@/components/three/HeroCanvasWithCMS";
import HomeClient from "./components/HomeClient";

export default function Home() {
	return (
		<HeroCanvasWithCMS>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": [
							{
								"@type": ["ProfessionalService", "LocalBusiness"],
								"@id": "https://tanebi-net.com/#organization",
								name: "TANEBI CREATIVE（タネビ クリエイティブ）- 奥州市のAI事業者",
								alternateName: ["タネビ クリエイティブ", "TANEBI CREATIVE", "奥州市 AI事業者"],
								url: "https://tanebi-net.com",
								image: "https://tanebi-net.com/images/ogp.jpg",
								description:
									"岩手県奥州市を拠点に、AIを活用した業務改善やDX推進、ホームページ・ECサイト制作、アプリ開発を行っています。地域の中小企業がデジタルを実務で活かせるよう支援します。",
								slogan:
									"種から形へ、種火を力に。技術と対話で、事業の前進を支援します。",
								address: {
									"@type": "PostalAddress",
									addressRegion: "岩手県",
									addressLocality: "奥州市",
									addressCountry: "JP",
								},
								geo: {
									"@type": "GeoCoordinates",
									latitude: 39.1448,
									longitude: 141.1391,
								},
								areaServed: [
									{
										"@type": "AdministrativeArea",
										name: "岩手県",
									},
								],
								knowsAbout: [
									"AI事業者",
									"AI導入支援",
									"AI活用コンサルティング",
									"AIO (AI検索最適化)",
									"LLMO (AI推奨・推薦最適化)",
									"岩手県内の中小企業向けDX・業務効率化支援",
									"AIを活用した集客・ホームページ制作",
									"AIによる事務作業の自動化",
									"社内情報の整理・ナレッジ共有の仕組み作り",
								],
								contactPoint: {
									"@type": "ContactPoint",
									contactType: "customer support",
									url: "https://tanebi-net.com/contact",
								},
							},
							{
								"@type": "WebSite",
								"@id": "https://tanebi-net.com/#website",
								url: "https://tanebi-net.com",
								name: "TANEBI CREATIVE | 奥州市のWeb制作・LLMO・AI活用",
								publisher: {
									"@id": "https://tanebi-net.com/#organization",
								},
							},
							{
								"@type": "Service",
								"@id": "https://tanebi-net.com/#service-web",
								name: "AIO Web制作",
								provider: {
									"@id": "https://tanebi-net.com/#organization",
								},
								description:
									"AI検索（AIO）に最適化された高品質なWebサイト制作。人間への訴求力とAIへの可読性を両立します。",
								areaServed: {
									"@type": "AdministrativeArea",
									name: "岩手県",
								},
							},
							{
								"@type": "Service",
								"@id": "https://tanebi-net.com/#service-dx",
								name: "LLMO DX支援",
								provider: {
									"@id": "https://tanebi-net.com/#organization",
								},
								description:
									"AI推奨（LLMO）を考慮した業務効率化・DX推進サポート。社内ナレッジの整理と活用を支援します。",
								areaServed: {
									"@type": "AdministrativeArea",
									name: "岩手県",
								},
							},
						],
					}),
				}}
			/>
			{/* クライアント側のUIロジックをHomeClientに委譲 */}
			<HomeClient />
		</HeroCanvasWithCMS>
	);
}
