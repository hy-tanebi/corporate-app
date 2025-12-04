// src/components/three/PurpleNebula.tsx
"use client";

import { useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

// シェーダーをインポート
import purpleNebulaVertexShader from "../../../public/shaders/purple-nebula-vertex.glsl?raw";
import purpleNebulaFragmentShader from "../../../public/shaders/purple-nebula-fragment.glsl?raw";

// カスタムシェーダーマテリアルの定義
const PurpleNebulaShaderMaterial = shaderMaterial(
	{
		uTime: 0,
		uColor1: new THREE.Color(0.6, 0.2, 0.8), // 明るい紫
		uColor2: new THREE.Color(0.3, 0.1, 0.5), // 中間の紫
		uColor3: new THREE.Color(0.8, 0.3, 0.9), // ピンクがかった紫
		uOpacity: 0.25,
	},
	purpleNebulaVertexShader,
	purpleNebulaFragmentShader,
);

// Three.jsに拡張を登録
extend({ PurpleNebulaShaderMaterial });

// TypeScript用の型宣言
declare global {
	namespace JSX {
		interface IntrinsicElements {
			purpleNebulaShaderMaterial: any;
		}
	}
}

interface PurpleNebulaProps {
	position?: [number, number, number];
	renderOrder?: number;
	scale?: number;
	rotation?: [number, number, number];
	opacity?: number;
	color1?: THREE.Color | [number, number, number];
	color2?: THREE.Color | [number, number, number];
	color3?: THREE.Color | [number, number, number];
}

export function PurpleNebula({
	position = [0, 0, -20],
	renderOrder = 5,
	scale = 60,
	rotation = [0, 0, 0],
	opacity = 0.25,
	color1,
	color2,
	color3,
}: PurpleNebulaProps) {
	const materialRef = useRef<any>(null);

	useFrame((state, delta) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value += delta;
		}
	});

	// カラー設定
	const finalColor1 = color1
		? Array.isArray(color1)
			? new THREE.Color(...color1)
			: color1
		: new THREE.Color(0.6, 0.2, 0.8);

	const finalColor2 = color2
		? Array.isArray(color2)
			? new THREE.Color(...color2)
			: color2
		: new THREE.Color(0.3, 0.1, 0.5);

	const finalColor3 = color3
		? Array.isArray(color3)
			? new THREE.Color(...color3)
			: color3
		: new THREE.Color(0.8, 0.3, 0.9);

	return (
		<mesh position={position} rotation={rotation} renderOrder={renderOrder}>
			<planeGeometry args={[scale, scale, 64, 64]} />
			{/* @ts-ignore */}
			<purpleNebulaShaderMaterial
				ref={materialRef}
				transparent
				blending={THREE.AdditiveBlending}
				depthWrite={false}
				side={THREE.DoubleSide}
				uColor1={finalColor1}
				uColor2={finalColor2}
				uColor3={finalColor3}
				uOpacity={opacity}
			/>
		</mesh>
	);
}
