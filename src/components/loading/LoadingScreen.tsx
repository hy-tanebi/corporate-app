"use client";

import { useState, useEffect, useCallback } from "react";

export default function LoadingScreen({
	onLoadingComplete,
}: {
	onLoadingComplete: () => void;
}) {
	const [progress, setProgress] = useState(0);
	const [hasStarted, setHasStarted] = useState(false);

	// スクロール無効化。unmount 時に必ず戻す
	// （cleanup がないと、遷移や例外で unmount したときスクロールが戻らなくなる）
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);

	const handleStart = useCallback(() => {
		setHasStarted(true);
		document.body.style.overflow = "unset";
		// フェードアウト(transition-opacity duration-500)を再生しきってから親に完了を伝える。
		// 以前は 0ms で通知していたため、親が即座に unmount しフェードが走っていなかった。
		setTimeout(() => {
			onLoadingComplete();
		}, 500);
	}, [onLoadingComplete]);

	// 約0.7秒で完了するプログレスシミュレーション
	useEffect(() => {
		const start = performance.now();
		const duration = 700;
		let frame: number;

		const tick = () => {
			const elapsed = performance.now() - start;
			const t = Math.min(elapsed / duration, 1);
			// easeOutCubic: 最初は速く、最後だけ少し減速
			const eased = 1 - (1 - t) ** 3;
			const current = eased * 100;

			setProgress(current >= 99.5 ? 100 : current);

			if (current < 100) {
				frame = requestAnimationFrame(tick);
			}
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	// 100%到達で完了
	useEffect(() => {
		if (progress === 100) {
			handleStart();
		}
	}, [progress, handleStart]);

	return (
		<div
			className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${
				hasStarted ? "opacity-0 pointer-events-none" : "opacity-100"
			}`}
		>
			{/* ローディングUI */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<div className="text-center space-y-8 px-4">
					<h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
						TANEBI CREATIVE
					</h2>

					<h1 className="text-xl md:text-2xl font-bold text-white tracking-wider animate-pulse">
						LOADING
					</h1>

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
				</div>
			</div>
		</div>
	);
}
