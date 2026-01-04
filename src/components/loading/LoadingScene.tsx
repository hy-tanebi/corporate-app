"use client";

import { useRef, Suspense, useEffect } from "react";
import { Stars } from "@react-three/drei";
import { Astronaut } from "../three/Astronaut";

// フォールバック用のシンプルな表示（非表示）
function AstronautFallback() {
	return null; // 何も表示しない
}

// 宇宙飛行士のラッパーコンポーネント
function AstronautModel({ position }: { position: [number, number, number] }) {
    // モバイル判定
	const isMobileRef = useRef(false);

	useEffect(() => {
		const checkMobile = () => {
			isMobileRef.current = window.innerWidth < 768;
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<Suspense fallback={<AstronautFallback />}>
			<Astronaut position={position} isMobile={isMobileRef.current} scale={isMobileRef.current ? 1.3 : 2} />
		</Suspense>
	);
}

// ローディングシーン全体
export default function LoadingScene() {
	return (
		<>
			{/* 環境光 - 明るさを上げてクリアに */}
			<ambientLight intensity={2} />
			{/* 指向性ライト - 正面から強く */}
			<directionalLight position={[0, 5, 10]} intensity={3} />
			{/* 補助ライト */}
			<directionalLight position={[-5, 0, -5]} intensity={1.5} />
			<directionalLight position={[5, 0, -5]} intensity={1.5} />

			{/* 星空背景 */}
			<Stars
				radius={100}
				depth={50}
				count={5000}
				factor={4}
				saturation={0}
				fade
				speed={1}
			/>

			{/* 宇宙飛行士 */}
			<AstronautModel position={[0, 0, 0]} />
		</>
	);
}
