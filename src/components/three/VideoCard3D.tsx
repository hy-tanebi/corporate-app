// src/components/three/VideoCard3D.tsx
"use client";

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, VideoTexture } from 'three';
import * as THREE from 'three';

interface VideoCard3DProps {
  videoSrc: string;
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
  title,
  position,
  rotation,
  isActive,
  progress,
  scale = 1,
  opacity = 1
}: VideoCard3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTexture = useRef<VideoTexture | null>(null);

  // 動画要素を作成
  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    
    videoRef.current = video;
    videoTexture.current = new VideoTexture(video);
    videoTexture.current.minFilter = THREE.LinearFilter;
    videoTexture.current.magFilter = THREE.LinearFilter;

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      if (videoTexture.current) {
        videoTexture.current.dispose();
      }
    };
  }, [videoSrc]);

  // 動画の再生制御
  useEffect(() => {
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
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isActive, progress]);

  // 角丸四角形のシェイプを作成（ネオモルフィズム風）
  const cardGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = 2;
    const height = 2;
    const radius = 0.2;

    shape.moveTo(-width/2, -height/2 + radius);
    shape.lineTo(-width/2, height/2 - radius);
    shape.quadraticCurveTo(-width/2, height/2, -width/2 + radius, height/2);
    shape.lineTo(width/2 - radius, height/2);
    shape.quadraticCurveTo(width/2, height/2, width/2, height/2 - radius);
    shape.lineTo(width/2, -height/2 + radius);
    shape.quadraticCurveTo(width/2, -height/2, width/2 - radius, -height/2);
    shape.lineTo(-width/2 + radius, -height/2);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2, -height/2 + radius);

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }, []);

  // フレーム更新
  useFrame((state, delta) => {
    if (meshRef.current) {
      // 浮遊効果
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // ホバー効果のような微細な回転
      meshRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* カードと動画を同じタイミングで表示制御 */}
      {opacity > 0 && (
        <>
          {/* 背景カード（ネオモルフィズム風） */}
          <mesh ref={meshRef} position={[0, 0, -0.01]} geometry={cardGeometry}>
            <meshStandardMaterial 
              color="#2a2a2a"
              transparent
              opacity={opacity * 0.9}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>

          {/* 動画テクスチャ */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial 
              map={videoTexture.current}
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* グローエフェクト（アクティブ時） */}
      {isActive && (
        <mesh position={[0, 0, -0.02]} scale={1.1}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial 
            color="#3b82f6"
            transparent
            opacity={0.2 * opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* フレーム */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}