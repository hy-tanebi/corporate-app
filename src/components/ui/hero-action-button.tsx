// src/components/ui/hero-action-button.tsx
"use client";

import Link from "next/link";

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
		"rounded-full border border-solid transition-colors flex items-center justify-center backdrop-blur gap-2 font-medium text-base h-12 px-6 shadow-lg";

	const variantClasses =
		variant === "primary"
			? "border-white/20 bg-white/10 text-white hover:bg-white/20"
			: "border-white/30 bg-white/5 text-white/90 hover:bg-white/15";

	return (
		<Link className={`${baseClasses} ${variantClasses}`} href={href}>
			{label}
		</Link>
	);
}
