"use client";

import { useRef, Suspense, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// 宇宙飛行士3Dモデルコンポーネント
function Astronaut({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(
    "https://mb9hgkfxcmjgkuip.public.blob.vercel-storage.com/artro_perfect.glb"
  );
  const { actions, names } = useAnimations(animations, groupRef);

  // アニメーションを再生
  useEffect(() => {
    console.log("=== アニメーション再生 ===");
    console.log("アニメーション数:", animations.length);
    console.log("アニメーション名:", names);
    console.log("Actions:", actions);

    // すべてのアニメーションを再生
    if (names.length > 0) {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.setLoop(THREE.LoopRepeat, Infinity); // 無限ループ設定
          action.clampWhenFinished = false; // ループ時にクランプしない
          action.enabled = true;
          action.reset().fadeIn(0.5).play(); // フェードインでスムーズに開始
          console.log(`✅ 再生中: ${name}`);
        }
      });
    }

    // マテリアル設定
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.metalness = 0.9;
          material.roughness = 0.2;
          material.envMapIntensity = 1.5;
        }
      }
    });
  }, [actions, names, animations, scene]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;

      // 360度連続回転（各軸をゆっくり回転）
      groupRef.current.rotation.x = time * 0.15; // X軸回転
      groupRef.current.rotation.y = time * 0.2; // Y軸回転
      groupRef.current.rotation.z = time * 0.1; // Z軸回転

      // 画面全体をふわふわ浮遊するアニメーション
      groupRef.current.position.x = Math.sin(time * 0.4) * 12; // 左右に広く
      groupRef.current.position.y = Math.cos(time * 0.3) * 6; // 上下に広く
      groupRef.current.position.z = -5 - Math.abs(Math.sin(time * 0.5) * 2); // 奥側（-5〜-7）で漂う
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={scene} scale={2} />
    </group>
  );
}

// フォールバック用のシンプルな表示
function AstronautFallback({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

// 宇宙飛行士のラッパーコンポーネント
function AstronautModel({ position }: { position: [number, number, number] }) {
  return (
    <Suspense fallback={<AstronautFallback position={position} />}>
      <Astronaut position={position} />
    </Suspense>
  );
}

// ローディングシーン全体
export default function LoadingScene() {
  return (
    <>
      {/* 環境光 - 明るさを上げてクリアに */}
      <ambientLight intensity={2} />
      {/* 指向性ライト - 正面から強く */}
      <directionalLight position={[0, 5, 10]} intensity={3} />
      {/* 補助ライト */}
      <directionalLight position={[-5, 0, -5]} intensity={1.5} />
      <directionalLight position={[5, 0, -5]} intensity={1.5} />

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

      {/* 宇宙飛行士 */}
      <AstronautModel position={[0, 0, 0]} />
    </>
  );
}
