// src/components/three/VideoCard3D.tsx
"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader, VideoTexture } from "three";
import * as THREE from "three";

interface VideoCard3DProps {
  videoSrc?: string;
  imageSrc?: string;
  mediaType: "image" | "video";
  title: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
  progress: number;
  scale?: number;
  opacity?: number;
}

export default function VideoCard3D({
  videoSrc,
  imageSrc,
  mediaType,
  title,
  position,
  rotation,
  isActive,
  progress,
  scale = 1,
  opacity = 1,
}: VideoCard3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTexture = useRef<VideoTexture | null>(null);
  const imageTexture = useRef<THREE.Texture | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  // ── テクスチャのセットアップ ──────────────────────────────
  useEffect(() => {
    // cleanup
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current = null;
    }
    if (videoTexture.current) {
      videoTexture.current.dispose();
      videoTexture.current = null;
    }
    if (imageTexture.current) {
      imageTexture.current.dispose();
      imageTexture.current = null;
    }
    setTextureLoaded(false);

    if (mediaType === "video" && videoSrc) {
      const video = document.createElement("video");
      video.src = videoSrc;
      video.crossOrigin = "anonymous";
      video.loop = false;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";

      videoRef.current = video;
      const tex = new VideoTexture(video);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;

      // あなたの現行値を踏襲
      tex.flipY = true;
      // @ts-ignore
      if ("colorSpace" in tex) (tex as any).colorSpace = THREE.SRGBColorSpace;

      videoTexture.current = tex;
      setTextureLoaded(true);
    } else if (mediaType === "image" && imageSrc) {
      const loader = new TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(
        imageSrc,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = true;
          texture.flipY = true;
          // @ts-ignore
          if ("colorSpace" in texture)
            (texture as any).colorSpace = THREE.SRGBColorSpace;
          imageTexture.current = texture;
          setTextureLoaded(true);
        },
        undefined,
        (error) => {
          console.error("画像の読み込みに失敗:", imageSrc, error);
        }
      );
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
      if (videoTexture.current) videoTexture.current.dispose();
      if (imageTexture.current) imageTexture.current.dispose();
    };
  }, [videoSrc, imageSrc, mediaType]);

  // ── 動画の再生制御 ────────────────────────────────────────
  useEffect(() => {
    if (mediaType !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    if (isActive && progress > 0) {
      const duration = video.duration || 10;
      const targetTime = progress * duration * 0.7;
      if (Math.abs(video.currentTime - targetTime) > 0.1) {
        video.currentTime = targetTime;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      if (!video.paused) video.pause();
    }
  }, [isActive, progress, mediaType]);


  // ── 漂い・微回転 ───────────────────────────────────────────
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.z =
        rotation[2] + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  const currentTexture =
    mediaType === "video" ? videoTexture.current : imageTexture.current;

  // ── 透過で“抜ける”のを防ぐ：マテリアル設定を明示 ───────────────
  // 不透明閾値。ここを 0.999 のように高めに取ると、ほぼ1のときは完全不透明で描く
  const OPAQUE_THRESH = 0.999;

  const mediaFrontMat = useMemo(() => {
    const isOpaque = opacity >= OPAQUE_THRESH;
    const mat = new THREE.MeshBasicMaterial({
      map: currentTexture || null,
      opacity,
      transparent: !isOpaque,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: isOpaque,
      alphaTest: isOpaque ? 0.0 : 0.001,
    });

    // テクスチャのアスペクト比を保持してフィットさせる
    if (currentTexture) {
      currentTexture.wrapS = THREE.ClampToEdgeWrapping;
      currentTexture.wrapT = THREE.ClampToEdgeWrapping;
      currentTexture.repeat.set(1, 1);
      currentTexture.offset.set(0, 0);
      currentTexture.center.set(0.5, 0.5);
      currentTexture.needsUpdate = true;
    }
    mat.needsUpdate = true;
    return mat;
  }, [currentTexture, opacity]);

  const mediaBackMat = useMemo(() => {
    const isOpaque = opacity >= OPAQUE_THRESH;
    const mat = new THREE.MeshBasicMaterial({
      map: currentTexture || null,
      opacity,
      transparent: !isOpaque,
      side: THREE.FrontSide, // 回転で背面側を“表”として描く
      depthTest: true,
      depthWrite: isOpaque,
      alphaTest: isOpaque ? 0.0 : 0.001,
    });
    
    if (currentTexture) {
      currentTexture.wrapS = THREE.ClampToEdgeWrapping;
      currentTexture.wrapT = THREE.ClampToEdgeWrapping;
      currentTexture.repeat.set(1, 1);
      currentTexture.offset.set(0, 0);
      currentTexture.center.set(0.5, 0.5);
      currentTexture.needsUpdate = true;
    }
    mat.needsUpdate = true;
    return mat;
  }, [currentTexture, opacity]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* いままで通り：+Z が外側に向くよう内側グループを 180° */}
      <group rotation={[0, Math.PI, 0]}>
        {opacity > 0 && (
          <>
            {/* メディア前面（+Z） */}
            <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={21}>
              <planeGeometry args={[4, 2]} />
              <primitive object={mediaFrontMat} attach="material" />
            </mesh>

            {/* メディア背面（-Z 側から読めるよう反転） */}
            <mesh
              position={[0, 0, -0.001]}
              rotation={[0, Math.PI, 0]}
              renderOrder={20}
            >
              <planeGeometry args={[4, 2]} />
              <primitive object={mediaBackMat} attach="material" />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
