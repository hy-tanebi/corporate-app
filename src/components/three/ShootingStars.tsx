// src/components/three/ShootingStars.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ShootingStar } from "./ShootingStar";

interface ShootingStarsProps {
	interval?: number; // 次の星を出すまでの待ち時間(ms)
	duration?: number; // 星が流れる時間(ms)
}

export function ShootingStars({
	interval = 3500,
	duration = 4000,
}: ShootingStarsProps) {
	const [activeId, setActiveId] = useState<number | null>(null);
	const timerRef = useRef<number | null>(null);

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const scheduleNext = useCallback(() => {
		clearTimer();
		timerRef.current = window.setTimeout(() => {
			setActiveId(Date.now()); // 1つだけ生成
		}, interval);
	}, [interval, clearTimer]);

	useEffect(() => {
		// 初回はすぐ1つ出す
		setActiveId(Date.now());
		return () => clearTimer();
	}, [clearTimer]);

	const handleComplete = useCallback(() => {
		setActiveId(null);
		scheduleNext(); // 完了後に次を予約（常に1つだけ）
	}, [scheduleNext]);

	return activeId !== null ? (
		<ShootingStar
			key={activeId}
			duration={duration}
			onComplete={handleComplete}
		/>
	) : null;
}
