// src/components/three/hero-canvas.tsx
"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial, useFBO } from "@react-three/drei";
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

// 分離した“水っぽい”エフェクト用シェーダ
import hoverFluidVert from "../../../public/shaders/hover-fluid-vertex.glsl?raw";
import hoverFluidFrag from "../../../public/shaders/hover-fluid-fragment.glsl?raw";

// ===== 全体スケール =====
const SCENE_SCALE = 1.2;

// ===== パラメータ =====
const CAMERA_Z = 5.2;
const ROOT_Z_OFFSET = 0.6;

const GAP_TURNS = 0.15;
const FADE_FRAC = 0.7;
const TAU = Math.PI * 2;

// ===== 動画フェーズ =====
const THIRD_PHASE_START = 0.5;
const THIRD_PHASE_END = 0.88;
const VIDEO_START_PROGRESS = 0.57;

// ===== イージング・慣性 =====
const VIDEO_EASE = 5.0;
const CARD_DWELL_FRAC = 0.95;
const VIDEO_ROT_INERTIA = 2.0;

// ===== 黒円/リターン =====
const RETURN_SCROLL_START = 0.82;
const RETURN_SCROLL_END = 0.86;
const CIRCLE_SCROLL_START = RETURN_SCROLL_END + 0.005;
const CIRCLE_SCROLL_END = 0.9995;
const CIRCLE_SMOOTH_EXPAND = 0.25;
const CIRCLE_SMOOTH_SHRINK = 18.0;
const CIRCLE_EASE = 1.0;

// 円の見え方
const CIRCLE_FEATHER = 0.18;
const tetraRadius = 1.5;
const HIDE_TRI_AT_RADIUS = tetraRadius * 1.02;
const HIDE_BG_AT_T = 0.98;

// ===== ユーティリティ =====
const smooth01 = (x: number) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
const sstep = (x: number, a: number, b: number) =>
  THREE.MathUtils.clamp((x - a) / Math.max(1e-6, b - a), 0, 1);

// 直後のセンター(次のスロット中心)へ丸める
const snapToNextCenter = (theta: number, slotStep: number, offset: number) => {
  const s = Math.max(1e-6, slotStep);
  return offset + Math.ceil((theta - offset) / s) * s;
};

// ===== テトラ用シェーダ =====
const HeroShaderMaterial = shaderMaterial(
  { uTime: 0, uMouse: [0, 0], uResolution: [0, 0] },
  vertexShader,
  fragmentShader
);
extend({ HeroShaderMaterial });

/**
 * マウス周辺＋速度方向を“水っぽく”屈折させるオーバーレイ（小さめ）
 * - FBO を Linear にしておき、シェーダではデコードしない（色ズレ無し）
 */
const HoverFluidMaterial = shaderMaterial(
  {
    uScene: null as unknown as THREE.Texture,
    uResolution: new THREE.Vector2(1, 1),

    // ポインター（0..1, 上向きY）
    uMouse: new THREE.Vector2(0.5, 0.5),
    uVel: new THREE.Vector2(0, 0), // 速度（UV/秒）

    uTime: 0,
    uIntensity: 0, // move時に1→減衰

    // 影響半径（小さめ）とソフト幅（UV）
    uRadius: 0.08,
    uFalloff: 0.12,

    // 水っぽさ（控えめ）
    uDispAmp: 0.05,
    uNoiseAmp: 0.45,

    // ベース“薄いとろみ”
    uBaseAmp: 0.015,
    uBaseScale: 1.2,

    // ヒーロー領域（自動更新）
    uHeroCenter: new THREE.Vector2(0.5, 0.5),
    uHeroSize: new THREE.Vector2(0.35, 0.22), // 半サイズ
    uHeroRadius: 0.06,

    // 色収差（色ズレ防止のため 0）
    uChromAb: 0.0,

    // デバッグ
    uShowMask: 0,
  },
  hoverFluidVert,
  hoverFluidFrag
);
extend({ HoverFluidMaterial });

// JSX タグ型（types/three.d.tsで定義済みならこのdeclareは削除可）
declare global {
  namespace JSX {
    interface IntrinsicElements {
      hoverFluidMaterial: any;
    }
  }
}

