import { Object3DNode } from '@react-three/fiber';
import * as THREE from 'three';

// HeroShaderMaterial クラスの型定義
declare class HeroShaderMaterial extends THREE.ShaderMaterial {
  uTime: number;
  uMouse: [number, number];
  uResolution: [number, number];
}

// react-three/fiber の型拡張
declare global {
  namespace JSX {
    interface IntrinsicElements {
      heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
    }
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    heroShaderMaterial: Object3DNode<HeroShaderMaterial, typeof HeroShaderMaterial>;
  }
}