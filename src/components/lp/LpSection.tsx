import type { ReactNode } from "react";

interface LpSectionProps {
	title: string;
	children: ReactNode;
}

export function LpSection({ title, children }: LpSectionProps) {
	return (
		<section className="py-12 lg:py-20 border-t border-border">
			<h2 className="text-2xl lg:text-4xl font-bold tracking-tight mb-8 lg:mb-12">
				{title}
			</h2>
			{children}
		</section>
	);
}
