"use client";

import { Suspense, useEffect, useState } from "react";
import { Astronaut } from "../three/Astronaut";

// フォールバック用のシンプルな表示（非表示）
function AstronautFallback() {
	return null; // 何も表示しない
}

// 宇宙飛行士のラッパーコンポーネント
function AstronautModel() {
	// モバイル判定 (初期値はfalseで統一しハイドレーションエラー回避)
    // 安全な状態（Safe State）に戻る
	const [isMobile, setIsMobile] = useState(false);

    // ランダム位置 (初期値は安全な中央位置 [0, 0, -5])
    const [randomPos, setRandomPos] = useState<[number, number, number]>([0, 0, -5]);

	useEffect(() => {
		const updateState = () => {
            const isM = window.innerWidth < 768;
			setIsMobile(isM);

            if (isM) {
                // Mobile Random: Strong Top-Right Bias
                // X: 1.2 to 1.8 (Strong Right) -> Bounded motion will ensure safety.
                // Y: 2.0 to 3.5 (Up - Unchanged)
                setRandomPos([
                    Math.random() * 0.6 + 1.2,    // 1.2 ~ 1.8 (Right)
                    Math.random() * 1.5 + 2.0,    // 2.0 ~ 3.5 (Up)
                    -5
                ]);
            } else {
                 // Desktop Random
                 setRandomPos([
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 2.5,
                    0
                ]);
            }
		};

        // Run immediately on mount (Client side only)
        updateState();
		window.addEventListener("resize", updateState);
		return () => window.removeEventListener("resize", updateState);
	}, []);

	return (
		<Suspense fallback={<AstronautFallback />}>
            <Astronaut
                position={randomPos}
                isMobile={isMobile}
                scale={isMobile ? 1.3 : 2}
            />
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


			{/* 宇宙飛行士 */}
			<AstronautModel />
		</>
	);
}
