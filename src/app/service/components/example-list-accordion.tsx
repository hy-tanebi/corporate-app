"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ExampleListAccordionProps {
	items: string[];
}

/**
 * 「例えばこんなこと」の例示リスト。
 * モバイルではタップで開閉するアコーディオン、デスクトップでは常時展開のまま。
 * ServicePage は metadata を export する Server Component のため、
 * 開閉状態を持つこの部分だけを Client Component として切り出している。
 */
export function ExampleListAccordion({ items }: ExampleListAccordionProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="self-start lg:pt-1">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				className="flex w-full items-center justify-between gap-2 mb-3 text-left md:pointer-events-none md:cursor-default"
			>
				<span className="text-xs font-bold tracking-widest text-muted-foreground">
					例えばこんなこと
				</span>
				<ChevronDown
					aria-hidden
					className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform md:hidden ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>
			<div className={`${isOpen ? "block" : "hidden"} md:block`}>
				<ul>
					{items.map((item) => (
						<li
							key={item}
							className="flex gap-3 py-3 border-t border-border text-sm leading-relaxed"
						>
							<span aria-hidden className="text-[#e8590c]">
								—
							</span>
							{item}
						</li>
					))}
				</ul>
				<p className="mt-4 text-xs leading-relaxed text-muted-foreground">
					その他、課題に感じていることがありましたら、
					<br />
					<Link
						href="/#contact"
						className="font-bold text-foreground underline underline-offset-4 hover:text-[#e8590c] transition-colors"
					>
						お気軽にご相談ください
					</Link>
					。
				</p>
			</div>
		</div>
	);
}
