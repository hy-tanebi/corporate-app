import type { ReactNode } from "react";
import { HeroStateProvider } from "../../contexts/HeroStateProvider";
import HeroCanvasWrapper from "./HeroCanvasWrapper";
import { SHOWCASE_CARDS } from "./showcase-cards";

interface HeroCanvasSectionProps {
	children: ReactNode;
}

/**
 * トップページの3D回転カードを配下ページへの導線として並べる。
 *
 * 以前は microCMS のブログ記事から生成していたが、記事を書くたびにトップの
 * ファーストビューが変わってしまうのと、リンク先が /blog/:id 決め打ちで
 * CMS 側から制御できなかったため、固定のカード定義（showcase-cards.ts）に移した。
 * 記事一覧は /blog が担う。
 */
export default function HeroCanvasSection({
	children,
}: HeroCanvasSectionProps) {
	return (
		<HeroStateProvider>
			{/* 3D Scene (Client Side Only via Dynamic Import with ssr: false) */}
			<HeroCanvasWrapper videoSlides={SHOWCASE_CARDS} />

			{/* Main Content (SSR Safe) - Rendered independently of 3D Canvas */}
			<div
				style={{
					position: "relative",
					zIndex: 10,
					minHeight: "1000vh",
					pointerEvents: "none",
				}}
			>
				{children}
			</div>
		</HeroStateProvider>
	);
}
