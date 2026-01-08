// src/components/three/VideoCard3D.tsx
"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader, VideoTexture } from "three";
import * as THREE from "three";

// === アルファテクスチャのキャッシュ (Global Cache) ===
// 複数のカードで同じマスクを使い回すためにキャッシュする
let cachedAlphaTexture: THREE.CanvasTexture | null = null;
let cachedKey = "";

function getSharedAlphaTexture(
	cornerRadiusPx: number,
	displayHeightPx: number,
) {
	const key = `${cornerRadiusPx}_${displayHeightPx}`;
	if (cachedAlphaTexture && cachedKey === key) {
		return cachedAlphaTexture;
	}

	// キャッシュミス時は生成
	const w = 1024; // 2048から1024に解像度を下げてメモリ節約（見た目には十分）
	const h = 682; // アスペクト比 3:2 を維持
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = "white";

	// 比率に合わせて半径を計算
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
	// メモリ最適化設定
	tex.generateMipmaps = false; // Mipmap不要（どうせマスクなので）
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.anisotropy = 1; // 異方性フィルタリングも不要
	tex.needsUpdate = true;

	cachedAlphaTexture = tex;
	cachedKey = key;

	return tex;
}

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
	isInteractive?: boolean;
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
	isInteractive = true,
}: VideoCard3DProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const exitGroupRef = useRef<THREE.Group>(null);
	const floatingGroupRef = useRef<THREE.Group>(null);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const videoTexture = useRef<VideoTexture | null>(null);
	const imageTexture = useRef<THREE.Texture | null>(null);
	const [textureLoaded, setTextureLoaded] = useState(false);
	const isHoveringRef = useRef(false);

	// === 角丸アルファ (Shared) ===
	const alphaTexture = useMemo(() => {
		// キャッシュされたテクスチャを取得
		return getSharedAlphaTexture(cornerRadiusPx, displayHeightPx);
	}, [cornerRadiusPx, displayHeightPx]);

	// === メディアテクスチャ ===
	useEffect(() => {
		// リセット
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.src = "";
			videoRef.current = null;
		}
		// TextureのdisposeはComponentのアンマウント時のみにするか、慎重に制御
		// ここでは切り替え時に以前のリソースをクリーンアップ
		if (videoTexture.current) {
			videoTexture.current.dispose();
			videoTexture.current = null;
		}
		if (imageTexture.current) {
			imageTexture.current.dispose();
			imageTexture.current = null;
		}
		setTextureLoaded(false);

		// ★最適化: opacityがほぼ0の場合は読み込み処理自体をスキップ（遅延読み込み）
		// ただし、完全に非表示でもpreloadしたい場合は条件を緩める
		if (opacity < 0.01 && !isActive) return;

		if (mediaType === "video" && videoSrc) {
			const v = document.createElement("video");
			v.src = videoSrc;
			v.crossOrigin = "anonymous";
			v.loop = true; // ループ再生有効
			v.muted = true;
			v.playsInline = true;
			// ★最適化: preloadをnoneにし、表示が必要になってから読み込む手もあるが、
			// ユーザー体験のために metadata までは読み込む
			v.preload = "metadata";
			videoRef.current = v;

			const onCanPlay = () => {
				// console.log(`✅ [${title}] 動画再生可能`);
				setTextureLoaded(true);
			};
			v.addEventListener("canplay", onCanPlay, { once: true });

			// エラーハンドリング
			v.onerror = () => {
				console.error(`❌ [${title}] 動画読み込みエラー`, videoSrc);
			};

			const tex = new VideoTexture(v);
			tex.minFilter = THREE.LinearFilter;
			tex.magFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.flipY = false;
			// biome-ignore lint/suspicious/noExplicitAny: ColorSpace
			(tex as any).colorSpace = THREE.SRGBColorSpace;
			videoTexture.current = tex;

			// すぐに読み込み開始 (metadataのみ)
			v.load();
		} else if (mediaType === "image" && imageSrc) {
			new TextureLoader().load(
				imageSrc,
				(tex) => {
					tex.minFilter = THREE.LinearFilter;
					tex.magFilter = THREE.LinearFilter;
					tex.generateMipmaps = true; // 画像はMipmap有効で綺麗に
					tex.flipY = false;
					// biome-ignore lint/suspicious/noExplicitAny: ColorSpace
					(tex as any).colorSpace = THREE.SRGBColorSpace;
					imageTexture.current = tex;
					setTextureLoaded(true);
				},
				undefined,
				(_e) => {
					// 失敗時はサイレントに無視するかログ出力
					// console.error("画像読み込み失敗:", imageSrc, e)
				},
			);
		}

		return () => {
			if (videoRef.current) {
				videoRef.current.pause();
				videoRef.current.removeAttribute("src"); // src削除
				videoRef.current.load(); // リソース解放
				videoRef.current = null;
			}
			// アンマウント時にテクスチャ破棄
			videoTexture.current?.dispose();
			imageTexture.current?.dispose();

            // Hover状態のクリーンアップ (重要: カードが消える時にカーソルが残り続けるのを防ぐ)
            if (isHoveringRef.current) {
                isHoveringRef.current = false;
                document.body.style.cursor = "default";
                onHoverChange?.(false);
            }
		};
	}, [videoSrc, imageSrc, mediaType, title, opacity, isActive]); // opacity依存を追加: 表示されたらロード開始

	// === 再生制御 (Active時のみ再生) ===
	useEffect(() => {
		if (mediaType !== "video") return;
		const v = videoRef.current;
		if (!v) return;

		// Active かつ 十分に表示されている場合のみ再生
		if (isActive && progress > 0 && opacity > 0.1) {
			if (v.paused) {
				v.play().catch(() => {});
			}
		} else {
			if (!v.paused) {
				v.pause();
			}
		}
	}, [isActive, progress, mediaType, opacity]);

	// === 湾曲（カメラ側にふくらむ = 凸） ===
	const CARD_W = 3,
		CARD_H = 2;
	const curvedPlaneGeometry = useMemo(() => {
		// セグメント数も少し削減 (64x42 -> 32x21)
		const segX = 32,
			segY = 21,
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

	// アニメーション定数等はuseMemo/Refにする必要はない（軽量）
	const EXIT_MS = 500;
	const EXIT_ROT = Math.PI * 0.5;
	const exitingRef = useRef(false);
	const exitStartRef = useRef<number | null>(null);
	const exitStartOpacityRef = useRef(1);
	const prevOpacityRef = useRef(opacity);

	// Opacity変更検知
	if (prevOpacityRef.current !== opacity) {
		const prev = prevOpacityRef.current;
		// 表示 -> 非表示
		if (!exitingRef.current && prev > 0.01 && opacity <= 0.01) {
			exitingRef.current = true;
			exitStartRef.current = performance.now();
			exitStartOpacityRef.current = Math.max(0.01, prev);
			setShouldRender(true);
		}
		// 非表示 -> 表示
		if (prev <= 0.01 && opacity > 0.01) {
			exitingRef.current = false;
			exitStartRef.current = null;
			setShouldRender(true);
			setDrawOpacity(opacity);
			if (exitGroupRef.current) exitGroupRef.current.rotation.y = 0;
		}
		prevOpacityRef.current = opacity;
	}

	useFrame((state, _dt) => {
		// ★最適化: 完全に非表示ならフレーム処理をスキップ
		if (!shouldRender && opacity < 0.001) return;

		const t = state.clock.elapsedTime;
		const phase = (position[0] + position[2]) * 0.5;

		// 浮遊
		if (floatingGroupRef.current) {
			const y = Math.sin(t * 1.0 + phase) * 0.2;
			const x = Math.sin(t * 0.7 + phase * 1.3) * 0.08;
			const z = Math.cos(t * 0.5 + phase * 0.7) * 0.1;
			floatingGroupRef.current.position.set(x, y, z);
		}

		// 退出アニメーション処理
		if (exitingRef.current && exitStartRef.current !== null) {
			const elapsed = performance.now() - exitStartRef.current;
			const progressT = Math.min(1, elapsed / EXIT_MS);
			const e = 1 - (1 - progressT) ** 3;

			if (exitGroupRef.current) {
				const curY = exitGroupRef.current.rotation.y;
				// 線形補間だとカクつく場合があるのでスムーズに
				exitGroupRef.current.rotation.y = curY + (EXIT_ROT - curY) * 0.1;
			}

			const nextOpacity = exitStartOpacityRef.current * (1 - e);
			setDrawOpacity(nextOpacity);

			if (progressT >= 1) {
				exitingRef.current = false;
				exitStartRef.current = null;
				setShouldRender(false); // レンダリング停止
			}
		} else {
			// 通常時
			setDrawOpacity(opacity);
			if (exitGroupRef.current) {
				const curY = exitGroupRef.current.rotation.y;
				if (Math.abs(curY) > 0.001) {
					exitGroupRef.current.rotation.y = curY * 0.9; // 減衰
				} else {
					exitGroupRef.current.rotation.y = 0;
				}
			}

			// 微回転
			if (exitGroupRef.current) {
				const rotZ = rotation[2] + Math.sin(t * 0.6 + phase) * 0.05;
				const rotX = Math.sin(t * 0.4 + phase * 1.1) * 0.03;
				// exitアニメーションと干渉しないよう加算合成等は避ける
				if (!exitingRef.current) {
					exitGroupRef.current.rotation.x = rotX;
					exitGroupRef.current.rotation.z = rotZ;
				}
			}
		}

		// マテリアル更新
		if (meshRef.current) {
			const material = meshRef.current.material as THREE.MeshBasicMaterial;
			const THRESHOLD = 0.8;
			const isOpaque = drawOpacity >= THRESHOLD;
			const finalOpacity = isOpaque ? 1.0 : drawOpacity;

			// 値が変わった時だけ更新するのがベストだが、React-three-fiberのuseFrame内では頻繁に呼ばれる
			material.opacity = finalOpacity;
			material.transparent = !isOpaque;
			// biome-ignore lint/suspicious/noExplicitAny: Alpha texture type mismatch
			material.alphaMap = !isOpaque ? (alphaTexture as any) : null;
			material.needsUpdate = true;
		}
	});

	// 可視性が無い場合は描画しない (React NodeレベルでのCulling)
	if (!shouldRender && opacity < 0.01) return null;

	return (
		<group position={position} rotation={rotation} scale={scale}>
			<group ref={floatingGroupRef}>
				<group ref={exitGroupRef}>
					{textureLoaded && (
						// biome-ignore lint/a11y/noStaticElementInteractions: R3F mesh interaction
						<mesh
							ref={meshRef}
							// position等はずっと0
							rotation={[Math.PI, Math.PI, 0]}
							renderOrder={1001}
							onClick={(e) => {
								e.stopPropagation();
								if (onClick && drawOpacity > 0.5 && isInteractive) {
									onClick();
								}
							}}
							onPointerOver={(e) => {
								e.stopPropagation();
								if (drawOpacity > 0.5 && isInteractive) {
									isHoveringRef.current = true;
									document.body.style.cursor = "pointer";
									onHoverChange?.(true);
								}
							}}
							onPointerOut={(e) => {
								e.stopPropagation();
								isHoveringRef.current = false;
								document.body.style.cursor = "default";
								onHoverChange?.(false);
							}}
						>
							<primitive object={curvedPlaneGeometry} attach="geometry" />
							<meshBasicMaterial
								map={
									(mediaType === "video"
										? videoTexture.current
										: imageTexture.current) || null
								}
								color="white"
								alphaTest={0.001} // アルファ抜きのための閾値
								depthTest={true}
								depthWrite={true}
								side={THREE.DoubleSide}
							/>
						</mesh>
					)}
				</group>
			</group>
		</group>
	);
}
