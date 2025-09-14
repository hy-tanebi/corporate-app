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
const SCENE_SCALE = 1.2;

// ===== パラメータ =====
const CAMERA_Z = 5.2;
const ROOT_Z_OFFSET = 0.6;

const GAP_TURNS = 0.15;
const FADE_FRAC = 0.7;
const TAU = Math.PI * 2;

// ===== 動画フェーズ（少し長め） =====
const THIRD_PHASE_START = 0.5;
const THIRD_PHASE_END = 0.88;
const VIDEO_START_PROGRESS = 0.57;

// ===== 動画フェーズのイージング（序盤ゆっくり） =====
const VIDEO_EASE = 5.0;

// === 中央停止 & 回転慣性 ===
const CARD_DWELL_FRAC = 0.95; // 0..1（大きいほど中央で長く停止）
const VIDEO_ROT_INERTIA = 2.0; // 小さいほど“ぬるっと”強く

// ===== 黒円/リターン（“超ゆっくり拡大・やわらかい縮小”） =====
const RETURN_SCROLL_START = 0.82;
const RETURN_SCROLL_END = 0.86;
const CIRCLE_SCROLL_START = RETURN_SCROLL_END + 0.005; // ≒ 0.865
const CIRCLE_SCROLL_END = 0.9995; // ページ終端近くまで
const CIRCLE_SMOOTH_EXPAND = 0.25; // 拡大：超ゆっくり（下げるほどさらに遅い）
const CIRCLE_SMOOTH_SHRINK = 18.0; // 縮小：高速だけど少しだけ慣性あり
const CIRCLE_EASE = 1.0; // 追加イージング（1.0=ほぼ無し）

// 円の見え方（フェザー幅・非表示閾値）
const CIRCLE_FEATHER = 0.18;
const tetraRadius = 1.5;
const HIDE_TRI_AT_RADIUS = tetraRadius * 1.02;
// 暗転感を緩和（背景を遅めに消す）
const HIDE_BG_AT_T = 0.98;

// ===== スムーズ関数 =====
const smooth01 = (x: number) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
const sstep = (x: number, a: number, b: number) =>
  THREE.MathUtils.clamp((x - a) / Math.max(1e-6, b - a), 0, 1);

// ===== シェーダ（テトラ用） =====
const HeroShaderMaterial = shaderMaterial(
  { uTime: 0, uMouse: [0, 0], uResolution: [0, 0] },
  vertexShader,
  fragmentShader
);
extend({ HeroShaderMaterial });

// ===== フェザー付き黒円マテリアル =====
const FeatherCircleMaterial = shaderMaterial(
  { uColor: new THREE.Color(0x000000), uFeather: CIRCLE_FEATHER },
  // vertex
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment
  `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uFeather;
  void main() {
    vec2 p = vUv * 2.0 - 1.0; // 中心(0,0)
    float r = length(p);
    float alpha = 1.0 - smoothstep(1.0 - uFeather, 1.0, r);
    gl_FragColor = vec4(uColor, alpha);
  }
  `
);

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

// ===== カード大きさ =====
const CARD_W = 1.2;
const CARD_H = 0.7;

// === 正面で止めるマッピング ===
function dwellWithOffset(
  theta: number,
  slotStep: number,
  dwellFrac: number,
  offset: number
) {
  if (slotStep <= 0) return theta;

  const s = slotStep;
  const holdHalf = Math.min(0.5, Math.max(0, dwellFrac * 0.5));

  const nearestCenter = offset + Math.round((theta - offset) / s) * s;

  const s2 = s * 0.5;
  let d = theta - nearestCenter;
  if (d > s2) d -= s;
  if (d < -s2) d += s;

  const absd = Math.abs(d);
  const holdWidth = holdHalf * s;

  if (absd <= holdWidth) return nearestCenter;

  const moveRange = s2 - holdWidth;
  const t = (absd - holdWidth) / Math.max(1e-6, moveRange);
  const eased = smooth01(t);
  const newAbs = holdWidth + eased * moveRange;

  return nearestCenter + Math.sign(d) * newAbs;
}

