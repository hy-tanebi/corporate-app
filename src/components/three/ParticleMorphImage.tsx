// src/components/three/ParticleMorphImage.tsx
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import vertexShader from "../../../public/shaders/particle-morph-vertex.glsl?raw";
import fragmentShader from "../../../public/shaders/particle-morph-fragment.glsl?raw";

interface ParticleMorphImageProps {
  imagePath: string;
  progress: number; // 0.0 = 流体状態, 1.0 = カード表示完了
  particleCount?: number;
  cardWidth?: number;
  cardHeight?: number;
}

export function ParticleMorphImage({
  imagePath,
  progress,
  particleCount = 10000,
  cardWidth = 4,
  cardHeight = 5,
}: ParticleMorphImageProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // 画像テクスチャを読み込み
  const texture = useLoader(THREE.TextureLoader, imagePath);

  // パーティクルの位置とUV座標を生成
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const targetUVs = new Float32Array(particleCount * 2);

    // カード形状の解像度（画像サンプリング用）
    const gridW = Math.floor(Math.sqrt(particleCount * (cardWidth / cardHeight)));
    const gridH = Math.floor(particleCount / gridW);

    for (let i = 0; i < particleCount; i++) {
      // 流体状態の初期位置（ランダム配置）
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      // カード状態の最終位置（グリッド配置）
      const col = i % gridW;
      const row = Math.floor(i / gridW);
      const u = col / gridW;
      const v = row / gridH;

      targetPositions[i * 3] = (u - 0.5) * cardWidth;
      targetPositions[i * 3 + 1] = (0.5 - v) * cardHeight;
      targetPositions[i * 3 + 2] = 0;

      // UV座標（テクスチャマッピング用）
      targetUVs[i * 2] = u;
      targetUVs[i * 2 + 1] = v;
    }

    return { positions, targetPositions, targetUVs };
  }, [particleCount, cardWidth, cardHeight]);

  // ジオメトリとマテリアルを作成
  const { geometry, material } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(particleData.positions, 3)
    );
    geom.setAttribute(
      "targetPosition",
      new THREE.BufferAttribute(particleData.targetPositions, 3)
    );
    geom.setAttribute(
      "targetUV",
      new THREE.BufferAttribute(particleData.targetUVs, 2)
    );

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(1920, 1080) },
        uImageTexture: { value: texture },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geom, material: mat };
  }, [particleData, texture]);

  // プログレスを更新
  useEffect(() => {
    if (material.uniforms) {
      material.uniforms.uProgress.value = progress;
    }
  }, [progress, material]);

  // アニメーションループ
  useFrame((state) => {
    if (material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
