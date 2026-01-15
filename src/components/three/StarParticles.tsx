// src/components/three/StarParticles.tsx

"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

// 新しいシェーダーをインポート
import starVertexShader from "../../../public/shaders/star-vertex.glsl?raw";
import starFragmentShader from "../../../public/shaders/star-fragment.glsl?raw";

// カスタムシェーダーマテリアルの定義
const StarShaderMaterial = shaderMaterial(
	{
		uTime: 0,
		uMouse: new THREE.Vector2(),
		uTexture: new THREE.Texture(),
		uSize: 0.5,
	},
	starVertexShader,
	starFragmentShader,
);
// Three.jsに拡張を登録
extend({ StarShaderMaterial });
type Props = {
	/** 親から自転を制御したくない場合は true */
	selfRotate?: boolean;
	/** このコンポーネント自身のローカル位置（親 group からのオフセット） */
	position?: [number, number, number];
	/** renderOrder を外から変えたい時 */
	renderOrder?: number;
	/** モバイルフラグ（星の数を減らしてパフォーマンス向上）*/
	isMobile?: boolean;
};

export function StarParticles({
	selfRotate = false,
	position = [0, 0, 0],
	renderOrder = 10,
	isMobile = false,
}: Props) {
	const mesh = useRef<THREE.Points>(null);
	// biome-ignore lint/suspicious/noExplicitAny: Shader material ref
	const materialRef = useRef<any>(null); // materialRefを追加
	const { pointer } = useThree();

	const particleTexture = useLoader(
		THREE.TextureLoader,
		"/textures/star_particle2.png",
	);
	particleTexture.generateMipmaps = false;
	particleTexture.minFilter = THREE.LinearFilter;
	particleTexture.magFilter = THREE.LinearFilter;
	particleTexture.wrapS = THREE.ClampToEdgeWrapping;
	particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.premultiplyAlpha = true;
const particles = useMemo(() => {
		// ★パフォーマンス最適化: 星の数を削減（デスクトップ 3000→1500、モバイル 1200→800）
		const count = isMobile ? 800 : 1500;
		const positions = new Float32Array(count * 3);
		const colors = new Float32Array(count * 3);
		const scales = new Float32Array(count); // New attribute for size
		const color = new THREE.Color();

		// Star Spectral Types Data (approximate probability & color)
		// Type: [Probability Threshold, Color Hex, Base Size]
		const starTypes = [
			{ threshold: 0.001, color: "#9bb0ff", size: 2.0 }, // O - Blue (Very rare)
			{ threshold: 0.01, color: "#aabfff", size: 1.6 },  // B - Blue-white
			{ threshold: 0.05, color: "#cad7ff", size: 1.4 },  // A - White
			{ threshold: 0.15, color: "#f8f7ff", size: 1.2 },  // F - Yellow-white
			{ threshold: 0.40, color: "#fff4ea", size: 1.0 },  // G - Yellow (Sun-like)
			{ threshold: 0.80, color: "#ffd2a1", size: 0.8 },  // K - Orange
			{ threshold: 1.00, color: "#ffcc6f", size: 0.6 }   // M - Red (Common, small)
		];

		const getStarData = (r: number) => {
			for (const type of starTypes) {
				if (r < type.threshold) return type;
			}
			return starTypes[starTypes.length - 1];
		};

		for (let i = 0; i < count; i++) {
			// Spherical distribution for more natural "space" feel, or wide cube?
			// Sticking to Box/Cube as per original for hero coverage, but wider spread.
			positions[i * 3] = (Math.random() - 0.5) * 80;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

			// Determine star type
			const type = getStarData(Math.random());
			color.set(type.color);

			// Slight random variation per star to avoid uniformity
			color.offsetHSL(0, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);

			colors[i * 3] = color.r;
			colors[i * 3 + 1] = color.g;
			colors[i * 3 + 2] = color.b;

			// Randomize size slightly around the base size
			scales[i] = type.size * (0.8 + Math.random() * 0.5);
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
		return geometry;
	}, [isMobile]);

	useFrame((_state, delta) => {
		if (selfRotate && mesh.current) {
			mesh.current.rotation.y += 0.0005;
		}

		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value += delta;
			materialRef.current.uniforms.uMouse.value.x = pointer.x;
			materialRef.current.uniforms.uMouse.value.y = pointer.y;
		}
	});

	return (
		<points ref={mesh} position={position} renderOrder={renderOrder}>
			<primitive object={particles} />
			{/* @ts-ignore */}
			<starShaderMaterial
				ref={materialRef}
				// ---- uniforms ----
				uTexture={particleTexture}
				uSize={0.5}
				// ---- material props ----
				transparent
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</points>
	);
}
// テクスチャのプリロード
useLoader.preload(THREE.TextureLoader, "/textures/star_particle2.png");
