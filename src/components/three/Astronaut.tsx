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
	const { scene, animations } = useGLTF(
		"https://mb9hgkfxcmjgkuip.public.blob.vercel-storage.com/artro_perfect.glb",
	);

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
					action.reset().fadeIn(0.5).play();
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

			// 画面全体をふわふわ浮遊するアニメーション
			// Mobile: イージングを抑えて画面内に収める
			// rangeX: 2.2 -> 0.8, rangeY: 1.5 -> 1.0 にさらに縮小して画面中央維持
			const rangeX = isMobile ? 0.8 : 12;
			const rangeY = isMobile ? 1.0 : 6;

			// 360度連続回転（各軸をゆっくり回転）
			groupRef.current.rotation.x = time * 0.15; // X軸回転
			groupRef.current.rotation.y = time * 0.2; // Y軸回転
			groupRef.current.rotation.z = time * 0.1; // Z軸回転

			groupRef.current.position.x = position[0] + Math.sin(time * 0.4) * rangeX; // 左右
			groupRef.current.position.y = position[1] + Math.cos(time * 0.3) * rangeY; // 上下
			// Z position logic might differ based on context, so adding base position[2]
			// Note: The original logic had a specific Z calc: -5 - Math.abs(Math.sin...)
			// We'll keep the relative Z movement
			groupRef.current.position.z =
				position[2] - 5 - Math.abs(Math.sin(time * 0.5) * 2);
		}
	});

	// Mobile scale adjustment (0.85x) to prevent overwhelming the small screen
	const finalScale = isMobile ? scale * 0.85 : scale;

	return (
		<group ref={groupRef}>
			<primitive object={clone} scale={finalScale} />
		</group>
	);
}

useGLTF.preload(
	"https://mb9hgkfxcmjgkuip.public.blob.vercel-storage.com/artro_perfect.glb",
);
