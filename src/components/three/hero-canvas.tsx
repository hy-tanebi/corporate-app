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

// ===== 全体スケール =====
const SCENE_SCALE = 0.8;

// ===== パラメータ =====
const GAP_TURNS = 0.15; // 出現→消失のギャップ（回転回数）
const FADE_FRAC = 0.7; // フェード割合（各スロット内 0..1）
const TAU = Math.PI * 2;

const THIRD_PHASE_START = 0.5;
const THIRD_PHASE_END = 0.75;
const VIDEO_START_PROGRESS = 0.57; // 表示開始

// ===== シェーダ =====
const HeroShaderMaterial = shaderMaterial(
  { uTime: 0, uMouse: [0, 0], uResolution: [0, 0] },
  vertexShader,
  fragmentShader
);
extend({ HeroShaderMaterial });

// ===== 動画データ =====
const videoSlides = [
  {
    id: "slide-1",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "プロジェクト 1",
    description: "",
  },
  {
    id: "slide-2",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "プロジェクト 2",
    description: "",
  },
  {
    id: "slide-3",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "プロジェクト 3",
    description: "",
  },
  {
    id: "slide-4",
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    title: "プロジェクト 4",
    description: "",
  },
];

function HeroScene({ scrollProgress }: { scrollProgress: number }) {
  const materialRef = useRef<any>(null);
  const starGroupRef = useRef<THREE.Group>(null);
  const triangleGroupRef = useRef<THREE.Group>(null);
  const circleRef = useRef<THREE.Mesh>(null);
  const videoCardsRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);

  // ===== レイアウト（ゲートは左：-90°、右回転順）=====
  const gateAngle = -Math.PI / 2;
  const radius = 4;

  const layout = useMemo(() => {
    const n = videoSlides.length;
    const slotStep = TAU / n;
    const items = Array.from({ length: n }, (_, i) => {
      const angle = gateAngle - (i / n) * TAU; // 右回転順
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      return { index: i, angle, x, z, rank: i };
    });
    return { n, items, slotStep };
  }, []);

  // ===== 表示開始時の thirdPhase と角度オフセット =====
  const thirdPhaseAtStart =
    (VIDEO_START_PROGRESS - THIRD_PHASE_START) /
    (THIRD_PHASE_END - THIRD_PHASE_START); // 例: 0.28
  const availablePhase = Math.max(0, 1 - thirdPhaseAtStart); // 例: 0.72

  // ===== 退場完了まで“必要な回転数”を算出し、表示時間尺に合わせて自動調整 =====
  const requiredTurns = useMemo(() => {
    const { n } = layout;
    // 出現1回転 + ギャップ + 最後のカードが消え切るまでの分
    const fadeTurnsLast = (n - 1 + FADE_FRAC) / n; // 例: n=4, 0.925
    return 1 + GAP_TURNS + fadeTurnsLast; // 例: 2.075
  }, [layout]);

  const ROT_TURNS = useMemo(() => {
    // 表示開始後に使える進捗幅(=availablePhase)だけで requiredTurns を消化する
    // ほんの少し余裕(5%)を持たせる
    return (requiredTurns / Math.max(0.0001, availablePhase)) * 1.05;
  }, [requiredTurns, availablePhase]);

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

    // 三角形演出
    if (triangleGroupRef.current) {
      triangleGroupRef.current.rotation.x += delta * 0.1;
      triangleGroupRef.current.rotation.y += delta * 0.2;

      if (scrollProgress < THIRD_PHASE_START) {
        triangleGroupRef.current.scale.set(1, 1, 1);
      } else if (scrollProgress <= 0.55) {
        const t =
          (scrollProgress - THIRD_PHASE_START) / (0.55 - THIRD_PHASE_START);
        const s = 1.0 - t * 0.3;
        triangleGroupRef.current.scale.set(s, s, s);
      } else {
        triangleGroupRef.current.scale.set(0.7, 0.7, 0.7);
      }
    }

    // カード群の回転（左回転）
    if (videoCardsRef.current) {
      const thirdPhase = THREE.MathUtils.clamp(
        (scrollProgress - THIRD_PHASE_START) /
          (THIRD_PHASE_END - THIRD_PHASE_START),
        0,
        1
      );
      if (scrollProgress >= VIDEO_START_PROGRESS) {
        const thetaRaw = thirdPhase * TAU * ROT_TURNS;
        videoCardsRef.current.rotation.y = thetaRaw;
        videoCardsRef.current.visible = true;
      } else {
        videoCardsRef.current.visible = false;
      }
    }

    // 黒円の拡大：★ 全カード消滅後のみ
    if (circleRef.current) {
      const thirdPhase = THREE.MathUtils.clamp(
        (scrollProgress - THIRD_PHASE_START) /
          (THIRD_PHASE_END - THIRD_PHASE_START),
        0,
        1
      );
      const thetaRaw = thirdPhase * TAU * ROT_TURNS;
      const thetaStart = thirdPhaseAtStart * TAU * ROT_TURNS;
      const thetaRel = Math.max(0, thetaRaw - thetaStart);

      // 全カード消滅が完了する角度
      const fadeAllDoneTheta = requiredTurns * TAU;

      if (thetaRel >= fadeAllDoneTheta) {
        // 好みで拡大スピードを thirdPhase 連動に（または thetaRel ベースでもOK）
        const t = THREE.MathUtils.clamp(
          (thetaRel - fadeAllDoneTheta) / (TAU * 0.2),
          0,
          1
        ); // 0.2周で最大まで
        const s = 15 * t;
        circleRef.current.scale.set(s, s, 1);
      } else {
        circleRef.current.scale.set(0, 0, 1);
      }
    }

    if (starGroupRef.current) {
      starGroupRef.current.rotation.y += 0.0005;
    }
  });

  // ====== 描画（ステートレス） ======
  const renderCards = () => {
    const thirdPhase = THREE.MathUtils.clamp(
      (scrollProgress - THIRD_PHASE_START) /
        (THIRD_PHASE_END - THIRD_PHASE_START),
      0,
      1
    );
    const thetaRaw = thirdPhase * TAU * ROT_TURNS;

    // 表示開始を0起点に
    const thetaStart = thirdPhaseAtStart * TAU * ROT_TURNS;
    const thetaRel = Math.max(0, thetaRaw - thetaStart);

    const { slotStep } = layout;

    // フェーズ境界
    const appearStart = 0;
    const appearEnd = TAU;
    const holdEnd = TAU * (1 + GAP_TURNS);
    const fadeEnd = requiredTurns * TAU; // = 1周 + ギャップ + 最後のカードの消失完了

    return layout.items.map(({ index, angle, x, z, rank }) => {
      // rankごとのトリガ角
      const appearAt = rank * slotStep;
      const fadeInEnd = appearAt + slotStep * FADE_FRAC;

      const fadeStartAt = TAU * (1 + GAP_TURNS) + rank * slotStep;
      const fadeOutEnd = fadeStartAt + slotStep * FADE_FRAC;

      let opacity = 0;

      // A) 出現（0..TAU）
      if (thetaRel >= appearStart && thetaRel < appearEnd) {
        if (thetaRel < appearAt) opacity = 0;
        else if (thetaRel < fadeInEnd) {
          const k = (thetaRel - appearAt) / (slotStep * FADE_FRAC);
          opacity = smooth01(THREE.MathUtils.clamp(k, 0, 1));
        } else {
          opacity = 1;
        }
      }
      // B) 保持（TAU..TAU*(1+GAP_TURNS)）
      else if (thetaRel >= appearEnd && thetaRel < holdEnd) {
        opacity = 1;
      }
      // C) 退場（TAU*(1+GAP_TURNS)..fadeEnd）
      else if (thetaRel >= holdEnd && thetaRel < fadeEnd) {
        if (thetaRel < fadeStartAt) opacity = 1;
        else if (thetaRel < fadeOutEnd) {
          const k = (thetaRel - fadeStartAt) / (slotStep * FADE_FRAC);
          opacity = 1 - smooth01(THREE.MathUtils.clamp(k, 0, 1));
        } else opacity = 0;
      }
      // D) それ以降は 0
      else opacity = 0;

      return (
        <VideoCard3D
          key={videoSlides[index].id}
          videoSrc={videoSlides[index].mp4}
          title={videoSlides[index].title}
          position={[x, 0, z]}
          rotation={[0, angle + Math.PI, 0]}
          isActive={opacity > 0.05}
          progress={thirdPhase}
          scale={1}
          opacity={opacity}
        />
      );
    });
  };

  return (
    <>
      <color attach="background" args={["black"]} />
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

        {/* ▼ カード群（回転中心合わせのため z=-2） */}
        <group ref={videoCardsRef} renderOrder={5} position={[0, 0, -2]}>
          <Suspense fallback={null}>{renderCards()}</Suspense>
        </group>

        <mesh ref={circleRef} position={[0, 0, 0.1]} renderOrder={4}>
          <circleGeometry args={[1, 64]} />
          <meshBasicMaterial color="black" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}

// ===== HeroCanvas =====
const HeroCanvas = ({ children }: { children: ReactNode }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollTop / docHeight;
      setScrollProgress(Math.min(Math.max(scrolled, 0), 1));
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
