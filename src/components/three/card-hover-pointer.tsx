"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import type { Mesh } from "three";

interface CardHoverPointerProps {
	isHovering: boolean;
	cardRef: React.RefObject<HTMLDivElement | null>;
}

function HoverCircle({ isHovering, cardRef }: CardHoverPointerProps) {
	const meshRef = useRef<Mesh>(null);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (!cardRef.current) return;

			const rect = cardRef.current.getBoundingClientRect();

			// カード内の相対座標に変換
			const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			setMousePosition({ x, y });
		};

		if (isHovering) {
			window.addEventListener("mousemove", handleMouseMove);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [isHovering, cardRef]);

	useFrame(() => {
		if (meshRef.current) {
			// マウス位置に追従
			const lerp = 0.15;
			meshRef.current.position.x +=
				(mousePosition.x * 2 - meshRef.current.position.x) * lerp;
			meshRef.current.position.y +=
				(mousePosition.y * 2 - meshRef.current.position.y) * lerp;

			// hover時に拡大
			const targetScale = isHovering ? 1.5 : 0.1;
			const currentScale = meshRef.current.scale.x;
			const newScale = currentScale + (targetScale - currentScale) * 0.1;

			meshRef.current.scale.setScalar(newScale);
		}
	});

	return (
		<mesh ref={meshRef} position={[0, 0, 0]}>
			<circleGeometry args={[0.5, 32]} />
			<meshBasicMaterial color="#ffd700" transparent opacity={0.4} />
		</mesh>
	);
}

export function CardHoverPointer({
	isHovering,
	cardRef,
}: CardHoverPointerProps) {
	const [isClient, setIsClient] = useState(false);
	const [isMobile, setIsMobile] = useState(true);

	useEffect(() => {
		setIsClient(true);
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	if (!isClient || isMobile) {
		return null;
	}

	return (
		<div className="absolute inset-0 z-50" style={{ pointerEvents: "none" }}>
			<Canvas
				className="w-full h-full"
				camera={{ position: [0, 0, 5], fov: 75 }}
				style={{ pointerEvents: "none" }}
			>
				<HoverCircle isHovering={isHovering} cardRef={cardRef} />
			</Canvas>
		</div>
	);
}
