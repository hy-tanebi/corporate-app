"use client";

import { Suspense, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// 次のセクション用の定数
const NEXT_SECTION_START = 0.9995; // 黒い円が完全に拡大した時点

interface NextSectionProps {
  scrollProgress: number;
  isVisible: boolean; // 黒い円が完全に拡大したかどうか
}

export default function NextSection({ scrollProgress, isVisible }: NextSectionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // 黒い円が完全に拡大した後のみ表示
  if (!isVisible) {
    return null;
  }

  // 次のセクションでのスクロール進行度を計算
  const sectionProgress = Math.max(0, (scrollProgress - NEXT_SECTION_START) / (1 - NEXT_SECTION_START));

  // パーティクル用の位置データ
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    // パーティクルの回転アニメーション
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1;
      particlesRef.current.rotation.x += delta * 0.05;
    }
    
    // グループ全体のフェードイン
    if (groupRef.current) {
      const targetOpacity = Math.min(sectionProgress * 1.5, 1);
      // Three.jsのtraverseメソッドでマテリアルの透明度を調整
      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).material) {
          const material = (child as THREE.Mesh).material as THREE.Material;
          if ('opacity' in material) {
            (material as any).opacity = targetOpacity;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} renderOrder={2000}>
      {/* 次のセクションのコンテンツ */}
      <Suspense fallback={null}>
        {/* メインタイトル */}
        <Text
          position={[0, 2, 1]}
          fontSize={1.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={viewport.width * 0.8}
        >
          Next Phase
        </Text>
        
        {/* サブタイトル */}
        <Text
          position={[0, 0.5, 1]}
          fontSize={0.5}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          maxWidth={viewport.width * 0.6}
        >
          Portfolio & Technology Stack
        </Text>
        
        {/* 装飾的なパーティクル */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial 
            color="#4488ff" 
            size={0.05}
            transparent
            opacity={0.6}
            sizeAttenuation={false}
          />
        </points>
        
        {/* ナビゲーション要素のプレースホルダー */}
        <group position={[0, -2, 1]}>
          {['About', 'Projects', 'Skills', 'Contact'].map((item, index) => (
            <Text
              key={item}
              position={[(index - 1.5) * 2, 0, 0]}
              fontSize={0.3}
              color="#88aaff"
              anchorX="center"
              anchorY="middle"
            >
              {item}
            </Text>
          ))}
        </group>
      </Suspense>
    </group>
  );
}