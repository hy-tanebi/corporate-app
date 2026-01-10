"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import LoadingScene from "./LoadingScene";

export default function LoadingScreen({
	onLoadingComplete,
}: {
	onLoadingComplete: () => void;
}) {
	// Real Progress from Three.js DefaultLoadingManager
	const { progress, active } = useProgress();
	const [hasStarted, setHasStarted] = useState(false);

	// スクロール無効化
	useEffect(() => {
		document.body.style.overflow = "hidden";
	}, []);

	// Loading Completion Logic
	useEffect(() => {
		// When progress hits 100 (and technically active becomes false, but 100 is good visual indicator)
		if (progress === 100) {
			console.log("Real Loading complete.");
			// Small delay to let the user see "100%"
			const timer = setTimeout(() => {
				handleStart(true);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [progress]);

	const handleStart = (immediate = false) => {
		setHasStarted(true);
		// スクロールを復元
		document.body.style.overflow = "unset";
		// フェードアウトアニメーション後にコールバック実行
		setTimeout(
			() => {
				onLoadingComplete();
			},
			immediate ? 0 : 1000,
		);
	};

	return (
		<div
			className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 ${
				hasStarted ? "opacity-0 pointer-events-none" : "opacity-100"
			}`}
		>
			{/* Three.js Canvas */}
			<Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
				<LoadingScene />
			</Canvas>

			{/* ローディングUI */}
			<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
				<div className="text-center space-y-8 px-4">
					{/* 屋号 */}
					<h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
						TANEBI CREATIVE
					</h2>

					{/* タイトル */}
					<h1 className="text-xl md:text-2xl font-bold text-white tracking-wider animate-pulse">
						LOADING
					</h1>

					{/* プログレスバー */}
					<div className="w-64 md:w-96 mx-auto">
						<div className="h-2 bg-gray-800 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 transition-all duration-300 ease-out"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<p className="text-white text-xl mt-4 font-mono">
							{Math.floor(progress)}%
						</p>
					</div>

					{/* サウンドトグルボタン */}
					{/* サウンドトグルボタン */}
					{/* {showSoundToggle && (
						<div className="pointer-events-auto animate-fade-in">
							<SoundToggle onStart={handleStart} />
						</div>
					)} */}
				</div>
			</div>
		</div>
	);
}
