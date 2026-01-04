// src/components/three/HeroHoverPointer.tsx
"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface HeroHoverPointerProps {
	isHovering: boolean;
	mousePosition: THREE.Vector2;
}

/**
 * トップページ専用のhoverポインタ
 * カードにhoverした時にマウス位置に円を表示
 */
export function HeroHoverPointer({
	isHovering,
	mousePosition,
}: HeroHoverPointerProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const targetPos = useRef(new THREE.Vector3(0, 0, 0));
	const currentScale = useRef(0.1);
	const { camera } = useThree();

	useFrame(() => {
		if (!meshRef.current) return;

		// マウス位置をワールド座標に変換
		const vec = new THREE.Vector3(mousePosition.x, mousePosition.y, 0.5);
		vec.unproject(camera);

		const dir = vec.sub(camera.position).normalize();
		// カメラから少し手前の位置に配置（z=4の位置）
		const distance = 4 - camera.position.z;
		targetPos.current.copy(camera.position).add(dir.multiplyScalar(distance));

		// 滑らかに追従
		const lerp = 0.2;
		meshRef.current.position.lerp(targetPos.current, lerp);

		// hover時に拡大、それ以外は縮小
		const targetScale = isHovering ? 0.4 : 0.01;
		currentScale.current += (targetScale - currentScale.current) * 0.15;
		meshRef.current.scale.setScalar(currentScale.current);

		// 常にカメラの方を向く
		meshRef.current.lookAt(camera.position);
	});

	return (
		<mesh
			ref={meshRef}
			position={[0, 0, 4]}
			renderOrder={10001} // 流体エフェクト(10000)より前面
			frustumCulled={false}
		>
			<circleGeometry args={[2, 32]} />
			<meshBasicMaterial
				color="#ff0000"
				transparent
				opacity={0.8}
				depthTest={false}
				depthWrite={false}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}
