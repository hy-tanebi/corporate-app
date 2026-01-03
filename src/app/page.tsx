import HeroCanvasWithCMS from "@/components/three/HeroCanvasWithCMS";
import HomeClient from "./components/HomeClient";

export default function Home() {
	return (
		<HeroCanvasWithCMS>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": [
							{
								"@type": "ProfessionalService",
								"@id": "https://tanebi-net.com/#organization",
								name: "TANEBI CREATIVE",
								url: "https://tanebi-net.com",
								image: "https://tanebi-net.com/images/ogp.jpg",
								description:
									"タネビ クリエイティブ（TANEBI CREATIVE）は、AIO（AI検索最適化）を導入したWeb制作と、LLMO（AI推奨最適化）を駆使したDX改善サポートを提供する、岩手県奥州市の個人事務所です。発芽するアイデアを形にし、種火のように根幹から寄り添う支援。技術と対話で事業の前進を支援します。",
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
