import type { ReactNode } from "react";
import { HeroStateProvider } from "../../contexts/HeroStateProvider";
import HeroCanvasWrapper from "./HeroCanvasWrapper";
import { SHOWCASE_CARDS } from "./showcase-cards";

interface HeroCanvasSectionProps {
	children: ReactNode;
}

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
