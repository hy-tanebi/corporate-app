// src/components/ui/hero-action-button.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";

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
	const { playHoverSound } = useAudio();

	// Material Design 3のボタンスタイル
	const baseClasses =
		"inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm tracking-wide transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] pointer-events-auto relative overflow-hidden group";

	const variantClasses =
		variant === "primary"
			? // Filled Button (Material Design 3)
				"bg-white/90 text-gray-900 shadow-lg hover:shadow-xl hover:bg-white active:shadow-md"
			: // Tonal Button (Material Design 3)
				"bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 hover:border-white/30 active:bg-white/15";

	return (
		<Link
			className={`${baseClasses} ${variantClasses}`}
			href={href}
			onMouseEnter={playHoverSound}
		>
			{/* Ripple Effect Background (Material Design Ripple) */}
			<div
				className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500 ease-out"
				style={{
					transformOrigin: "center",
				}}
			/>

			{/* ラベル */}
			<span className="relative z-10 font-medium">{label}</span>

			{/* アイコン */}
			<ChevronRight className="relative z-10 w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] group-hover:translate-x-1" />
		</Link>
	);
}