function HeroScene({ scrollProgress }: { scrollProgress: number }) {
  const heroMatRef = useRef<any>(null);
  const starGroupRef = useRef<THREE.Group>(null);
  const triangleGroupRef = useRef<THREE.Group>(null);
  const triangleVisibleMeshRef = useRef<THREE.Mesh>(null);
  const lineSegmentsRef = useRef<THREE.LineSegments>(null);
  const circleRef = useRef<THREE.Mesh>(null);
  const videoCardsRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);

  // ▼ feather マテリアル
  const featherMat = useMemo(() => {
    const m = new (FeatherCircleMaterial as any)();
    m.transparent = true;
    m.depthTest = false;
    m.depthWrite = false;
    if (m.uniforms?.uFeather) m.uniforms.uFeather.value = CIRCLE_FEATHER;
    return m;
  }, []);

  // ===== レイアウト =====
  const gateAngle = -Math.PI / 2; // 左が“ゲート”
  const centerOffset = -gateAngle; // 正面（z+）のセンター角
  const halfDiagCard = Math.sqrt(CARD_W ** 2 + CARD_H ** 2) / 2;
  const orbitRadius = tetraRadius + halfDiagCard + 0.25;

  const layout = useMemo(() => {
    const n = videoSlides.length;
    const slotStep = TAU / n;
    const items = Array.from({ length: n }, (_, i) => {
      const angle = gateAngle - (i / n) * TAU; // 右回転順
      const x = Math.sin(angle) * orbitRadius;
      const z = Math.cos(angle) * orbitRadius;
      return { index: i, angle, x, z, rank: i };
    });
    return { n, items, slotStep };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orbitRadius]);

  // ===== thirdPhase 算出 =====
  const thirdPhaseAtStart =
    (VIDEO_START_PROGRESS - THIRD_PHASE_START) /
    (THIRD_PHASE_END - THIRD_PHASE_START);
  const thirdPhaseAtStartEased = Math.pow(
    smooth01(thirdPhaseAtStart),
    VIDEO_EASE
  );
  const availablePhaseEased = Math.max(0, 1 - thirdPhaseAtStartEased);

  // ===== 退場完了まで“必要な回転数” =====
  const requiredTurns = useMemo(() => {
    const { n } = layout;
    const fadeTurnsLast = (n - 1 + FADE_FRAC) / n;
    return 1 + GAP_TURNS + fadeTurnsLast;
  }, [layout]);

  // ===== 完走する回転数 =====
  const ROT_TURNS = useMemo(() => {
    return (requiredTurns / Math.max(0.0001, availablePhaseEased)) * 1.05;
  }, [requiredTurns, availablePhaseEased]);

  // ===== 装飾ジオメトリ =====
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.TetrahedronGeometry(tetraRadius, 0);
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const hue = position.getY(i) / (tetraRadius * 2) + 0.5;
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

  // ===== 慣性用 =====
  const smoothedTheta = useRef(0); // 動画カード回転
  const circleTRef = useRef(0); // 黒円進捗 0..1（慣性つき）

  // ===== 毎フレーム処理 =====
  useFrame((state, delta) => {
    // シェーダ時間 & 解像度
    if (heroMatRef.current) {
      heroMatRef.current.uniforms.uTime.value += delta;
      heroMatRef.current.uniforms.uMouse.value = [0, 0];
      heroMatRef.current.uniforms.uResolution.value = [
        state.size.width,
        state.size.height,
      ];
    }
    if (rootRef.current) {
      rootRef.current.scale.set(SCENE_SCALE, SCENE_SCALE, SCENE_SCALE);
    }

    // ----- 三角形スケール -----
    if (triangleGroupRef.current) {
      triangleGroupRef.current.rotation.x += delta * 0.1;
      triangleGroupRef.current.rotation.y += delta * 0.2;

      if (scrollProgress < THIRD_PHASE_START) {
        triangleGroupRef.current.scale.set(1, 1, 1);
      } else if (scrollProgress <= 0.55) {
        const t =
          (scrollProgress - THIRD_PHASE_START) / (0.55 - THIRD_PHASE_START);
        const s = THREE.MathUtils.lerp(1.0, 0.7, smooth01(t));
        triangleGroupRef.current.scale.set(s, s, s);
      } else if (scrollProgress < RETURN_SCROLL_START) {
        triangleGroupRef.current.scale.set(0.7, 0.7, 0.7);
      } else if (scrollProgress <= RETURN_SCROLL_END) {
        const tUp = sstep(
          scrollProgress,
          RETURN_SCROLL_START,
          RETURN_SCROLL_END
        );
        const s = THREE.MathUtils.lerp(0.7, 1.0, smooth01(tUp));
        triangleGroupRef.current.scale.set(s, s, s);
      } else {
        triangleGroupRef.current.scale.set(1, 1, 1);
      }
    }

    // ====== 動画カード：中央停止 + ぬるっと慣性 ======
    if (videoCardsRef.current) {
      const phaseLin = THREE.MathUtils.clamp(
        (scrollProgress - THIRD_PHASE_START) /
          (THIRD_PHASE_END - THIRD_PHASE_START),
        0,
        1
      );
      const phaseEased = Math.pow(smooth01(phaseLin), VIDEO_EASE);

      if (scrollProgress >= VIDEO_START_PROGRESS) {
        const thetaRaw = phaseEased * TAU * ROT_TURNS;

        const thetaDwell = dwellWithOffset(
          thetaRaw,
          layout.slotStep,
          CARD_DWELL_FRAC,
          -(-Math.PI / 2) // centerOffset
        );

        const kRot = 1 - Math.exp(-delta * VIDEO_ROT_INERTIA);
        smoothedTheta.current += (thetaDwell - smoothedTheta.current) * kRot;

        videoCardsRef.current.rotation.y = smoothedTheta.current;
        videoCardsRef.current.visible = true;

        videoCardsRef.current.traverse((obj) => {
          const m = (obj as THREE.Mesh)?.material as
            | THREE.Material
            | THREE.Material[]
            | undefined;
          if (!m) return;
          const arr = Array.isArray(m) ? m : [m];
          for (const mat of arr) {
            // @ts-ignore
            if (mat && "depthTest" in mat) {
              // @ts-ignore
              mat.depthTest = true;
              // @ts-ignore
              mat.depthWrite = true;
              // @ts-ignore
              if ("alphaTest" in mat) (mat as any).alphaTest = 0.001;
            }
          }
        });
      } else {
        videoCardsRef.current.visible = false;
      }
    }

    // ===== 黒円：拡大は超ゆっくり、戻りは高速スムージング =====
    if (circleRef.current) {
      const endClamped = Math.max(
        CIRCLE_SCROLL_START + 1e-6,
        Math.min(CIRCLE_SCROLL_END, 1.0)
      );
      const tTarget = sstep(scrollProgress, CIRCLE_SCROLL_START, endClamped);

      // 方向で慣性を切り替え
      const speed =
        tTarget >= circleTRef.current
          ? CIRCLE_SMOOTH_EXPAND // 拡大：とてもゆっくり
          : CIRCLE_SMOOTH_SHRINK; // 縮小：速く追従、でも少しだけ柔らかく
      const k = 1 - Math.exp(-delta * speed);
      circleTRef.current += (tTarget - circleTRef.current) * k;

      const growT = Math.pow(smooth01(circleTRef.current), CIRCLE_EASE);

      if (growT > 0) {
        if (triangleGroupRef.current) {
          circleRef.current.position
            .copy(triangleGroupRef.current.position)
            .add(new THREE.Vector3(0, 0, 0.15));
        }

        // 画面を確実に覆うスケール
        const cam = state.camera as THREE.PerspectiveCamera;
        const dist = cam.position.z - circleRef.current.position.z;
        const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5)) * dist;
        const halfW = halfH * (state.size.width / state.size.height);
        const needRadius = Math.sqrt(halfW * halfW + halfH * halfH);
        const maxScaleScreen = needRadius * 1.2;

        const s = THREE.MathUtils.lerp(0.001, maxScaleScreen, growT);
        circleRef.current.scale.set(s, s, 1);
        circleRef.current.visible = true;

        const radiusNow = s;
        const hideTri = radiusNow >= HIDE_TRI_AT_RADIUS;
        if (triangleVisibleMeshRef.current)
          triangleVisibleMeshRef.current.visible = !hideTri;
        if (lineSegmentsRef.current) lineSegmentsRef.current.visible = !hideTri;
        if (videoCardsRef.current) videoCardsRef.current.visible = !hideTri;

        if (starGroupRef.current)
          starGroupRef.current.visible = growT < HIDE_BG_AT_T;
      } else {
        circleRef.current.visible = false;
        circleRef.current.scale.set(0.001, 0.001, 1);

        if (triangleVisibleMeshRef.current)
          triangleVisibleMeshRef.current.visible = true;
        if (lineSegmentsRef.current) lineSegmentsRef.current.visible = true;
        if (starGroupRef.current) starGroupRef.current.visible = true;
      }
    }

    // 背景スター微回転
    if (starGroupRef.current) {
      starGroupRef.current.rotation.y += 0.0005;
    }
  });

  // ====== 描画（ステートレス） ======
  const renderCards = () => {
    const phaseLin = THREE.MathUtils.clamp(
      (scrollProgress - THIRD_PHASE_START) /
        (THIRD_PHASE_END - THIRD_PHASE_START),
      0,
      1
    );
    const phaseEased = Math.pow(smooth01(phaseLin), VIDEO_EASE);

    const thetaRaw = phaseEased * TAU * ROT_TURNS;
    const thetaDisplay = dwellWithOffset(
      thetaRaw,
      layout.slotStep,
      CARD_DWELL_FRAC,
      -(-Math.PI / 2) // centerOffset と同値
    );

    const thetaStart = thirdPhaseAtStartEased * TAU * ROT_TURNS;
    const thetaStartDisplay = dwellWithOffset(
      thetaStart,
      layout.slotStep,
      CARD_DWELL_FRAC,
      -(-Math.PI / 2)
    );

    const thetaRel = Math.max(0, thetaDisplay - thetaStartDisplay);

    const { slotStep } = layout;
    const appearStart = 0;
    const appearEnd = TAU;
    const holdEnd = TAU * (1 + GAP_TURNS);
    const fadeEnd = requiredTurns * TAU;

    return layout.items.map(({ index, angle, x, z, rank }) => {
      const appearAt = rank * slotStep;
      const fadeInEnd = appearAt + slotStep * FADE_FRAC;
      const fadeStartAt = TAU * (1 + GAP_TURNS) + rank * slotStep;
      const fadeOutEnd = fadeStartAt + slotStep * FADE_FRAC;

      let opacity = 0;
      if (thetaRel >= appearStart && thetaRel < appearEnd) {
        if (thetaRel < appearAt) opacity = 0;
        else if (thetaRel < fadeInEnd) {
          const k = (thetaRel - appearAt) / (slotStep * FADE_FRAC);
          opacity = smooth01(THREE.MathUtils.clamp(k, 0, 1));
        } else {
          opacity = 1;
        }
      } else if (thetaRel >= appearEnd && thetaRel < holdEnd) {
        opacity = 1;
      } else if (thetaRel >= holdEnd && thetaRel < fadeEnd) {
        if (thetaRel < fadeStartAt) opacity = 1;
        else if (thetaRel < fadeOutEnd) {
          const k = (thetaRel - fadeStartAt) / (slotStep * FADE_FRAC);
          opacity = 1 - smooth01(THREE.MathUtils.clamp(k, 0, 1));
        } else opacity = 0;
      } else {
        opacity = 0;
      }

      return (
        <VideoCard3D
          key={videoSlides[index].id}
          videoSrc={videoSlides[index].mp4}
          title={videoSlides[index].title}
          position={[x, 0, z]}
          rotation={[0, angle + Math.PI, 0]}
          isActive={opacity > 0.05}
          progress={phaseEased}
          scale={0.7}
          opacity={opacity}
        />
      );
    });
  };

  return (
    <>
      <color attach="background" args={["black"]} />
      <group ref={rootRef} position={[0, 0, ROOT_Z_OFFSET]}>
        <group ref={starGroupRef}>
          <Suspense fallback={null}>
            <StarParticles selfRotate={false} position={[0, 0, -10]} />
          </Suspense>
        </group>

        {/* テトラ：中心(z=0)に配置 */}
        <group ref={triangleGroupRef} position={[0, 0, 0]}>
          <mesh ref={triangleVisibleMeshRef} renderOrder={10}>
            <tetrahedronGeometry args={[tetraRadius, 0]} />
            <heroShaderMaterial ref={heroMatRef} transparent={false} />
          </mesh>
          <primitive
            ref={lineSegmentsRef}
            object={lineSegments}
            renderOrder={11}
          />
        </group>

        {/* カード群 */}
        <group ref={videoCardsRef} renderOrder={5} position={[0, 0, 0]}>
          <Suspense fallback={null}>{renderCards()}</Suspense>
        </group>

        {/* 黒円（三角形が戻った後に開始） */}
        <mesh
          ref={circleRef}
          position={[0, 0, 0.15]}
          renderOrder={1000}
          frustumCulled={false}
          visible={false}
        >
          <circleGeometry args={[1, 128]} />
          <primitive attach="material" object={featherMat} />
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
      const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(Math.max(scrolled, 0), 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z], fov: 75 }}
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
