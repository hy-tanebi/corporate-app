import type { ReactNode } from "react";
import { LpLightScope } from "@/components/lp/LpLightScope";

export default function ServiceLayout({ children }: { children: ReactNode }) {
	return <LpLightScope>{children}</LpLightScope>;
}
