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
  starFragmentShader
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
};

export function StarParticles({
  selfRotate = false,
  position = [0, 0, 0],
  renderOrder = 10,
}: Props) {
  const mesh = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null); // materialRefを追加
  const { mouse } = useThree();

  const particleTexture = useLoader(
    THREE.TextureLoader,
    "/textures/star_particle2.png"
  );
  particleTexture.generateMipmaps = false;
  particleTexture.minFilter = THREE.LinearFilter;
  particleTexture.magFilter = THREE.LinearFilter;
  particleTexture.wrapS = THREE.ClampToEdgeWrapping;
  particleTexture.wrapT = THREE.ClampToEdgeWrapping;
  particleTexture.premultiplyAlpha = true;
  const particles = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
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

  useFrame((state, delta) => {
    if (selfRotate && mesh.current) {
      mesh.current.rotation.y += 0.0005;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uMouse.value.x = mouse.x;
      materialRef.current.uniforms.uMouse.value.y = mouse.y;
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
