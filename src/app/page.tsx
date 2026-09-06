import type { Metadata } from "next";
import HeroCanvasSection from "@/components/three/HeroCanvasSection";
import { generateSiteJsonLd, serializeJsonLd, SITE_CONFIG } from "@/lib/seo";
import HomeClient from "./components/HomeClient";

// canonical はルートレイアウトから継承させず、各ページで自分自身を指す（seo.ts のコメント参照）
export const metadata: Metadata = {
	alternates: { canonical: SITE_CONFIG.url },
};

export default function Home() {
	return (
		<HeroCanvasSection>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD（< はエスケープ済み）
				dangerouslySetInnerHTML={{
					__html: serializeJsonLd(generateSiteJsonLd()),
				}}
			/>
			{/* クライアント側のUIロジックをHomeClientに委譲 */}
			<HomeClient />
		</HeroCanvasSection>
	);
}
