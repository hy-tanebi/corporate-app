// src/components/three/StarParticles.tsx

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarParticles() {
  const mesh = useRef<THREE.Points>(null);

  // useMemoを使用してパーティクルジオメトリをキャッシュ
  const particles = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // ランダムな位置に星を配置
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      // 白い色を割り当て
      color.setRGB(1, 1, 1);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  // useFrameフックで右回り回転を実装
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.0005; // Y軸周りにゆっくり回転
    }
  });

  return (
    <points ref={mesh} position={[0, 0, -10]}>
      <bufferGeometry attach="geometry" {...particles} />
      <pointsMaterial
        attach="material"
        size={0.05}
        vertexColors={true}
        transparent={true}
        sizeAttenuation={true}
      />
    </points>
  );
}
