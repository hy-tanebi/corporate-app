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
	cornerRadiusPx?: number;
	displayHeightPx?: number;
	onClick?: () => void;
	onHoverChange?: (isHovering: boolean) => void;
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
	onClick,
	onHoverChange,
}: VideoCard3DProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const exitGroupRef = useRef<THREE.Group>(null);
	const floatingGroupRef = useRef<THREE.Group>(null);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const videoTexture = useRef<VideoTexture | null>(null);
	const imageTexture = useRef<THREE.Texture | null>(null);
	const [textureLoaded, setTextureLoaded] = useState(false);
	const isHoveringRef = useRef(false);

	// === 角丸アルファ ===
	const alphaTexture = useMemo(() => {
		const w = 2048,
			h = 1365;
		const canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext("2d")!;
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "white";
		const r = Math.max(
			1,
			Math.round((cornerRadiusPx * h) / (displayHeightPx || 400)),
		);
		const p = new Path2D();
		p.moveTo(r, 0);
		p.lineTo(w - r, 0);
		p.quadraticCurveTo(w, 0, w, r);
		p.lineTo(w, h - r);
		p.quadraticCurveTo(w, h, w - r, h);
		p.lineTo(r, h);
		p.quadraticCurveTo(0, h, 0, h - r);
		p.lineTo(0, r);
		p.quadraticCurveTo(0, 0, r, 0);
		p.closePath();
		ctx.fill(p);
		const tex = new THREE.CanvasTexture(canvas);
		tex.generateMipmaps = true;
		tex.minFilter = THREE.LinearMipmapLinearFilter;
		tex.magFilter = THREE.LinearFilter;
		tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
		tex.anisotropy = 8;
		tex.needsUpdate = true;
		return tex;
	}, [cornerRadiusPx, displayHeightPx]);

	// === メディアテクスチャ ===
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.src = "";
			videoRef.current = null;
		}
		videoTexture.current?.dispose();
		videoTexture.current = null;
		imageTexture.current?.dispose();
		imageTexture.current = null;
		setTextureLoaded(false);

		if (mediaType === "video" && videoSrc) {
			const v = document.createElement("video");
			v.src = videoSrc;
			v.crossOrigin = "anonymous";
			v.loop = false;
			v.muted = true;
			v.playsInline = true;
			v.preload = "auto"; // metadataからautoに変更して確実に読み込む
			videoRef.current = v;

			// 動画が十分に読み込まれたらtextureLoadedをtrueに
			v.oncanplay = () => {
				console.log(`✅ [${title}] 動画再生可能:`, videoSrc);
				setTextureLoaded(true);
			};

			v.onloadedmetadata = () => {
				console.log(`📊 [${title}] メタデータ読み込み完了`);
			};

			v.onerror = (e) => {
				console.error(`❌ [${title}] 動画読み込みエラー:`, videoSrc);
				console.error("Error details:", e);
				console.error("Video element:", v);
				console.error("NetworkState:", v.networkState);
				console.error("ReadyState:", v.readyState);
			};

			const tex = new VideoTexture(v);
			tex.minFilter = THREE.LinearFilter;
			tex.magFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.flipY = false; // DoubleSide使用時は反転させない
			(tex as any).colorSpace = THREE.SRGBColorSpace;
			videoTexture.current = tex;
		} else if (mediaType === "image" && imageSrc) {
			new TextureLoader().load(
				imageSrc,
				(tex) => {
					tex.minFilter = THREE.LinearFilter;
					tex.magFilter = THREE.LinearFilter;
					tex.generateMipmaps = true;
					tex.flipY = false; // DoubleSide使用時は反転させない
					(tex as any).colorSpace = THREE.SRGBColorSpace;
					imageTexture.current = tex;
					setTextureLoaded(true);
				},
				undefined,
				(e) => console.error("画像読み込み失敗:", imageSrc, e),
			);
		}
		return () => {
			videoRef.current &&
				(videoRef.current.pause(), (videoRef.current.src = ""));
			videoTexture.current?.dispose();
			imageTexture.current?.dispose();
		};
	}, [videoSrc, imageSrc, mediaType]);

	// === 再生制御 ===
	useEffect(() => {
		if (mediaType !== "video") return;
		const v = videoRef.current;
		if (!v) return;
		if (isActive && progress > 0) {
			const duration = v.duration || 10;
			const t = progress * duration * 0.7;
			if (Math.abs(v.currentTime - t) > 0.25) v.currentTime = t;
			if (v.paused) v.play().catch(() => {});
		} else {
			if (!v.paused) v.pause();
		}
	}, [isActive, progress, mediaType]);

	// === 湾曲（カメラ側にふくらむ = 凸） ===
	const CARD_W = 3,
		CARD_H = 2;
	const curvedPlaneGeometry = useMemo(() => {
		const segX = 64,
			segY = 42,
			curveAmt = 0.06,
			sign = 1;
		const g = new THREE.PlaneGeometry(CARD_W, CARD_H, segX, segY);
		const pos = g.attributes.position as THREE.BufferAttribute;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i),
				y = pos.getY(i);
			const nx = x / (CARD_W * 0.5),
				ny = y / (CARD_H * 0.5);
			const r2 = nx * nx + ny * ny;
			pos.setZ(i, sign * curveAmt * r2);
		}
		pos.needsUpdate = true;
		g.computeVertexNormals();
		return g;
	}, []);

	// === 退出アニメ & 浮遊 ===
	const [drawOpacity, setDrawOpacity] = useState(opacity);
	const [shouldRender, setShouldRender] = useState(true);
	const EXIT_MS = 500,
		EXIT_ROT = Math.PI * 0.5;
	const exitingRef = useRef(false);
	const exitStartRef = useRef<number | null>(null);
	const exitStartOpacityRef = useRef(1);
	const prevOpacityRef = useRef(opacity);

	useEffect(() => {
		const prev = prevOpacityRef.current;
		if (!exitingRef.current && prev > 0.01 && opacity <= 0.01) {
			exitingRef.current = true;
			exitStartRef.current = performance.now();
			exitStartOpacityRef.current = Math.max(0.01, prev);
			setShouldRender(true);
		}
		if (prev <= 0.01 && opacity > 0.01) {
			exitingRef.current = false;
			exitStartRef.current = null;
			setShouldRender(true);
			setDrawOpacity(opacity);
			if (exitGroupRef.current) exitGroupRef.current.rotation.y = 0;
		}
		prevOpacityRef.current = opacity;
	}, [opacity]);

	useFrame((state, dt) => {
		// 浮遊
		if (floatingGroupRef.current) {
			const t = state.clock.elapsedTime;
			const phase = (position[0] + position[2]) * 0.5;
			const y = Math.sin(t * 1.0 + phase) * 0.2;
			const x = Math.sin(t * 0.7 + phase * 1.3) * 0.08;
			const z = Math.cos(t * 0.5 + phase * 0.7) * 0.1;
			floatingGroupRef.current.position.set(x, y, z);
		}
		// 微回転（Yは退出アニメ用）
		if (exitGroupRef.current) {
			const t = state.clock.elapsedTime;
			const phase = (position[0] + position[2]) * 0.5;
			const rotZ = rotation[2] + Math.sin(t * 0.6 + phase) * 0.05;
			const rotX = Math.sin(t * 0.4 + phase * 1.1) * 0.03;
			exitGroupRef.current.rotation.x = rotX;
			exitGroupRef.current.rotation.z = rotZ;
		}
		// 退出
		if (exitingRef.current && exitStartRef.current !== null) {
			const t = Math.min(
				1,
				(performance.now() - exitStartRef.current) / EXIT_MS,
			);
			const e = 1 - (1 - t) ** 3;
			if (exitGroupRef.current) {
				const curY = exitGroupRef.current.rotation.y;
				exitGroupRef.current.rotation.y = curY + (EXIT_ROT - curY) * 0.25;
			}
			setDrawOpacity(exitStartOpacityRef.current * (1 - e));
			if (t >= 1) {
				exitingRef.current = false;
				exitStartRef.current = null;
				setShouldRender(false);
			}
		} else {
			setDrawOpacity(opacity);
			if (exitGroupRef.current) {
				const curY = exitGroupRef.current.rotation.y;
				exitGroupRef.current.rotation.y =
					curY + (0 - curY) * Math.min(1, dt * 8);
			}
		}
		if (meshRef.current)
			(meshRef.current.material as THREE.MeshBasicMaterial).opacity =
				drawOpacity;

		// hover状態の自動リセット: opacityが低い時にhoverしていたら強制的にfalseにする
		if (isHoveringRef.current && drawOpacity <= 0.5) {
			isHoveringRef.current = false;
			document.body.style.cursor = "default";
			if (onHoverChange) {
				onHoverChange(false);
			}
		}
	});

	// === 描画（単一メッシュ / DoubleSide） ===
	return (
		<group position={position} rotation={rotation} scale={scale}>
			<group ref={floatingGroupRef}>
				<group ref={exitGroupRef}>
					{textureLoaded && (shouldRender || opacity > 0.01) && (
						<mesh
							ref={meshRef}
							position={[0, 0, 0]}
							rotation={[Math.PI, Math.PI, 0]}
							renderOrder={1001}
							onClick={(e) => {
								e.stopPropagation();
								// カードが十分に表示されている時だけクリックイベントを発火
								if (onClick && drawOpacity > 0.5) {
									onClick();
								}
							}}
							onPointerOver={(e) => {
								e.stopPropagation();
								// カードが十分に表示されている時だけhoverイベントを発火
								if (drawOpacity > 0.5) {
									isHoveringRef.current = true;
									document.body.style.cursor = "pointer";
									if (onHoverChange) {
										onHoverChange(true);
									}
								}
							}}
							onPointerOut={(e) => {
								e.stopPropagation();
								// onPointerOutは常に実行してhover状態をリセット
								isHoveringRef.current = false;
								document.body.style.cursor = "default";
								if (onHoverChange) {
									onHoverChange(false);
								}
							}}
						>
							<primitive object={curvedPlaneGeometry} attach="geometry" />
							<meshBasicMaterial
								map={
									(mediaType === "video"
										? videoTexture.current
										: imageTexture.current) || null
								}
								alphaMap={alphaTexture as any}
								transparent
								alphaTest={0.001}
								depthTest={true} // 深度テストを有効に戻す
								depthWrite={true}
								side={THREE.DoubleSide} // ← 表裏の不整合を根絶
							/>
						</mesh>
					)}
				</group>
			</group>
		</group>
	);
}
