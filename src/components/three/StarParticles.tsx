// src/components/three/StarParticles.tsx

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

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
  // THREE.Points 型で ref を明示的に型付け
  const mesh = useRef<THREE.Points>(null);

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

  useFrame(() => {
    if (selfRotate && mesh.current) {
      mesh.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={mesh} position={position} renderOrder={renderOrder}>
      <bufferGeometry attach="geometry" {...particles} />
      <pointsMaterial
        attach="material"
        size={0.5}
        vertexColors
        transparent
        sizeAttenuation
        map={particleTexture}
        alphaTest={0.05}
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
