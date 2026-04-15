"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface AstronautProps {
	position?: [number, number, number];
	scale?: number;
	isMobile?: boolean;
}

export function Astronaut({
	position = [0, 0, 0],
	scale = 2,
	isMobile = false,
}: AstronautProps) {
	const groupRef = useRef<THREE.Group>(null);
	const { scene, animations } = useGLTF("/models/artro_draco.glb");

	// シーンをクローンして、各インスタンスが独立したモデルを持つようにする
	const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
	// クローンされたシーンのグラフを取得（必要であれば）

	const { actions, names } = useAnimations(animations, groupRef);

	// アニメーションを再生
	useEffect(() => {
		if (names.length > 0) {
			names.forEach((name) => {
				const action = actions[name];
				if (action) {
					action.setLoop(THREE.LoopRepeat, Infinity);
					action.clampWhenFinished = false;
					action.enabled = true;
					action.reset().play();
				}
			});
		}

		// マテリアル設定（クローンに対して行う）
		clone.traverse((child: THREE.Object3D) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh;
				if (mesh.material) {
					const material = mesh.material as THREE.MeshStandardMaterial;
					material.metalness = 0.9;
					material.roughness = 0.2;
					material.envMapIntensity = 1.5;
				}
			}
		});
	}, [actions, names, clone]);

	useFrame((state) => {
		if (groupRef.current) {
			const time = state.clock.elapsedTime;
            // Robust check: Use prop, canvas width, OR Aspect Ratio (Portrait = Mobile).
			// This catches high-res mobile devices where width > 768 but aspect < 1.
			const isPortrait = state.size.width < state.size.height;
			const isMobileFrame = isMobile || state.size.width < 768 || isPortrait;

			if (isMobileFrame) {
				// Mobile: Dynamic Viewport Constraints
                // Calculate exact visible width at the current Z depth
                // This ensures we NEVER go off-screen regardless of device or parallax.

                // 1. Calculate Z (Base + Wobble)
                const currentZ = position[2] - 1.0 - Math.abs(Math.sin(time * 0.5) * 0.5);
                groupRef.current.position.z = currentZ;

                // 2. Get exact viewport width at this Z depth
                const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, currentZ]);
                const widthAtZ = viewport.width;
                const heightAtZ = viewport.height;

                // 3. Define Dynamic Limit (Half Width - Margin for Model Radius)
                // Model radius approx 0.8 ~ 1.0. Use 0.9 margin.
                const limitX = widthAtZ / 2 - 0.9;
                const limitY = heightAtZ / 2 - 1.2; // Top/Bottom margin

                // 4. Calculate Phase ONCE (Stable start)
                // We use a pseudo-hook-like stable value based on the PROP position.
                // Assuming standard Z=-5 for the initial phase calc to determine "Top-Right-ness".
                // We can't use refs easily inside this callback without init.
                // Math.sin(0 + phase) = Initial / Limit.
                // We want to calculate phase based on the Initial Position relative to the Initial Limit.
                // Let's approximate the initial limit using the standard Z=-5.
                // (This creates a consistent 'Rightness' regardless of instantaneous viewport)
                const PH_Z = -5;
                const vBase = state.viewport.getCurrentViewport(state.camera, [0,0,PH_Z]);
                const baseLimitX = vBase.width / 2 - 0.9;
                const baseLimitY = vBase.height / 2 - 1.2;

                const startX = THREE.MathUtils.clamp(position[0] / Math.max(0.1, baseLimitX), -0.95, 0.95);
                const startY = THREE.MathUtils.clamp(position[1] / Math.max(0.1, baseLimitY), -0.95, 0.95);

                const phaseX = Math.asin(startX);
                const phaseY = Math.asin(startY);

				// 5. Motion
				// Use the DYNAMIC limitX/limitY.
                // If screen narrows (parallax), limit shrinks, pulling astronaut in.
                // Speed: Relatively fast to ensure "Bounce" is seen.
				const speedX = 0.4;
				const speedY = 0.25;

				groupRef.current.position.x = Math.sin(time * speedX + phaseX) * Math.max(0, limitX);
				groupRef.current.position.y = Math.sin(time * speedY + phaseY) * Math.max(0, limitY);

				// Rotation
				groupRef.current.rotation.x = time * 0.15;
				groupRef.current.rotation.y = time * 0.2;
				groupRef.current.rotation.z = time * 0.1;

			} else {
				// Desktop: Original Logic
                // Reducing range slightly just in case it's a small desktop/tablet
				const rangeX = 8;
				const rangeY = 6;

				groupRef.current.rotation.x = time * 0.15;
				groupRef.current.rotation.y = time * 0.2;
				groupRef.current.rotation.z = time * 0.1;

				groupRef.current.position.x = position[0] + Math.sin(time * 0.4) * rangeX;
				groupRef.current.position.y = position[1] + Math.cos(time * 0.3) * rangeY;
				groupRef.current.position.z = position[2] - 5 - Math.abs(Math.sin(time * 0.5) * 2);
			}
		}
	});

	// Mobile scale adjustment (0.85x) to prevent overwhelming the small screen
	const finalScale = isMobile ? scale * 0.7 : scale;

	return (
		<group ref={groupRef}>
			<primitive object={clone} scale={finalScale} />
		</group>
	);
}

// preloadをidle時に遅延させ、初期ロードへの影響を軽減
if (typeof window !== "undefined") {
	const doPreload = () => useGLTF.preload("/models/artro_draco.glb");
	if ("requestIdleCallback" in window) {
		window.requestIdleCallback(doPreload);
	} else {
		setTimeout(doPreload, 1000);
	}
}
