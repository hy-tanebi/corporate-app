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
  /** 画面上で見える角丸半径(px) */
  cornerRadiusPx?: number; // default 5
  /** 画面に描かれるおおよその高さ(px) — 角丸px換算用 */
  displayHeightPx?: number; // default 400
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
  cornerRadiusPx = 5,
  displayHeightPx = 400,
}: VideoCard3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTexture = useRef<VideoTexture | null>(null);
  const imageTexture = useRef<THREE.Texture | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  // ===== カードのワールド寸法（3:2） =====
  const CARD_W = 3;
  const CARD_H = 2;

  // ===== 高解像度の角丸 α マップ（3:2） =====
  const alphaTexture = useMemo(() => {
    const w = 2048;
    const h = 1365; // 2048 * 2/3
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "white";

    // 画面上の px をテクスチャ上のpxに換算
    const radiusTexPx = Math.max(
      1,
      Math.round((cornerRadiusPx * h) / displayHeightPx)
    );

    const r = radiusTexPx;
    const path = new Path2D();
    path.moveTo(r, 0);
    path.lineTo(w - r, 0);
    path.quadraticCurveTo(w, 0, w, r);
    path.lineTo(w, h - r);
    path.quadraticCurveTo(w, h, w - r, h);
    path.lineTo(r, h);
    path.quadraticCurveTo(0, h, 0, h - r);
    path.lineTo(0, r);
    path.quadraticCurveTo(0, 0, r, 0);
    path.closePath();
    ctx.fill(path);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, [cornerRadiusPx, displayHeightPx]);

  // ===== メディアテクスチャのセットアップ =====
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
      tex.flipY = true; // プロジェクト現状に合わせる
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
        (error) => console.error("画像の読み込みに失敗:", imageSrc, error)
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

  // ===== 再生制御 =====
  useEffect(() => {
    if (mediaType !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    if (isActive && progress > 0) {
      const duration = video.duration || 10;
      const targetTime = progress * duration * 0.7;

      // 過剰シークを避ける（破綻防止）
      if (Math.abs(video.currentTime - targetTime) > 0.25) {
        video.currentTime = targetTime;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      if (!video.paused) video.pause();
    }
  }, [isActive, progress, mediaType]);

  // ===== 湾曲ジオメトリ作成：符号で凹凸を切り替え =====
  const makeCurvedPlane = (sign: 1 | -1, curveAmt: number) => {
    const segX = 64,
      segY = 42;
    const g = new THREE.PlaneGeometry(CARD_W, CARD_H, segX, segY);
    const pos = g.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        y = pos.getY(i);
      const nx = x / (CARD_W * 0.5);
      const ny = y / (CARD_H * 0.5);
      const r2 = nx * nx + ny * ny;
      pos.setZ(i, sign * curveAmt * r2);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  };

  const curveAmount = 0.06; // 0.03〜0.1 で調整
  const curvedPlaneGeometryFront = useMemo(
    () => makeCurvedPlane(+1, curveAmount),
    [CARD_W, CARD_H, curveAmount]
  );
  const curvedPlaneGeometryBack = useMemo(
    () => makeCurvedPlane(-1, curveAmount),
    [CARD_W, CARD_H, curveAmount]
  );

  // ===== マテリアル（色そのまま／角丸） =====
  const baseMaterialParams = useMemo(
    () => ({
      transparent: true,
      opacity: 1, // 実際の描画不透明度は drawOpacity で制御
      alphaMap: alphaTexture as THREE.Texture,
      alphaTest: 0.001, // 境界の黒縁抑制
      depthTest: true,
      depthWrite: false, // 透明なので深度は書かない（干渉回避）
      side: THREE.FrontSide, // 片面（裏はメッシュ自体を回転）
    }),
    [alphaTexture]
  );

  const mediaFrontMat = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      ...baseMaterialParams,
      map:
        (mediaType === "video" ? videoTexture.current : imageTexture.current) ||
        null,
    });
    mat.needsUpdate = true;
    return mat;
  }, [baseMaterialParams, mediaType]);

  const mediaBackMat = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      ...baseMaterialParams,
      map:
        (mediaType === "video" ? videoTexture.current : imageTexture.current) ||
        null,
    });
    mat.needsUpdate = true;
    return mat;
  }, [baseMaterialParams, mediaType]);

  // ===== 退出アニメ（戻る時に回転しながらフェード） =====
  const exitGroupRef = useRef<THREE.Group>(null);
  const frontMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const backMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // 実際に描画する不透明度（外部opacityとは別に、退出時は内部で制御）
  const [drawOpacity, setDrawOpacity] = useState(opacity);
  // マウント条件（退出完了までは描画を維持）
  const [shouldRender, setShouldRender] = useState(true);

  const EXIT_MS = 500; // 退出アニメ長さ
  const EXIT_ROT = Math.PI * 0.5; // Y方向に90°回転
  const exitingRef = useRef(false);
  const exitStartRef = useRef<number | null>(null);
  const exitStartOpacityRef = useRef(1);

  // 退出トリガー検出
  const prevOpacityRef = useRef(opacity);
  useEffect(() => {
    const prev = prevOpacityRef.current;
    if (!exitingRef.current && prev > 0.01 && opacity <= 0.01) {
      exitingRef.current = true;
      exitStartRef.current = performance.now();
      exitStartOpacityRef.current = Math.max(0.01, prev);
      setShouldRender(true); // 終わるまで描画維持
    }
    if (prev <= 0.01 && opacity > 0.01) {
      // 再表示開始：回転を戻しつつ、即描画有効
      exitingRef.current = false;
      exitStartRef.current = null;
      setShouldRender(true);
      setDrawOpacity(opacity);
      if (exitGroupRef.current) exitGroupRef.current.rotation.y = 0;
    }
    prevOpacityRef.current = opacity;
  }, [opacity]);

  // 漂い・微回転 + 退出アニメ進行 + マテリアル不透明度の適用
  useFrame((state, dt) => {
    // 漂い
    if (meshRef.current) {
      meshRef.current.rotation.z =
        rotation[2] + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }

    // 退出アニメ
    if (exitingRef.current && exitStartRef.current !== null) {
      const t = Math.min(
        1,
        (performance.now() - exitStartRef.current) / EXIT_MS
      );
      // easeOutCubic
      const e = 1 - Math.pow(1 - t, 3);
      // 回転（0 → EXIT_ROT）
      if (exitGroupRef.current) {
        const target = EXIT_ROT;
        const cur = exitGroupRef.current.rotation.y;
        exitGroupRef.current.rotation.y = cur + (target - cur) * 0.25; // 適度に追従
      }
      // 不透明度（開始時から 0 へ）
      const o = exitStartOpacityRef.current * (1 - e);
      setDrawOpacity(o);

      if (t >= 1) {
        exitingRef.current = false;
        exitStartRef.current = null;
        setShouldRender(false); // 完了したら実際に非表示
      }
    } else {
      // 通常時は外部opacityをそのまま使う & 回転を0に戻す
      setDrawOpacity(opacity);
      if (exitGroupRef.current) {
        const cur = exitGroupRef.current.rotation.y;
        exitGroupRef.current.rotation.y = cur + (0 - cur) * Math.min(1, dt * 8);
      }
    }

    // マテリアルへ反映
    if (frontMatRef.current) frontMatRef.current.opacity = drawOpacity;
    if (backMatRef.current) backMatRef.current.opacity = drawOpacity;
  });

  // ===== 描画 =====
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* +Z を外側に：内部を180°反転 */}
      <group rotation={[0, Math.PI, 0]} ref={exitGroupRef}>
        {textureLoaded && (shouldRender || opacity > 0.01) && (
          <>
            {/* 前面（へこみ方向：内側） */}
            <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={21}>
              <primitive object={curvedPlaneGeometryFront} attach="geometry" />
              {/* material は ref で opacity を制御 */}
              <meshBasicMaterial
                ref={frontMatRef}
                map={
                  (mediaType === "video"
                    ? videoTexture.current
                    : imageTexture.current) || null
                }
                alphaMap={alphaTexture as any}
                transparent
                alphaTest={0.001}
                depthTest
                depthWrite={false}
                side={THREE.FrontSide}
              />
            </mesh>

            {/* 背面（表と同じへこみ方向に見えるよう符号反転ジオメトリを使用） */}
            <mesh
              position={[0, 0, -0.001]}
              rotation={[0, Math.PI, 0]}
              renderOrder={20}
            >
              <primitive object={curvedPlaneGeometryBack} attach="geometry" />
              <meshBasicMaterial
                ref={backMatRef}
                map={
                  (mediaType === "video"
                    ? videoTexture.current
                    : imageTexture.current) || null
                }
                alphaMap={alphaTexture as any}
                transparent
                alphaTest={0.001}
                depthTest
                depthWrite={false}
                side={THREE.FrontSide}
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
