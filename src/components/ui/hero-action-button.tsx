// src/components/ui/hero-action-button.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface HeroActionButtonProps {
	href: string;
	label: string;
	variant?: "primary" | "secondary";
}

export function HeroActionButton({
	href,
	label,
	variant = "primary",
}: HeroActionButtonProps) {
	const baseClasses =
		"rounded-full border border-solid flex items-center backdrop-blur font-medium text-base h-12 pl-6 pr-4 shadow-lg relative overflow-hidden group transition-all duration-300";

	const variantClasses =
		variant === "primary"
			? "border-white/20 bg-white/10 text-white"
			: "border-white/30 bg-white/5 text-white/90";

	const hoverBgColor = variant === "primary" ? "bg-white/30" : "bg-white/20";

	return (
		<Link
			className={`${baseClasses} ${variantClasses} pointer-events-auto`}
			href={href}
		>
			{/* スライドイン背景 */}
			<div
				className={`absolute inset-0 ${hoverBgColor} -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out`}
			/>

			{/* コンテンツ */}
			<span className="relative z-10 flex-1">{label}</span>
			<ChevronRight className="relative z-10 w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
		</Link>
	);
}
