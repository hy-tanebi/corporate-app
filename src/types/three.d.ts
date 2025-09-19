// src/types/three.d.ts
import type { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

// 既存
declare class HeroShaderMaterial extends THREE.ShaderMaterial {
  uTime: number;
  uMouse: [number, number] | THREE.Vector2;
  uResolution: [number, number] | THREE.Vector2;
}

declare class StarShaderMaterial extends THREE.ShaderMaterial {
  uTime: number;
  uMouse: THREE.Vector2;
  uTexture: THREE.Texture;
  uSize: number;
}

// ★ 追加: マウス周辺だけ歪ませるオーバーレイ用
declare class HoverFluidMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uScene: { value: THREE.Texture | null };
    uResolution: { value: THREE.Vector2 };
    uMouse: { value: THREE.Vector2 };
    uTime: { value: number };
    uIntensity: { value: number };
    uRadius: { value: number };
    uFalloff: { value: number };
    uDispAmp: { value: number };
    uNoiseAmp: { value: number };
    uShowMask: { value: number };
  };
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
      starShaderMaterial: Object3DNode<StarShaderMaterial, typeof StarShaderMaterial>;
      // ★ 追加
      hoverFluidMaterial: Object3DNode<HoverFluidMaterial, typeof HoverFluidMaterial>;
    }
  }
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
    starShaderMaterial: Object3DNode<StarShaderMaterial, typeof StarShaderMaterial>;
    // ★ 追加
    hoverFluidMaterial: Object3DNode<HoverFluidMaterial, typeof HoverFluidMaterial>;
  }
}
// --- add: ScreenDistortMaterial 型定義 ---
import type { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

declare class ScreenDistortMaterial extends THREE.ShaderMaterial {
  uScene: THREE.Texture | null;
  uResolution: THREE.Vector2;
  uMouse: THREE.Vector2;
  uTime: number;
  uIntensity: number;
  uNoise: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      screenDistortMaterial: Object3DNode<ScreenDistortMaterial, typeof ScreenDistortMaterial>;
    }
  }
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    screenDistortMaterial: Object3DNode<ScreenDistortMaterial, typeof ScreenDistortMaterial>;
  }
}

// --- add: ScreenDistortMaterial 型定義 ---
import type { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

declare class ScreenDistortMaterial extends THREE.ShaderMaterial {
  uScene: THREE.Texture | null;
  uResolution: THREE.Vector2;
  uMouse: THREE.Vector2;
  uTime: number;
  uIntensity: number;
  uNoise: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      screenDistortMaterial: Object3DNode<ScreenDistortMaterial, typeof ScreenDistortMaterial>;
    }
  }
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    screenDistortMaterial: Object3DNode<ScreenDistortMaterial, typeof ScreenDistortMaterial>;
  }
}
