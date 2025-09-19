import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

import vertexShader from "../../../../public/shaders/top-vertex.glsl?raw";
import fragmentShader from "../../../../public/shaders/top-fragment.glsl?raw";
import hoverFluidVert from "../../../../public/shaders/hover-fluid-vertex.glsl?raw";
import hoverFluidFrag from "../../../../public/shaders/hover-fluid-fragment.glsl?raw";

// ===== テトラ用シェーダ =====
export const HeroShaderMaterial = shaderMaterial(
  { uTime: 0, uMouse: [0, 0], uResolution: [0, 0] },
  vertexShader,
  fragmentShader
);

// ===== 画面"水っぽい"オーバーレイ（FBO合成） =====
export const HoverFluidMaterial = shaderMaterial(
  {
    uScene: null as unknown as THREE.Texture,
    uResolution: new THREE.Vector2(1, 1),

    // ポインター（0..1, 上向きY）
    uMouse: new THREE.Vector2(0.5, 0.5),
    uVel: new THREE.Vector2(0, 0),

    uTime: 0,
    uIntensity: 0,

    // 影響半径/ソフト幅
    uRadius: 0.08,
    uFalloff: 0.12,

    // 水っぽさ
    uDispAmp: 0.05,
    uNoiseAmp: 0.45,

    // ベースとろみ
    uBaseAmp: 0.015,
    uBaseScale: 1.2,

    // ヒーロー領域
    uHeroCenter: new THREE.Vector2(0.5, 0.5),
    uHeroSize: new THREE.Vector2(0.35, 0.22),
    uHeroRadius: 0.06,

    uChromAb: 0.0,
    uShowMask: 0,
  },
  hoverFluidVert,
  hoverFluidFrag
);

// ===== フェザー付き黒円（暗転用） =====
export const FeatherCircleMaterial = shaderMaterial(
  { uColor: new THREE.Color(0x000000), uFeather: 0.18 },
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

// Three.js に登録
extend({ 
  HeroShaderMaterial, 
  HoverFluidMaterial, 
  FeatherCircleMaterial 
});

// JSX global augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements {
      heroShaderMaterial: any;
      hoverFluidMaterial: any;
      featherCircleMaterial: any;
    }
  }
}