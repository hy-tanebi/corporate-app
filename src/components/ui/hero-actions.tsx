// src/components/ui/hero-actions.tsx
"use client";

import { ReactNode } from "react";

interface HeroActionsProps {
	children: ReactNode;
	scrollProgress: number;
	fadeInStart?: number;
	fadeOutStart?: number;
	position?: "right" | "left" | "center";
}

export function HeroActions({
	children,
	scrollProgress,
	fadeInStart = 0.3,
	fadeOutStart = 0.86,
	position = "right",
}: HeroActionsProps) {
	// フェードインとフェードアウトの計算
	const fadeIn = Math.max(0, Math.min(1, (scrollProgress - fadeInStart) * 4));
	const fadeOut = Math.max(
		0,
		Math.min(1, (fadeOutStart - scrollProgress) * 20),
	);
	const opacity = Math.min(fadeIn, fadeOut);

	// 位置クラスの決定
	const positionClasses = {
		right: "right-8",
		left: "left-8",
		center: "left-1/2 -translate-x-1/2",
	}[position];

	return (
		<div
			className={`fixed ${positionClasses} top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out`}
			style={{
				opacity,
				transform: `translateY(-50%) translateX(${(1 - opacity) * 20}px)`,
			}}
		>
			<div className="flex flex-col gap-4">{children}</div>
		</div>
	);
}
