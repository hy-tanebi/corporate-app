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
					className={`${anton.className} text-sm tracking-[0.3em] uppercase text-[#e8590c] mb-3`}
				>
					{eyebrow}
				</p>
			)}
			<h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-8 lg:mb-12">
				{title}
				<span className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-[#e8590c] ml-[0.12em]" />
			</h2>
			{children}
		</section>
	);
}
