// src/components/three/hero-canvas.tsx
"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { StarParticles } from "./StarParticles";
import { Suspense } from "react";

import vertexShader from "../../../public/shaders/top-vertex.glsl?raw";
import fragmentShader from "../../../public/shaders/top-fragment.glsl?raw";

// 元の uniform セットに戻す
const HeroShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: [0, 0],
    uResolution: [0, 0],
  },
  vertexShader,
  fragmentShader
);
extend({ HeroShaderMaterial });

function HeroScene() {
  const triangleMeshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const starGroupRef = useRef<THREE.Group>(null);
  const lineSegmentsRef = useRef<THREE.LineSegments>(null);

  // 元のライン用ジオメトリ（detail=0）
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.TetrahedronGeometry(2, 0);
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const hue = position.getY(i) / 2 + 0.5;
      color.setHSL(hue, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const lineSegments = useMemo(() => {
    return new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ vertexColors: true })
    );
  }, [lineGeometry]);

  useFrame((state, delta) => {
    const mouse = state.mouse;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      // 元の実装どおり、-1〜1のNDCをそのまま渡す
      materialRef.current.uniforms.uMouse.value = [mouse.x, mouse.y];
      // 解像度も渡すなら（任意）
      materialRef.current.uniforms.uResolution.value = [
        state.size.width,
        state.size.height,
      ];
    }

    if (triangleMeshRef.current) {
      triangleMeshRef.current.rotation.x += delta * 0.5;
      triangleMeshRef.current.rotation.y += delta * 0.5;
    }
    if (lineSegmentsRef.current) {
      lineSegmentsRef.current.rotation.x += delta * 0.5;
      lineSegmentsRef.current.rotation.y += delta * 0.5;
    }
    if (starGroupRef.current) {
      starGroupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <>
      <group ref={starGroupRef}>
        <Suspense fallback={null}>
          <StarParticles selfRotate={false} position={[0, 0, -10]} />
        </Suspense>

        <mesh ref={triangleMeshRef} position={[0, 0, 0]} renderOrder={0}>
          <tetrahedronGeometry args={[2, 0]} />
          <heroShaderMaterial ref={materialRef} transparent={false} />
        </mesh>
      </group>

      <primitive
        ref={lineSegmentsRef}
        object={lineSegments}
        position={[0, 0, 0]}
        renderOrder={1}
      />
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
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["black"]} />
      <HeroScene />
    </Canvas>
  );
}