// ===== フェザー付き黒円（暗転用） =====
const FeatherCircleMaterial = shaderMaterial(
  { uColor: new THREE.Color(0x000000), uFeather: CIRCLE_FEATHER },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uFeather;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float alpha = 1.0 - smoothstep(1.0 - uFeather, 1.0, r);
    gl_FragColor = vec4(uColor, alpha);
  }
  `
);

// ===== デフォルト動画 =====
const defaultVideoSlides = [
  {
    id: "fallback-1",
    title: "サンプル プロジェクト 1",
    mediaType: "video" as const,
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    imageSrc: undefined,
    description: "",
  },
  {
    id: "fallback-2",
    title: "サンプル プロジェクト 2",
    mediaType: "video" as const,
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    imageSrc: undefined,
    description: "",
  },
  {
    id: "fallback-3",
    title: "サンプル プロジェクト 3",
    mediaType: "video" as const,
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    imageSrc: undefined,
    description: "",
  },
  {
    id: "fallback-4",
    title: "サンプル プロジェクト 4",
    mediaType: "video" as const,
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    imageSrc: undefined,
    description: "",
  },
];

// ===== カード大きさ =====
const CARD_W = 1.2;
const CARD_H = 0.7;

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

interface HeroSceneProps {
  scrollProgress: number;
  videoSlides: any[];
}

function HeroScene({ scrollProgress, videoSlides }: HeroSceneProps) {
  const heroMatRef = useRef<any>(null);
  const starGroupRef = useRef<THREE.Group>(null);
  const triangleGroupRef = useRef<THREE.Group>(null);
  const triangleVisibleMeshRef = useRef<THREE.Mesh>(null);
  const lineSegmentsRef = useRef<THREE.LineSegments>(null);
  const circleRef = useRef<THREE.Mesh>(null);
  const videoCardsRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);

  // 黒円マテリアル
  const featherMat = useMemo(() => {
    const m = new (FeatherCircleMaterial as any)();
    m.transparent = true;
    m.depthTest = false;
    m.depthWrite = false;
    if (m.uniforms?.uFeather) m.uniforms.uFeather.value = CIRCLE_FEATHER;
    return m;
  }, []);

  // 画面歪み（FBO合成）
  const fluidRef = useRef<THREE.Mesh>(null);
  const hoverMatRef = useRef<any>(null);
  const fbo = useFBO({ samples: 4 });

  // FBO は最初から Linear（＝デコード済み）にする
  useEffect(() => {
    // @ts-ignore (three r165+)
    fbo.texture.colorSpace = THREE.LinearSRGBColorSpace;
  }, [fbo]);

  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lastMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const velSmoothed = useRef(new THREE.Vector2(0, 0));
  const hoverStrength = useRef(0);

  // pointer
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      mouse.current.set(x, y);
      hoverStrength.current = 1; // スパイク → 減衰
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // レイアウト（右回転配置）
  const gateAngle = -Math.PI / 2;
  const centerOffset = -gateAngle;
  const halfDiagCard = Math.sqrt(CARD_W ** 2 + CARD_H ** 2) / 2;
  const orbitRadius = tetraRadius + halfDiagCard + 0.25;

  const layout = useMemo(() => {
    const n = videoSlides.length || 1;
    const slotStep = TAU / n;
    const items = Array.from({ length: n }, (_, i) => {
      const angle = gateAngle - (i / n) * TAU; // 右回転順
      const x = Math.sin(angle) * orbitRadius;
      const z = Math.cos(angle) * orbitRadius;
      return { index: i, angle, x, z, rank: i };
    });
    return { n, items, slotStep };
  }, [orbitRadius, videoSlides.length]);

  // thirdPhase 算出
  const thirdPhaseAtStart =
    (VIDEO_START_PROGRESS - THIRD_PHASE_START) /
    (THIRD_PHASE_END - THIRD_PHASE_START);
  const thirdPhaseAtStartEased = Math.pow(
    smooth01(thirdPhaseAtStart),
    VIDEO_EASE
  );
  const availablePhaseEased = Math.max(0, 1 - thirdPhaseAtStartEased);

  const requiredTurns = useMemo(() => {
    const { n } = layout;
    const fadeTurnsLast = (n - 1 + FADE_FRAC) / n;
    return 1 + GAP_TURNS + fadeTurnsLast;
  }, [layout]);

  const ROT_TURNS = useMemo(() => {
    return (requiredTurns / Math.max(0.0001, availablePhaseEased)) * 1.05;
  }, [requiredTurns, availablePhaseEased]);

  // 正式な登場開始角（ROT_TURNS 反映版）
  const thetaStartDisplayFinal = useMemo(() => {
    const thetaStart =
      Math.pow(
        smooth01(
          (VIDEO_START_PROGRESS - THIRD_PHASE_START) /
            (THIRD_PHASE_END - THIRD_PHASE_START)
        ),
        VIDEO_EASE
      ) *
      TAU *
      ROT_TURNS;

    return dwellWithOffset(
      thetaStart,
      layout.slotStep,
      CARD_DWELL_FRAC,
      centerOffset
    );
  }, [ROT_TURNS, layout.slotStep, centerOffset]);

  // “次のセンター”にバイアスした開始スナップ角（初期化専用）
  const thetaStartNextCenter = useMemo(() => {
    // θ_start_raw を算出
    const t =
      (VIDEO_START_PROGRESS - THIRD_PHASE_START) /
      (THIRD_PHASE_END - THIRD_PHASE_START);
    const eased = Math.pow(smooth01(t), VIDEO_EASE);
    const thetaStartRaw = eased * TAU * ROT_TURNS;
    return snapToNextCenter(thetaStartRaw, layout.slotStep, centerOffset);
  }, [ROT_TURNS, layout.slotStep, centerOffset]);

  // 装飾ライン
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

  // 慣性メモリ
  const smoothedTheta = useRef(0);
  const circleTRef = useRef(0);
  const didInitCards = useRef(false);

  // ヒーロー領域の自動算出用
  const box = useMemo(() => new THREE.Box3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const corners = useMemo(
    () => Array.from({ length: 8 }, () => new THREE.Vector3()),
    []
  );

  // 毎フレーム
  useFrame((state, delta) => {
    // 1) FBOにシーン描画（歪みメッシュは除外）
    if (fluidRef.current) {
      const wasVisible = fluidRef.current.visible;
      fluidRef.current.visible = false;
      state.gl.setRenderTarget(fbo);
      state.gl.clear();
      state.gl.render(state.scene, state.camera);
      state.gl.setRenderTarget(null);
      fluidRef.current.visible = wasVisible;
    }

    // 2) マウス速度（UV/秒）をスムージング
    const m = mouse.current;
    const lm = lastMouse.current;
    const velNow = new THREE.Vector2()
      .subVectors(m, lm)
      .multiplyScalar(1 / Math.max(1e-6, delta));
    velSmoothed.current.lerp(velNow, 0.22); // 粘性
    lastMouse.current.copy(m);

    // 3) ヒーロー領域を自動算出（三角形＋カード群の投影）
    const u = hoverMatRef.current?.uniforms;
    if (u) {
      let minX = 1,
        minY = 1;
      let maxX = -1,
        maxY = -1;
      box.makeEmpty();
      if (triangleGroupRef.current)
        box.expandByObject(triangleGroupRef.current);
      if (videoCardsRef.current) box.expandByObject(videoCardsRef.current);

      const bmin = box.min,
        bmax = box.max;
      const pts = corners;
      pts[0].set(bmin.x, bmin.y, bmin.z);
      pts[1].set(bmax.x, bmin.y, bmin.z);
      pts[2].set(bmin.x, bmax.y, bmin.z);
      pts[3].set(bmax.x, bmax.y, bmin.z);
      pts[4].set(bmin.x, bmin.y, bmax.z);
      pts[5].set(bmax.x, bmin.y, bmax.z);
      pts[6].set(bmin.x, bmax.y, bmax.z);
      pts[7].set(bmax.x, bmax.y, bmax.z);

      for (let i = 0; i < 8; i++) {
        tmp.copy(pts[i]).project(state.camera);
        minX = Math.min(minX, tmp.x);
        maxX = Math.max(maxX, tmp.x);
        minY = Math.min(minY, tmp.y);
        maxY = Math.max(maxY, tmp.y);
      }

      // NDC(-1..1) → UV(0..1)
      const cx = (minX + maxX) * 0.25 + 0.5;
      const cy = (minY + maxY) * 0.25 + 0.5;
      const hx = (maxX - minX) * 0.25;
      const hy = (maxY - minY) * 0.25;

      // 少しだけパディング
      const pad = 0.06;
      u.uHeroCenter.value.set(
        THREE.MathUtils.clamp(cx, 0.0, 1.0),
        THREE.MathUtils.clamp(cy, 0.0, 1.0)
      );
      u.uHeroSize.value.set(
        THREE.MathUtils.clamp(hx + pad, 0.0, 0.5),
        THREE.MathUtils.clamp(hy + pad, 0.0, 0.5)
      );
      u.uHeroRadius.value = 0.06;

      // マテリアル更新
      const dpr = state.gl.getPixelRatio();
      u.uTime.value += delta;
      u.uScene.value = fbo.texture; // Linear のまま
      u.uResolution.value.set(state.size.width * dpr, state.size.height * dpr);

      u.uMouse.value.copy(m);
      u.uVel.value.copy(velSmoothed.current);

      // 止まるとすぐ収束（減衰強め）
      hoverStrength.current = Math.max(0, hoverStrength.current - delta * 1.8);
      u.uIntensity.value = hoverStrength.current;

      // 影響と強度（小さめ）
      u.uRadius.value = 0.08;
      u.uFalloff.value = 0.12;
      u.uDispAmp.value = 0.05;
      u.uNoiseAmp.value = 0.45;

      u.uBaseAmp.value = 0.015;
      u.uBaseScale.value = 1.2;

      u.uChromAb.value = 0.0; // 完全オフ
      // u.uShowMask.value = 1; // デバッグ
    }

    // 4) 通常シーン更新
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
      rootRef.current.position.z = ROOT_Z_OFFSET;
    }

    // テトラ回転＆スケール（元ロジック）
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

    // カード回転慣性（初回ズレ修正＋順序そのまま）
    if (videoCardsRef.current) {
      const phaseLin = THREE.MathUtils.clamp(
        (scrollProgress - THIRD_PHASE_START) /
          (THIRD_PHASE_END - THIRD_PHASE_START),
        0,
        1
      );
      const phaseEased = Math.pow(smooth01(phaseLin), VIDEO_EASE);

      if (scrollProgress >= VIDEO_START_PROGRESS) {
        // ★ 初回のみ、次スロット中心の少し手前から開始 → 正方向で自然に登場
        if (!didInitCards.current) {
          smoothedTheta.current = thetaStartNextCenter - layout.slotStep * 0.45;
          didInitCards.current = true;
        }

        const thetaRaw = phaseEased * TAU * ROT_TURNS;
        const thetaDwell = dwellWithOffset(
          thetaRaw,
          layout.slotStep,
          CARD_DWELL_FRAC,
          centerOffset
        );
        const kRot = 1 - Math.exp(-delta * VIDEO_ROT_INERTIA);
        smoothedTheta.current += (thetaDwell - smoothedTheta.current) * kRot;

        videoCardsRef.current.rotation.y = smoothedTheta.current;
        videoCardsRef.current.visible = true;

        // 背面が前に来ないよう明示
        videoCardsRef.current.traverse((obj) => {
          const m = (obj as THREE.Mesh)?.material as
            | THREE.Material
            | THREE.Material[]
            | undefined;
          if (!m) return;
          const mats = Array.isArray(m) ? m : [m];
          for (const mat of mats) {
            (mat as any).depthTest = true;
            (mat as any).depthWrite = true;
            (mat as any).transparent = false;
            (mat as any).alphaTest = 0.0;
            (mat as any).side = THREE.FrontSide;
          }
        });
      } else {
        videoCardsRef.current.visible = false;
        didInitCards.current = false; // 閾値を下回ったら再初期化
      }
    }

    // 黒円（復活）
    if (circleRef.current) {
      const endClamped = Math.max(
        CIRCLE_SCROLL_START + 1e-6,
        Math.min(CIRCLE_SCROLL_END, 1.0)
      );
      const tTarget = sstep(scrollProgress, CIRCLE_SCROLL_START, endClamped);
      const speed =
        tTarget >= circleTRef.current
          ? CIRCLE_SMOOTH_EXPAND
          : CIRCLE_SMOOTH_SHRINK;
      const k = 1 - Math.exp(-delta * speed);
      circleTRef.current += (tTarget - circleTRef.current) * k;
      const growT = Math.pow(smooth01(circleTRef.current), CIRCLE_EASE);

      if (growT > 0) {
        if (triangleGroupRef.current) {
          circleRef.current.position
            .copy(triangleGroupRef.current.position)
            .add(new THREE.Vector3(0, 0, 0.15));
        }

        const cam = state.camera as THREE.PerspectiveCamera;
        const dist = cam.position.z - circleRef.current.position.z;
        const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5)) * dist;
        const halfW = halfH * (state.size.width / state.size.height);
        const needRadius = Math.sqrt(halfW * halfW + halfH * halfH);
        const s = THREE.MathUtils.lerp(0.001, needRadius * 1.2, growT);
        circleRef.current.scale.set(s, s, 1);
        circleRef.current.visible = true;

        const hideTri = s >= HIDE_TRI_AT_RADIUS;
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

  // ====== カード描画（“前の順序”ロジック） ======
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
      centerOffset
    );

    const thetaStart =
      Math.pow(
        smooth01(
          (VIDEO_START_PROGRESS - THIRD_PHASE_START) /
            (THIRD_PHASE_END - THIRD_PHASE_START)
        ),
        VIDEO_EASE
      ) *
      TAU *
      ROT_TURNS;

    const thetaStartDisplayLocal = dwellWithOffset(
      thetaStart,
      layout.slotStep,
      CARD_DWELL_FRAC,
      centerOffset
    );

    const thetaRel = Math.max(0, thetaDisplay - thetaStartDisplayLocal);

    const { slotStep } = layout;
    const appearStart = 0;
    const appearEnd = TAU;
    const holdEnd = TAU * (1 + GAP_TURNS);
    const fadeEnd =
      (1 + GAP_TURNS + (layout.n - 1 + FADE_FRAC) / layout.n) * TAU;

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
          imageSrc={videoSlides[index].imageSrc}
          mediaType={videoSlides[index].mediaType || "video"}
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

      {/* ===== 通常シーン ===== */}
      <group ref={rootRef} position={[0, 0, ROOT_Z_OFFSET]}>
        <group ref={starGroupRef}>
          <Suspense fallback={null}>
            <StarParticles selfRotate={false} position={[0, 0, -10]} />
          </Suspense>
        </group>

        {/* テトラ */}
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

        {/* 黒円（暗転） */}
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

      {/* ===== 画面の液体屈折（ヒーロー内のみ作用） ===== */}
      <mesh ref={fluidRef} renderOrder={10000} frustumCulled={false}>
        {/* スクリーン空間メッシュ（頂点で NDC 出力） */}
        <planeGeometry args={[2, 2, 1, 1]} />
        <hoverFluidMaterial
          ref={(m: any) => {
            if (m) hoverMatRef.current = m;
          }}
          attach="material"
          transparent={false}
          depthTest={false}
          depthWrite={false}
          blending={THREE.NoBlending as any}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

// ===== HeroCanvas =====
interface HeroCanvasProps {
  children: ReactNode;
  videoSlides?: any[];
}

const HeroCanvas = ({
  children,
  videoSlides = defaultVideoSlides,
}: HeroCanvasProps) => {
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
        <HeroScene scrollProgress={scrollProgress} videoSlides={videoSlides} />
      </Canvas>

      <div style={{ position: "relative", zIndex: 1, minHeight: "1000vh" }}>
        {children}
      </div>
    </>
  );
};

export default HeroCanvas;
