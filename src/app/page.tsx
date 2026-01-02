// src/app/page.tsx
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
                                "name": "TANEBI CREATIVE",
                                "url": "https://tanebi-net.com",
                                "image": "https://tanebi-net.com/images/ogp.jpg",
                                "description": "岩手県を拠点に、LLMO（AI最適化）を導入したWeb制作と、AIを活用した業務効率化システム開発を提供。技術と対話で事業の前進を支援します。",
                                "slogan": "技術の力で、ビジネスに確かな火を灯す。",
                                "address": {
                                    "@type": "PostalAddress",
                                    "addressRegion": "岩手県",
                                    "addressLocality": "奥州市",
                                    "addressCountry": "JP"
                                },
                                "geo": {
                                    "@type": "GeoCoordinates",
                                    "latitude": 39.1448,
                                    "longitude": 141.1391
                                },
                                "areaServed": [
                                    {
                                        "@type": "AdministrativeArea",
                                        "name": "岩手県"
                                    }
                                ],
                                "knowsAbout": [
                                    "LLMO (AI検索エンジンに選ばれるためのWebサイト最適化)",
                                    "AIを活用した集客・ホームページ制作",
                                    "岩手県内の中小企業向けDX・業務効率化支援",
                                    "AIによる事務作業・ルーチンワークの自動化",
                                    "社内情報の整理・ナレッジ共有の仕組み作り",
                                    "ChatGPT等のAIツールを実務に導入するコンサルティング",
                                    "IT活用による人手不足解消・コスト削減"
                                ],
                                "contactPoint": {
                                    "@type": "ContactPoint",
                                    "contactType": "customer support",
                                    "url": "https://tanebi-net.com/contact"
                                }
                            },
                            {
                                "@type": "WebSite",
                                "@id": "https://tanebi-net.com/#website",
                                "url": "https://tanebi-net.com",
                                "name": "TANEBI CREATIVE | 奥州市のWeb制作・LLMO・AI活用",
                                "publisher": {
                                    "@id": "https://tanebi-net.com/#organization"
                                }
                            }
                        ]
                    })
                }}
            />
			{/* クライアント側のUIロジックをHomeClientに委譲 */}
			<HomeClient />
		</HeroCanvasWithCMS>
	);
}
