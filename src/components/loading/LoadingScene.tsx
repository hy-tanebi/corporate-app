"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

// 回転する惑星コンポーネント
function Planet({ position }: { position: [number, number, number] }) {
	const meshRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += 0.01;
			meshRef.current.rotation.x += 0.005;
			// 惑星を上下に動かす
			meshRef.current.position.y =
				position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
		}
	});

	return (
		<Sphere ref={meshRef} args={[0.8, 32, 32]} position={position}>
			<meshStandardMaterial
				color="#4a90e2"
				metalness={0.3}
				roughness={0.4}
				emissive="#1a4d7a"
				emissiveIntensity={0.2}
			/>
		</Sphere>
	);
}

// 小さい衛星コンポーネント
function Satellite() {
	const meshRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (meshRef.current) {
			// 惑星の周りを公転
			const time = state.clock.elapsedTime;
			meshRef.current.position.x = Math.cos(time * 1.5) * 2;
			meshRef.current.position.z = Math.sin(time * 1.5) * 2;
			meshRef.current.position.y = Math.sin(time * 0.8) * 0.3;
		}
	});

	return (
		<Sphere ref={meshRef} args={[0.3, 16, 16]}>
			<meshStandardMaterial
				color="#e2b94a"
				metalness={0.5}
				roughness={0.3}
				emissive="#7a5c1a"
				emissiveIntensity={0.3}
			/>
		</Sphere>
	);
}

// ローディングシーン全体
export default function LoadingScene() {
	return (
		<>
			{/* 環境光 */}
			<ambientLight intensity={0.3} />
			{/* 指向性ライト */}
			<directionalLight position={[10, 10, 5]} intensity={1} />
			{/* ポイントライト */}
			<pointLight position={[-10, -10, -5]} intensity={0.5} color="#4a90e2" />

			{/* 星空背景 */}
			<Stars
				radius={100}
				depth={50}
				count={5000}
				factor={4}
				saturation={0}
				fade
				speed={1}
			/>

			{/* 中央の惑星 */}
			<Planet position={[0, 0, 0]} />

			{/* 周回する衛星 */}
			<Satellite />
		</>
	);
}
