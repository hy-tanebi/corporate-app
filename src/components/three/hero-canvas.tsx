// src/components/three/hero-canvas.tsx
"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import {
  useRef,
  useMemo,
  Suspense,
  ReactNode,
  useState,
  useEffect,
} from "react";
import * as THREE from "three";
import { StarParticles } from "./StarParticles";
import VideoCard3D from "./VideoCard3D";

import vertexShader from "../../../public/shaders/top-vertex.glsl?raw";
import fragmentShader from "../../../public/shaders/top-fragment.glsl?raw";

// ===== 引き具合（相対関係を保ったまま全体を縮尺） =====
const SCENE_SCALE = 0.8;

// HeroShaderMaterial
const HeroShaderMaterial = shaderMaterial(
  { uTime: 0, uMouse: [0, 0], uResolution: [0, 0] },
  vertexShader,
  fragmentShader
);
extend({ HeroShaderMaterial });

// 動画データ
const videoSlides = [
  {
    id: "slide-1",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "プロジェクト 1",
    description: "スクロール同期による動画体験の実装デモンストレーション。",
  },
  {
    id: "slide-2",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "プロジェクト 2",
    description:
      "レスポンシブデザインとアクセシビリティを重視した動画プレイヤー。",
  },
  {
    id: "slide-3",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "プロジェクト 3",
    description: "パフォーマンス最適化された動画配信システム。",
  },
  {
    id: "slide-4",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    title: "プロジェクト 4",
    description: "インタラクティブな動画体験プラットフォーム。",
  },
];

