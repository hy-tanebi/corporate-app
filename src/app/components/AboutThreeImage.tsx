"use client";

import { Canvas, extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect } from "react";

// --- Shader Definition ---
const AboutImageShaderMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(), // Fix: Initialize with empty texture to avoid type error
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1), // Canvas Size
    uImageResolution: new THREE.Vector2(1, 1), // Image Size
    uGhostOffset: new THREE.Vector2(0.015, 0.007), // Slightly reduced offset
    uHover: 0,
    uScale: 1.0, // Zoom Scale ( > 1.0 = Zoom Out)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      // Force Full Screen (Clip Space -1..1) ignoring Camera
      // PlaneGeometry(2,2) spans -1..1, so position.xy maps perfectly
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;      // Screen (Canvas) Resolution
    uniform vec2 uImageResolution; // Image Resolution
    uniform vec2 uGhostOffset;
    uniform float uHover;
    uniform float uScale;

    varying vec2 vUv;

    // --- Noise (Simplified FBM) ---
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for(int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    // --- UV Cover Function ---
    vec2 getCoverUV(vec2 uv, vec2 resolution, vec2 texResolution) {
      float sAspect = resolution.x / resolution.y;
      float iAspect = texResolution.x / texResolution.y;

      vec2 scale = vec2(1.0);
      if (sAspect > iAspect) {
         // Screen wider. Crop top/bottom.
         // Y needs to be compressed (0..1 maps to 0.2..0.8).
         scale = vec2(1.0, iAspect / sAspect);
      } else {
         // Screen taller. Crop left/right.
         scale = vec2(sAspect / iAspect, 1.0);
      }

      return (uv - 0.5) * scale + 0.5;
    }

    void main() {
      // 1. Base UV (Stretched to Screen)
      // To show "Whole Image" and "Full Screen" without margins, we must stretch.
      // So use vUv directly (0..1 maps to Screen 0..1 maps to Texture 0..1).
      // If we want to zoom out, calculate relative to center.
      // But user complained about margins. So assume fit 100%.

      vec2 finalUV = (vUv - 0.5) * uScale + 0.5;

      // 3. Bounds Check
      if (finalUV.x < 0.0 || finalUV.x > 1.0 || finalUV.y < 0.0 || finalUV.y > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
      }

      // --- Interaction Logic ---
      // Aspect Corrected distance for round circle
      vec2 aspectUv = vUv * uResolution;
      vec2 aspectMouse = uMouse * uResolution;
      float dist = distance(aspectUv, aspectMouse);

      float radius = 0.18;
      float falloff = 0.15;
      float mask = 1.0 - smoothstep(radius, radius + falloff, dist);
      mask *= uHover;

      float time = uTime * 0.5;
      float distortionScale = 6.0;
      float distortionStrength = 0.08 * mask;

      vec2 noiseUV = vUv * distortionScale + time;
      float n = fbm(noiseUV);

      // Ghost UV (Stretched)
      vec2 ghostBaseUV = (vUv - uGhostOffset - 0.5) * uScale + 0.5;

      // Distortion
      vec2 distortedGhostUV = ghostBaseUV + (vec2(n) - 0.5) * distortionStrength;
      distortedGhostUV = clamp(distortedGhostUV, 0.0, 1.0);

      vec4 baseCol = texture2D(uTexture, finalUV);
      vec4 ghostCol = texture2D(uTexture, distortedGhostUV);

      vec4 finalCol = mix(baseCol, ghostCol, mask * 0.8);
      gl_FragColor = finalCol;
    }
  `
);

extend({ AboutImageShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    aboutImageShaderMaterial: ThreeElement<typeof AboutImageShaderMaterial>;
  }
}

const ImageMesh = ({ imageSrc }: { imageSrc: string }) => {
  const texture = useTexture(imageSrc);
  // biome-ignore lint/suspicious/noExplicitAny: Shader material type
  const materialRef = useRef<any>(null);
  const { size } = useThree(); // Canvas size in pixels

  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const hoverStrength = useRef(0);

  // Update Resolution Uniforms
  useEffect(() => {
    if (materialRef.current && texture) {
        materialRef.current.uImageResolution.set(texture.image.width, texture.image.height);
    }
  }, [texture]);

  useFrame((_state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;

      // Update Screen Resolution (Aspect Ratio, 1.0)
      const aspect = size.width / size.height;
      materialRef.current.uResolution.set(aspect, 1.0);

      materialRef.current.uMouse.lerp(mouse.current, 0.1);
      materialRef.current.uHover += (hoverStrength.current - materialRef.current.uHover) * 0.1;
    }
  });

  return (
    <mesh
      onPointerMove={(e) => {
        if (e.uv) {
          mouse.current.set(e.uv.x, e.uv.y);
          hoverStrength.current = 1;
        }
      }}
      onPointerLeave={() => {
        hoverStrength.current = 0;
      }}
    >
      <planeGeometry args={[2, 2]} />
      <aboutImageShaderMaterial
        ref={materialRef}
        uTexture={texture}
        transparent
        uScale={1.0}
      />
    </mesh>
  );
};

export default function AboutThreeImage({ imageSrc }: { imageSrc: string }) {
  return (
    <div className="w-full h-full relative">
        <Canvas
            camera={{ position: [0, 0, 1], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <ImageMesh imageSrc={imageSrc} />
        </Canvas>
    </div>
  );
}
