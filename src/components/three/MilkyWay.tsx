// src/components/three/MilkyWay.tsx
"use client";

import { useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

// シェーダーをインポート
import milkyWayVertexShader from "../../../public/shaders/milky-way-vertex.glsl?raw";
import milkyWayFragmentShader from "../../../public/shaders/milky-way-fragment.glsl?raw";

// カスタムシェーダーマテリアルの定義
const MilkyWayShaderMaterial = shaderMaterial(
	{
		uTime: 0,
		uColor1: new THREE.Color(0.4, 0.5, 0.9), // 明るい青紫
		uColor2: new THREE.Color(0.2, 0.15, 0.4), // 暗い紫
		uOpacity: 0.2, // さらに薄く
	},
	milkyWayVertexShader,
	milkyWayFragmentShader,
);

// Three.jsに拡張を登録
extend({ MilkyWayShaderMaterial });

// TypeScript用の型宣言
declare global {
	namespace JSX {
		interface IntrinsicElements {
			milkyWayShaderMaterial: any;
		}
	}
}

interface MilkyWayProps {
	position?: [number, number, number];
	renderOrder?: number;
	scale?: number;
	rotation?: [number, number, number];
}

export function MilkyWay({
	position = [0, 0, -20],
	renderOrder = 5,
	scale = 50,
	rotation = [0, 0, 0],
}: MilkyWayProps) {
	const materialRef = useRef<any>(null);

	useFrame((state, delta) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value += delta;
		}
	});

	return (
		<mesh position={position} rotation={rotation} renderOrder={renderOrder}>
			<planeGeometry args={[scale, scale, 32, 32]} />
			{/* @ts-ignore */}
			<milkyWayShaderMaterial
				ref={materialRef}
				transparent
				blending={THREE.AdditiveBlending}
				depthWrite={false}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}
