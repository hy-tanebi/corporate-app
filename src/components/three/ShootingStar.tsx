// src/components/three/ShootingStar.tsx
"use client";

import { useRef, useMemo, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ShootingStarProps {
	onComplete?: () => void;
	duration?: number; // ms（ゆっくりにしたいなら 3500〜5000 推奨）
}

export function ShootingStar({
	onComplete,
	duration = 4000,
}: ShootingStarProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const startTime = useRef<number>(0);
	const initialized = useRef(false);
	const done = useRef(false);

	// 左上→右下（画面外スタート）
	const traj = useMemo(() => {
		const startX = -Math.random() * 30 + -50; // さらに左外
		const startY = Math.random() * 30 + 40; // 上外
		const d = Math.random() * 40 + 60;
		const endX = startX + d;
		const endY = startY - d;
		const z = -Math.random() * 15 - 20;
		const angle = Math.atan2(endY - startY, endX - startX) - Math.PI / 2;
		return { startX, startY, endX, endY, z, angle };
	}, []);

	// 形状/材質は1回だけ
	const geometry = useMemo(
		() => new THREE.CylinderGeometry(0.005, 0.015, 3.5, 6),
		[],
	);
	const material = useMemo(
		() =>
			new THREE.MeshBasicMaterial({
				color: 0xaabbdd,
				transparent: true,
				opacity: 0,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				depthTest: false,
				toneMapped: false,
			}),
		[],
	);

	// 初回から開始位置に配置（中心フラッシュ防止）
	useLayoutEffect(() => {
		const m = meshRef.current;
		if (!m) return;
		m.visible = false;
		m.position.set(traj.startX, traj.startY, traj.z);
		m.rotation.z = traj.angle;
		m.renderOrder = 10;
		return () => {
			geometry.dispose();
			material.dispose();
		};
	}, [traj, geometry, material]);

	// 補間関数
	const smoothstep = (e0: number, e1: number, x: number) => {
		const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0, 1);
		return t * t * (3 - 2 * t);
	};

	useFrame((state) => {
		const m = meshRef.current;
		if (!m || done.current) return;

		if (!initialized.current) {
			startTime.current = state.clock.getElapsedTime() * 1000;
			m.visible = true;
			initialized.current = true;
		}

		const t = state.clock.getElapsedTime() * 1000 - startTime.current;
		const p = THREE.MathUtils.clamp(t / duration, 0, 1); // 0→1

		if (p >= 1) {
			done.current = true;
			m.visible = false;
			onComplete?.();
			return;
		}

		// 位置（線形でOK。もっと“しっとり”なら easeInOut してもOK）
		m.position.x = THREE.MathUtils.lerp(traj.startX, traj.endX, p);
		m.position.y = THREE.MathUtils.lerp(traj.startY, traj.endY, p);

		// より儚いフェード：ゆっくり現れて、ゆっくり消えていく
		const fadeIn = smoothstep(0.0, 0.25, p);
		const fadeOut = 1 - smoothstep(0.4, 1.0, p);
		const maxOpacity = 0.6; // 最大不透明度を下げて儚く
		material.opacity = THREE.MathUtils.clamp(
			fadeIn * fadeOut * maxOpacity,
			0,
			1,
		);

		// より繊細な尾の効果
		const tail = smoothstep(0.6, 1.0, p); // 0→1
		m.scale.y = 1 - 0.85 * tail; // 1→0.15 まで縮む（より緩やか）
		m.scale.x = 1 - 0.4 * tail; // 横方向も少し縮める
	});

	return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
