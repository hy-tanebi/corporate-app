// src/types/three.d.ts

import type { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

// HeroShaderMaterial の型定義
declare class HeroShaderMaterial extends THREE.ShaderMaterial {
  uTime: number;
  uMouse: [number, number];
  uResolution: [number, number];
}

// StarShaderMaterial の型定義を追加
declare class StarShaderMaterial extends THREE.ShaderMaterial {
  uTime: number;
  uMouse: THREE.Vector2;
  uTexture: THREE.Texture;
  uSize: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
      // StarShaderMaterial の JSX 型定義を追加
      starShaderMaterial: Object3DNode<StarShaderMaterial, typeof StarShaderMaterial>;
    }
  }
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
    // StarShaderMaterial の ThreeElements 型定義を追加
    starShaderMaterial: Object3DNode<StarShaderMaterial, typeof StarShaderMaterial>;
  }
}