function HeroScene({ scrollProgress }: { scrollProgress: number }) {
  const materialRef = useRef<any>(null);
  const starGroupRef = useRef<THREE.Group>(null);
  const triangleGroupRef = useRef<THREE.Group>(null);
  const circleRef = useRef<THREE.Mesh>(null);
  const videoCardsRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);

  // ===== 回転シーケンスのための角度レイアウト =====
  const TAU = Math.PI * 2;
  const baseAngle = -Math.PI / 2; // 左(-90°)基準
  const radius = 4;

  // 「左回転」がスクロールで進む前提（rotation.y が + 方向）
  // 表示も消えるのも「右回転順」にしたいので、角度昇順（左回転順）の配列を逆順に使う
  const layout = useMemo(() => {
    const n = videoSlides.length;
    const items = Array.from({ length: n }, (_, index) => {
      const angle = baseAngle + (index / n) * TAU;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - 2; // 三角形より奥へ
      return { index, angle, x, z };
    });
    const itemsForward = [...items].sort((a, b) => a.angle - b.angle); // 左回転方向
    const itemsReverse = [...itemsForward].reverse(); // 右回転方向（= 表示/消去の順）
    const rankReverse = new Map<number, number>(); // 右回転順のランク
    itemsReverse.forEach((it, rank) => rankReverse.set(it.index, rank));
    return { n, items: itemsForward, itemsReverse, rankReverse };
  }, []);

  const smooth01 = (x: number) => {
    const t = THREE.MathUtils.clamp(x, 0, 1);
    return t * t * (3 - 2 * t);
  };

  // ===== 装飾ジオメトリ =====
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
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uMouse.value = [0, 0];
      materialRef.current.uniforms.uResolution.value = [
        state.size.width,
        state.size.height,
      ];
    }

    if (rootRef.current) {
      rootRef.current.scale.set(SCENE_SCALE, SCENE_SCALE, SCENE_SCALE);
    }

    // 三角形の回転・スケール
    if (triangleGroupRef.current) {
      triangleGroupRef.current.rotation.x += delta * 0.1;
      triangleGroupRef.current.rotation.y += delta * 0.2;

      const thirdPhaseStart = 0.5;
      const scaleTransitionEnd = 0.55;
      if (scrollProgress < thirdPhaseStart) {
        triangleGroupRef.current.scale.set(1, 1, 1);
      } else if (scrollProgress <= scaleTransitionEnd) {
        const transitionProgress =
          (scrollProgress - thirdPhaseStart) /
          (scaleTransitionEnd - thirdPhaseStart);
        const scale = 1.0 - transitionProgress * 0.3;
        triangleGroupRef.current.scale.set(scale, scale, scale);
      } else {
        triangleGroupRef.current.scale.set(0.7, 0.7, 0.7);
      }
    }

    // 第3段階：動画カード群の回転（左回転）
    if (videoCardsRef.current) {
      const thirdPhaseStart = 0.5;
      const thirdPhaseEnd = 0.75;
      const thirdPhase = THREE.MathUtils.clamp(
        (scrollProgress - thirdPhaseStart) / (thirdPhaseEnd - thirdPhaseStart),
        0,
        1
      );
      const videoStartProgress = 0.57;
      if (scrollProgress >= videoStartProgress) {
        // 回転量は必要に応じて係数を小さくしてOK
        videoCardsRef.current.rotation.y = thirdPhase * Math.PI;
        videoCardsRef.current.visible = true;
      } else {
        videoCardsRef.current.visible = false;
      }
    }

    // 第4段階：黒円の拡大
    if (circleRef.current) {
      const thirdPhaseStart = 0.5;
      const thirdPhaseEnd = 0.75;
      const thirdPhase = THREE.MathUtils.clamp(
        (scrollProgress - thirdPhaseStart) / (thirdPhaseEnd - thirdPhaseStart),
        0,
        1
      );
      const allCardsFaded = thirdPhase >= 0.9;

      const fourthPhaseStart = 0.75;
      const fourthPhase = Math.max(
        (scrollProgress - fourthPhaseStart) / (1 - fourthPhaseStart),
        0
      );

      if (allCardsFaded && scrollProgress >= fourthPhaseStart) {
        const scale = 15 * fourthPhase;
        circleRef.current.scale.set(scale, scale, 1);
      } else {
        circleRef.current.scale.set(0, 0, 1);
      }
    }

    // 星の回転
    if (starGroupRef.current) {
      starGroupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <>
      <color attach="background" args={["black"]} />

      {/* ルート：一括スケール */}
      <group ref={rootRef}>
        <group ref={starGroupRef}>
          <Suspense fallback={null}>
            <StarParticles selfRotate={false} position={[0, 0, -10]} />
          </Suspense>
        </group>

        <group ref={triangleGroupRef} position={[0, 0, 2]}>
          <mesh renderOrder={10}>
            <tetrahedronGeometry args={[1.5, 0]} />
            <heroShaderMaterial ref={materialRef} transparent={false} />
          </mesh>
          <primitive object={lineSegments} renderOrder={11} />
        </group>

        {/* 動画カード群：表示も消えるのも「右回転順」で“常に1枚ずつ” */}
        <group ref={videoCardsRef} renderOrder={5}>
          <Suspense fallback={null}>
            {layout.items.map(({ index, angle, x, z }) => {
              // 進行度
              const thirdPhaseStart = 0.5;
              const thirdPhaseEnd = 0.75;
              const videoStartProgress = 0.57;

              // videoStart からの 0..1
              const tLocal = THREE.MathUtils.clamp(
                (scrollProgress - videoStartProgress) /
                  (thirdPhaseEnd - videoStartProgress),
                0,
                1
              );

              const n = layout.n;
              const appearRank = layout.rankReverse.get(index)!; // 右回転順（登場・退場ともこの順）
              const appearSpan = 0.5; // 前半: 登場
              const fadeSpan = 0.5; // 後半: 退場
              const perAppear = appearSpan / n;
              const perFade = fadeSpan / n;
              const fadeFrac = 0.8; // フェードに使う割合

              let opacity = 0;

              if (tLocal <= 0) {
                opacity = 0;
              } else if (tLocal < appearSpan) {
                // === 登場（右回転順）：常に1枚だけフェード中 ===
                let idx = Math.floor(tLocal / perAppear);
                idx = Math.min(idx, n - 1); // 端数安全
                const slotT = (tLocal - idx * perAppear) / perAppear; // 0..1

                if (appearRank < idx) {
                  opacity = 1; // 既に出終わった
                } else if (appearRank === idx) {
                  opacity = smooth01(slotT / fadeFrac); // 今フェードイン中の1枚
                } else {
                  opacity = 0; // まだ
                }
              } else {
                // === 退場（右回転順）：常に1枚だけフェード中 ===
                const tf = (tLocal - appearSpan) / fadeSpan; // 0..1
                let idx = Math.floor(tf / perFade);
                idx = Math.min(idx, n - 1);
                const slotT = (tf - idx * perFade) / perFade; // 0..1

                if (appearRank < idx) {
                  opacity = 0; // 既に消えた
                } else if (appearRank === idx) {
                  opacity = 1 - smooth01(slotT / fadeFrac); // 今フェードアウト中の1枚
                } else {
                  opacity = 1; // まだ残る
                }
              }

              // VideoCard3D 内の演出用（必要なら）
              const thirdPhase = THREE.MathUtils.clamp(
                (scrollProgress - thirdPhaseStart) /
                  (thirdPhaseEnd - thirdPhaseStart),
                0,
                1
              );

              return (
                <VideoCard3D
                  key={videoSlides[index].id}
                  videoSrc={videoSlides[index].mp4}
                  title={videoSlides[index].title}
                  position={[x, 0, z]}
                  rotation={[0, angle + Math.PI, 0]}
                  isActive={opacity > 0.05}
                  progress={opacity > 0.05 ? thirdPhase : 0}
                  scale={1}
                  opacity={opacity}
                />
              );
            })}
          </Suspense>
        </group>

        <mesh ref={circleRef} position={[0, 0, 0.1]} renderOrder={4}>
          <circleGeometry args={[1, 64]} />
          <meshBasicMaterial color="black" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}

// HeroCanvas
const HeroCanvas = ({ children }: { children: ReactNode }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollTop / docHeight;
      setScrollProgress(Math.min(scrolled, 1));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 75 }}
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
        <HeroScene scrollProgress={scrollProgress} />
      </Canvas>

      <div style={{ position: "relative", zIndex: 1, minHeight: "1000vh" }}>
        {children}
      </div>
    </>
  );
};

export default HeroCanvas;
