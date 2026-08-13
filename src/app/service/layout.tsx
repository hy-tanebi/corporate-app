import type { ReactNode } from "react";
import { LpLightScope } from "@/components/lp/LpLightScope";
import { ScrollToTopButton } from "./components/scroll-to-top-button";

// この layout は /service と /service/issues の両方に効く（issues は /service 配下のため）。
// /works は別の layout.tsx を持つため対象外。
export default function ServiceLayout({ children }: { children: ReactNode }) {
	return (
		<LpLightScope>
			{children}
			<ScrollToTopButton />
		</LpLightScope>
	);
}
