"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import LoadingScene from "./LoadingScene";
import SoundToggle from "./SoundToggle";

export default function LoadingScreen({
	onLoadingComplete,
}: {
	onLoadingComplete: () => void;
}) {
	const [progress, setProgress] = useState(0);
	const [showSoundToggle, setShowSoundToggle] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);

	// スクロール無効化
	useEffect(() => {
		// ローディング中はスクロールを無効化
		document.body.style.overflow = "hidden";

		return () => {
			// コンポーネントがアンマウントされたらスクロールを復元
			document.body.style.overflow = "unset";
		};
	}, []);

	useEffect(() => {
		// プログレスバーのアニメーション
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setShowSoundToggle(true);
					return 100;
				}
				// ランダムに進行速度を変える（リアルなローディング感）
				const increment = Math.random() * 15 + 5;
				return Math.min(prev + increment, 100);
			});
		}, 300);

		return () => clearInterval(interval);
	}, []);

	const handleStart = () => {
		setHasStarted(true);
		// フェードアウトアニメーション後にコールバック実行
		setTimeout(() => {
			onLoadingComplete();
		}, 1000);
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
				<div className="text-center space-y-8">
					{/* タイトル */}
					<h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider animate-pulse">
						LOADING
					</h1>

					{/* プログレスバー */}
					<div className="w-64 md:w-96 mx-auto">
						<div className="h-2 bg-gray-800 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<p className="text-white text-xl mt-4 font-mono">
							{Math.floor(progress)}%
						</p>
					</div>

					{/* サウンドトグルボタン */}
					{showSoundToggle && (
						<div className="pointer-events-auto animate-fade-in">
							<SoundToggle onStart={handleStart} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
