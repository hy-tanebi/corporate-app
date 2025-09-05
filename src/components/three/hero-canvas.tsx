// src/components/three/hero-canvas.tsx

"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// シェーダーファイルのインポート
import vertexShader from "../../../public/shaders/top-vertex.glsl?raw";
import fragmentShader from "../../../public/shaders/top-fragment.glsl?raw";

// カスタムシェーダーマテリアルの定義と拡張
const HeroShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: [0, 0],
    uResolution: [0, 0],
  },
  vertexShader,
  fragmentShader
);

// 型定義は src/types/three.d.ts に移動

// react-three/fiberに拡張を登録
extend({ HeroShaderMaterial });

// メインの3Dコンポーネント
function HeroScene() {
  const triangleMeshRef = useRef<any>(null);
  const materialRef = useRef<any>(null);
  const edgesRef = useRef<any>(null);

  // useMemoを使ってジオメトリを再計算しないようにする
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.TetrahedronGeometry(2, 0);
    const position = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    for (let i = 0; i < position.count; i++) {
      // 頂点のY座標に基づいて色相を計算
      const hue = position.getY(i) / 2 + 0.5;
      color.setHSL(hue, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);

  useFrame((state, delta) => {
    const mouse = state.mouse;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uMouse.value = [mouse.x, mouse.y];
    }

    // 三角形の回転アニメーション
    if (triangleMeshRef.current) {
      triangleMeshRef.current.rotation.x += delta * 0.5;
      triangleMeshRef.current.rotation.y += delta * 0.5;
    }

    // 線を回転させる
    if (edgesRef.current) {
      edgesRef.current.rotation.x += delta * 0.5;
      edgesRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
      {/* 新しい三角形のオブジェクト */}
      <mesh ref={triangleMeshRef} position={[0, 0, 0]}>
        <tetrahedronGeometry args={[2, 0]} />
        <heroShaderMaterial ref={materialRef} transparent={true} />
      </mesh>

      {/* 輪郭をレインボーカラーで描画 */}
      <lineSegments ref={edgesRef} position={[0, 0, 0]}>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial vertexColors={true} />
      </lineSegments>
    </>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    >
      <HeroScene />
    </Canvas>
  );
}
