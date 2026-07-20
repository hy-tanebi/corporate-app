import type { ReactNode } from "react";
import { anton } from "./fonts";

interface LpSectionProps {
	id?: string;
	eyebrow?: string;
	title: string;
	children: ReactNode;
}

export function LpSection({ id, eyebrow, title, children }: LpSectionProps) {
	return (
		<section
			id={id}
			className="py-14 lg:py-24 border-t border-border scroll-mt-8"
		>
			{eyebrow && (
				<p
					className={`${anton.className} text-center text-sm tracking-[0.3em] uppercase text-[#e8590c] mb-3`}
				>
					{eyebrow}
				</p>
			)}
			<h2 className="text-center text-2xl lg:text-4xl font-black tracking-tight mb-8 lg:mb-12">
				{title}
			</h2>
			{children}
		</section>
	);
}
