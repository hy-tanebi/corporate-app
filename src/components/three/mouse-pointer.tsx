"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Mesh } from "three";

function MovingPointer() {
	const meshRef = useRef<Mesh>(null);
	const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
	const [isMoving, setIsMoving] = useState(false);
	const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		let moveTimeout: NodeJS.Timeout;

		const handleMouseMove = (event: MouseEvent) => {
			// 正確な座標変換
			const x = (event.clientX / window.innerWidth) * 2 - 1;
			const y = -(event.clientY / window.innerHeight) * 2 + 1;
			
			// カメラ設定に合わせて座標をスケール
			const aspect = window.innerWidth / window.innerHeight;
			const fovRad = (75 * Math.PI) / 180;
			const distance = 10;
			
			const height = 2 * Math.tan(fovRad / 2) * distance;
			const width = height * aspect;
			
			setTargetPosition({ 
				x: x * (width / 2), 
				y: y * (height / 2) 
			});
			setIsMoving(true);

			// 動きが止まったことを検知
			clearTimeout(moveTimeout);
			moveTimeout = setTimeout(() => {
				setIsMoving(false);
			}, 100);
		};

		window.addEventListener("mousemove", handleMouseMove);
		
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			clearTimeout(moveTimeout);
		};
	}, []);

	useFrame(() => {
		if (meshRef.current) {
			// ぬるっとした追従アニメーション
			const lerp = 0.1;
			const newX = currentPosition.x + (targetPosition.x - currentPosition.x) * lerp;
			const newY = currentPosition.y + (targetPosition.y - currentPosition.y) * lerp;
			
			setCurrentPosition({ x: newX, y: newY });
			
			meshRef.current.position.x = newX;
			meshRef.current.position.y = newY;
			
			// 動いている時は小さく、止まっている時は大きく
			const targetScale = isMoving ? 0.8 : 1.2;
			const currentScale = meshRef.current.scale.x;
			const newScale = currentScale + (targetScale - currentScale) * 0.1;
			
			meshRef.current.scale.setScalar(newScale);
		}
	});

	return (
		<mesh ref={meshRef} position={[0, 0, 0]}>
			<circleGeometry args={[0.3, 32]} />
			<meshBasicMaterial 
				color="#ffd700" 
				transparent 
				opacity={0.6}
			/>
		</mesh>
	);
}

export function MousePointer() {
	const [isClient, setIsClient] = useState(false);
	const [isMobile, setIsMobile] = useState(true);

	useEffect(() => {
		setIsClient(true);
		// モバイルデバイスの検知
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// SSR時やモバイルでは表示しない
	if (!isClient || isMobile) {
		return null;
	}

	return (
		<div 
			className="fixed inset-0 z-10"
			style={{ pointerEvents: 'none' }}
		>
			<Canvas
				className="w-full h-full"
				camera={{ position: [0, 0, 10], fov: 75 }}
				style={{ pointerEvents: 'none' }}
			>
				<MovingPointer />
			</Canvas>
		</div>
	);
}