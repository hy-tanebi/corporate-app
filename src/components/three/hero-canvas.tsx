// src/components/three/hero-canvas.tsx
"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
// ScrollControls と Scroll をインポート
import {
  shaderMaterial,
  useScroll,
  ScrollControls,
  Scroll,
} from "@react-three/drei";
import { useRef, useMemo, Suspense, ReactNode } from "react";
import * as THREE from "three";
import { StarParticles } from "./StarParticles";

import vertexShader from "../../../public/shaders/top-vertex.glsl?raw";
import fragmentShader from "../../../public/shaders/top-fragment.glsl?raw";

// ... (HeroShaderMaterial と extend は変更なし)
const HeroShaderMaterial = shaderMaterial(
  { uTime: 0, uMouse: [0, 0], uResolution: [0, 0] },
  vertexShader,
  fragmentShader
);
extend({ HeroShaderMaterial });

// ... (HeroScene は前回の提案通りで変更なし)
function HeroScene() {
  const scroll = useScroll();
  const materialRef = useRef<any>(null);
  const starGroupRef = useRef<THREE.Group>(null);
  const triangleGroupRef = useRef<THREE.Group>(null);
  const circleRef = useRef<THREE.Mesh>(null);

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

  const lineSegments = useMemo(
    () =>
      new THREE.LineSegments(
        lineGeometry,
        new THREE.LineBasicMaterial({ vertexColors: true })
      ),
    [lineGeometry]
  );

  useFrame((state, delta) => {
    const offset = scroll.offset;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      // マウスオーバー効果を無効化：固定値を設定
      materialRef.current.uniforms.uMouse.value = [0, 0];
      materialRef.current.uniforms.uResolution.value = [
        state.size.width,
        state.size.height,
      ];
    }
    if (circleRef.current) {
      const scaleProgress = Math.min(offset * 2, 1.0);
      const scale = THREE.MathUtils.lerp(0, 15, scaleProgress);
      circleRef.current.scale.set(scale, scale, 1);
    }
    if (triangleGroupRef.current) {
      triangleGroupRef.current.position.z = offset * -5;
      triangleGroupRef.current.rotation.x += delta * 0.1;
      triangleGroupRef.current.rotation.y += delta * 0.2;
    }
    if (starGroupRef.current) {
      starGroupRef.current.rotation.y += 0.0005;
      starGroupRef.current.position.z = offset * 2;
    }
  });

  return (
    <>
      <color attach="background" args={["black"]} />
      <group ref={starGroupRef}>
        <Suspense fallback={null}>
          <StarParticles selfRotate={false} position={[0, 0, -10]} />
        </Suspense>
      </group>
      <group ref={triangleGroupRef}>
        <mesh renderOrder={1}>
          <tetrahedronGeometry args={[2, 0]} />
          <heroShaderMaterial ref={materialRef} transparent={false} />
        </mesh>
        <primitive object={lineSegments} renderOrder={2} />
      </group>
      <mesh ref={circleRef} position={[0, 0, 0.1]} renderOrder={3}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color="black" side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// HeroCanvasコンポーネントを修正
export default function HeroCanvas({ children }: { children: ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        // zIndexは不要なので削除
      }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* Canvasの直下にScrollControlsを配置 */}
      <ScrollControls pages={2} damping={0.1}>
        {/* 3Dシーンコンポーネント */}
        <HeroScene />

        {/* page.tsxから渡されたHTMLコンテンツをここに表示 */}
        <Scroll html style={{ width: "100%" }}>
          {children}
        </Scroll>
      </ScrollControls>
    </Canvas>
  );
}
