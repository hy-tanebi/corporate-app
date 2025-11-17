// src/components/three/HtmlHoverPointer.tsx
"use client";

import { useEffect, useState, useRef } from "react";

interface HtmlHoverPointerProps {
	isHovering: boolean;
}

/**
 * HTMLレイヤーで表示するhoverポインタ
 * 流体エフェクトの影響を受けない
 */
export function HtmlHoverPointer({ isHovering }: HtmlHoverPointerProps) {
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [scale, setScale] = useState(0);
	const rafRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePos({ x: e.clientX, y: e.clientY });
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	useEffect(() => {
		const targetScale = isHovering ? 1 : 0;

		const animate = () => {
			setScale((prev) => {
				const diff = targetScale - prev;
				if (Math.abs(diff) < 0.01) return targetScale;
				return prev + diff * 0.15;
			});
			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [isHovering]);

	return (
		<div
			style={{
				position: "fixed",
				left: mousePos.x,
				top: mousePos.y,
				width: "80px",
				height: "80px",
				borderRadius: "50%",
				backgroundColor: "rgba(255, 215, 0, 0.6)",
				transform: `translate(-50%, -50%) scale(${scale})`,
				pointerEvents: "none",
				zIndex: 9999,
				transition: "transform 0.1s ease-out",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "white",
				fontWeight: "bold",
				fontSize: "14px",
			}}
		>
			click
		</div>
	);
}
