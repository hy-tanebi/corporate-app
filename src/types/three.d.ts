// src/types/three.d.ts
import type { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

declare class HeroShaderMaterial extends THREE.ShaderMaterial {
  // 型は「uniforms を直参照しない」シンプル版でOK
  uTime: number;
  uMouse: [number, number];
  uResolution: [number, number];
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
    }
  }
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
  }
}

export {};
