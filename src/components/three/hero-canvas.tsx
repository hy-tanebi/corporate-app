// src/components/three/hero-canvas.tsx
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useFBO, OrbitControls } from "@react-three/drei";
import {
	useRef,
	useMemo,
	Suspense,
	type ReactNode,
	useState,
	useEffect,
} from "react";
import * as THREE from "three";
import { StarParticles } from "./StarParticles";
import { ShootingStars } from "./ShootingStars";
import { PurpleNebula } from "./PurpleNebula";
import VideoCardsRenderer from "./VideoCardsRenderer";
import { FeatherCircleMaterial } from "./materials";
import { getSafeVideoSlides } from "../../data/fallback-content";
import type { VideoSlide } from "../../types/content";
import { CardDetailModal } from "../ui/card-detail-modal";
import { HtmlHoverPointer } from "./HtmlHoverPointer";
import { HeroStateContext } from "../../contexts/HeroStateContext";

// ===== 全体スケール =====
const SCENE_SCALE = 1.2;

// ===== パラメータ =====
const CAMERA_Z = 5.2;
const ROOT_Z_OFFSET = 0.6;

const GAP_TURNS = 0.15;
const FADE_FRAC = 0.7;
const TAU = Math.PI * 2;

// ===== 動画フェーズ =====
const THIRD_PHASE_START = 0.5;
const THIRD_PHASE_END = 0.88;
const VIDEO_START_PROGRESS = 0.57;

// ===== イージング・慣性 =====
const VIDEO_EASE = 5.0;
const CARD_DWELL_FRAC = 0.95;
const VIDEO_ROT_INERTIA = 2.0;

// ===== 黒円/リターン =====
const RETURN_SCROLL_START = 0.82;
const RETURN_SCROLL_END = 0.86;
const CIRCLE_SCROLL_START = RETURN_SCROLL_END + 0.005;
const CIRCLE_SCROLL_END = 0.95; // 黒い円の拡大終了
const CIRCLE_SMOOTH_EXPAND = 0.25;
const CIRCLE_SMOOTH_SHRINK = 3.5; // 縮小は拡大よりかなり速く
const CIRCLE_EASE = 1.0;

// 円の見え方
const CIRCLE_FEATHER = 0.18;
const tetraRadius = 1.5;
const HIDE_TRI_AT_RADIUS = tetraRadius * 1.02;
const HIDE_BG_AT_T = 0.98;

// ===== ユーティリティ =====
const smooth01 = (x: number) => {
	const t = THREE.MathUtils.clamp(x, 0, 1);
	return t * t * (3 - 2 * t);
};
const sstep = (x: number, a: number, b: number) =>
	THREE.MathUtils.clamp((x - a) / Math.max(1e-6, b - a), 0, 1);

function dwellWithOffset(
	theta: number,
	slotStep: number,
	dwellFrac: number,
	offset: number,
) {
	if (slotStep <= 0) return theta;
	const s = slotStep;
	const holdHalf = Math.min(0.5, Math.max(0, dwellFrac * 0.5));
	const nearestCenter = offset + Math.round((theta - offset) / s) * s;
	const s2 = s * 0.5;
	let d = theta - nearestCenter;
	if (d > s2) d -= s;
	if (d < -s2) d += s;
	const absd = Math.abs(d);
	const holdWidth = holdHalf * s;
	if (absd <= holdWidth) return nearestCenter;
	const moveRange = s2 - holdWidth;
	const t = (absd - holdWidth) / Math.max(1e-6, moveRange);
	const eased = smooth01(t);
	const newAbs = holdWidth + eased * moveRange;
	return nearestCenter + Math.sign(d) * newAbs;
}

// ===== カード大きさ =====
const CARD_W = 1.2;
const CARD_H = 0.7;

// ===== ヒーローシーン =====
interface HeroSceneProps {
	scrollProgress: number;
	videoSlides: VideoSlide[];
	onCardClick?: (slide: VideoSlide, index: number) => void;
	onCardHover?: (isHovering: boolean) => void;
	isContactVisible: boolean;
    spaceOpacity: number;
    transitionProgress: number;
}

function HeroScene({
	scrollProgress,
	videoSlides,
	onCardClick,
	onCardHover,
	isContactVisible,
    spaceOpacity,
    transitionProgress,
}: HeroSceneProps) {
	const heroMatRef = useRef<any>(null);
	const starGroupRef = useRef<THREE.Group>(null);
	const triangleGroupRef = useRef<THREE.Group>(null);
	const triangleVisibleMeshRef = useRef<THREE.Mesh>(null);
	const lineSegmentsRef = useRef<THREE.LineSegments>(null);
	const circleRef = useRef<THREE.Mesh>(null);
	const videoCardsRef = useRef<THREE.Group>(null);
	const rootRef = useRef<THREE.Group>(null);

	// 三角形のドラッグ操作用
	const isDragging = useRef(false);
	const previousMousePosition = useRef({ x: 0, y: 0 });
	const triangleRotation = useRef({ x: 0, y: 0 });

	// 紫色のガスのランダム配置（リロード時に1回だけ生成）
	const nebulaPositions = useMemo(() => {
		const positions = [];
		for (let i = 0; i < 2; i++) {
			const x = Math.random() * 80 - 40; // -40 ~ 40
			const y = Math.random() * 80 - 40; // -40 ~ 40
			const z = Math.random() * 20 - 50; // -50 ~ -30
			const scale = Math.random() * 40 + 50; // 50 ~ 90
			const opacity = Math.random() * 0.15 + 0.15; // 0.15 ~ 0.3
			const rotation = Math.random() * Math.PI * 2; // 0 ~ 2π
			positions.push({ x, y, z, scale, opacity, rotation });
		}
		return positions;
	}, []);

	// 黒円マテリアル
	const featherMat = useMemo(() => {
		const m = new (FeatherCircleMaterial as any)();
		m.transparent = true;
		m.depthTest = false;
		m.depthWrite = false;
		if (m.uniforms?.uFeather) m.uniforms.uFeather.value = CIRCLE_FEATHER;
		return m;
	}, []);

	// 画面歪み（FBO合成）
	const fluidRef = useRef<THREE.Mesh>(null);
	const hoverMatRef = useRef<any>(null);
	const fbo = useFBO({ samples: 4 });

	// FBO を Linear に（色ズレ防止）
	useEffect(() => {
		fbo.texture.colorSpace = THREE.LinearSRGBColorSpace;
	}, [fbo]);

	// ====== ポインタの指数平滑 ======
	const mouseRaw = useRef(new THREE.Vector2(0.5, 0.5));
	const mouseFiltered = useRef(new THREE.Vector2(0.5, 0.5));
	const lastMouseFiltered = useRef(new THREE.Vector2(0.5, 0.5));
	const velSmoothed = useRef(new THREE.Vector2(0, 0));
	const hoverStrength = useRef(0);

	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			mouseRaw.current.set(
				e.clientX / window.innerWidth,
				1 - e.clientY / window.innerHeight,
			);
			hoverStrength.current = 1;
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => window.removeEventListener("pointermove", onMove);
	}, []);

	// 並び（時計回り）
	const gateAngle = -Math.PI / 2;
	const halfDiagCard = Math.sqrt(CARD_W ** 2 + CARD_H ** 2) / 2;
	const orbitRadius = tetraRadius + halfDiagCard + 0.25;

	const layout = useMemo(() => {
		const n = Math.max(1, videoSlides.length);
		const slotStep = TAU / n;
		const items = Array.from({ length: n }, (_, i) => {
			const angle = gateAngle - (i / n) * TAU; // 時計回り配置
			const x = Math.sin(angle) * orbitRadius;
			const z = Math.cos(angle) * orbitRadius;
			return { index: i, angle, x, z, rank: i };
		});
		return { n, items, slotStep };
	}, [orbitRadius, videoSlides.length]);

	// third-phase 開始〜終了のマッピング
	const thirdPhaseAtStart =
		(VIDEO_START_PROGRESS - THIRD_PHASE_START) /
		(THIRD_PHASE_END - THIRD_PHASE_START);
	const thirdPhaseAtStartEased = smooth01(thirdPhaseAtStart) ** VIDEO_EASE;
	const availablePhaseEased = Math.max(0, 1 - thirdPhaseAtStartEased);

	// 退場まで必要な回転数
	const requiredTurns = useMemo(() => {
		const { n } = layout;
		const fadeTurnsLast = (n - 1 + FADE_FRAC) / n;
		return 1 + GAP_TURNS + fadeTurnsLast;
	}, [layout]);

	// ===== 完走する回転数 =====
	const ROT_TURNS = useMemo(() => {
		return (requiredTurns / Math.max(0.0001, availablePhaseEased)) * 1.05;
	}, [requiredTurns, availablePhaseEased]);

	// 装飾ライン（外側にずらして独立した動きを追加）
	const lineGeometry = useMemo(() => {
		const geometry = new THREE.TetrahedronGeometry(tetraRadius * 1.08, 0); // 8%外側に拡大
		const position = geometry.attributes.position as THREE.BufferAttribute;
		const colors: number[] = [];
		const color = new THREE.Color();
		for (let i = 0; i < position.count; i++) {
			const hue = position.getY(i) / (tetraRadius * 2) + 0.5;
			color.setHSL(hue, 1.0, 0.5);
			colors.push(color.r, color.g, color.b);
		}
		geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
		return geometry;
	}, []);
	const lineSegments = useMemo(
		() =>
			new THREE.LineSegments(
				lineGeometry,
				new THREE.LineBasicMaterial({ vertexColors: true }),
			),
		[lineGeometry],
	);

	// 慣性
	const smoothedTheta = useRef(0);
	const circleTRef = useRef(0);

	// ヒーロー領域算出ワーク
	const box = useMemo(() => new THREE.Box3(), []);
	const tmp = useMemo(() => new THREE.Vector3(), []);
	const corners = useMemo(
		() => Array.from({ length: 8 }, () => new THREE.Vector3()),
		[],
	);

	// ===== 毎フレーム =====
	useFrame((state, delta) => {
		// 1) FBO描画（液体メッシュは一時非表示）
		if (fluidRef.current) {
			const wasVisible = fluidRef.current.visible;
			fluidRef.current.visible = false;
			state.gl.setRenderTarget(fbo);
			state.gl.clear();
			state.gl.render(state.scene, state.camera);
			state.gl.setRenderTarget(null);
			fluidRef.current.visible = wasVisible;
		}

		// ポインタ・速度の指数平滑
		const kMouse = 1 - Math.exp(-delta * 12.0);
		mouseFiltered.current.lerp(mouseRaw.current, kMouse);

		const velNow = new THREE.Vector2()
			.subVectors(mouseFiltered.current, lastMouseFiltered.current)
			.multiplyScalar(1 / Math.max(1e-6, delta));
		const kVel = 1 - Math.exp(-delta * 20.0);
		velSmoothed.current.lerp(velNow, kVel);
		lastMouseFiltered.current.copy(mouseFiltered.current);

		// HoverFluid のヒーロー領域更新
		const u = hoverMatRef.current?.uniforms;
		if (u) {
			let minX = 1,
				minY = 1;
			let maxX = -1,
				maxY = -1;
			box.makeEmpty();
			if (triangleGroupRef.current)
				box.expandByObject(triangleGroupRef.current);
			if (videoCardsRef.current) box.expandByObject(videoCardsRef.current);

			const bmin = box.min,
				bmax = box.max;
			const pts = corners;
			pts[0].set(bmin.x, bmin.y, bmin.z);
			pts[1].set(bmax.x, bmin.y, bmin.z);
			pts[2].set(bmin.x, bmax.y, bmin.z);
			pts[3].set(bmax.x, bmax.y, bmin.z);
			pts[4].set(bmin.x, bmin.y, bmax.z);
			pts[5].set(bmax.x, bmin.y, bmax.z);
			pts[6].set(bmin.x, bmax.y, bmax.z);
			pts[7].set(bmax.x, bmax.y, bmax.z);

			for (let i = 0; i < 8; i++) {
				tmp.copy(pts[i]).project(state.camera);
				minX = Math.min(minX, tmp.x);
				maxX = Math.max(maxX, tmp.x);
				minY = Math.min(minY, tmp.y);
				maxY = Math.max(maxY, tmp.y);
			}

			const cx = (minX + maxX) * 0.5 + 0.5;
			const cy = (minY + maxY) * 0.5 + 0.5;
			const hx = (maxX - minX) * 0.5;
			const hy = (maxY - minY) * 0.5;

			const dpr = state.gl.getPixelRatio();
			u.uTime.value += delta;
			u.uScene.value = fbo.texture;
			u.uResolution.value.set(state.size.width * dpr, state.size.height * dpr);

			u.uMouse.value.copy(mouseFiltered.current);
			u.uVel.value.copy(velSmoothed.current);

			hoverStrength.current = Math.max(0, hoverStrength.current - delta * 1.6);
			const kInt = 1 - Math.exp(-delta * 6.0);
			u.uIntensity.value += (hoverStrength.current - u.uIntensity.value) * kInt;

			// 少しソフト寄り
			u.uRadius.value = 0.095;
			u.uFalloff.value = 0.165;
			u.uDispAmp.value = 0.045;
			u.uNoiseAmp.value = 0.38;

			u.uBaseAmp.value = 0.013;
			u.uBaseScale.value = 1.18;

			u.uHeroCenter.value.set(
				THREE.MathUtils.clamp(cx, 0.0, 1.0),
				THREE.MathUtils.clamp(cy, 0.0, 1.0),
			);
			u.uHeroSize.value.set(
				THREE.MathUtils.clamp(hx + 0.15, 0.0, 0.8),
				THREE.MathUtils.clamp(hy + 0.15, 0.0, 0.8),
			);
			u.uHeroRadius.value = 0.06;
			u.uChromAb.value = 0.0;
			// 一時的にデバッグモードを有効化
			u.uShowMask.value = 0; // 0: エフェクト表示, 1: デバッグ表示
		}

		// シェーダ時間/解像度
		if (heroMatRef.current) {
			heroMatRef.current.uniforms.uTime.value += delta;
			heroMatRef.current.uniforms.uMouse.value = [0, 0];
			heroMatRef.current.uniforms.uResolution.value = [
				state.size.width,
				state.size.height,
			];
		}
		if (rootRef.current) {
            // モバイルの場合はスケールを小さくする
            const isMobile = state.size.width < 768;
            const currentScale = isMobile ? 0.75 : SCENE_SCALE;

			rootRef.current.scale.set(currentScale, currentScale, currentScale);
			// Parallax Zoom Effect
			const zoomOffset = transitionProgress * 3.0; // Zoom in as hole opens
			rootRef.current.position.z = ROOT_Z_OFFSET + zoomOffset;
		}

		// テトラ回転＆スケール
		if (triangleGroupRef.current) {
			// 手動回転がない場合のみ自動回転
			if (!isDragging.current) {
				triangleRotation.current.x += delta * 0.1;
				triangleRotation.current.y += delta * 0.2;
			}
			// 手動回転を適用
			triangleGroupRef.current.rotation.x = triangleRotation.current.x;
			triangleGroupRef.current.rotation.y = triangleRotation.current.y;

			if (scrollProgress < THIRD_PHASE_START) {
				triangleGroupRef.current.scale.set(1, 1, 1);
			} else if (scrollProgress <= 0.55) {
				const t =
					(scrollProgress - THIRD_PHASE_START) / (0.55 - THIRD_PHASE_START);
				const s = THREE.MathUtils.lerp(1.0, 0.7, smooth01(t));
				triangleGroupRef.current.scale.set(s, s, s);
			} else if (scrollProgress < RETURN_SCROLL_START) {
				triangleGroupRef.current.scale.set(0.7, 0.7, 0.7);
			} else if (scrollProgress <= RETURN_SCROLL_END) {
				const tUp = sstep(
					scrollProgress,
					RETURN_SCROLL_START,
					RETURN_SCROLL_END,
				);
				// const s = THREE.MathUtils.lerp(0.7, 1.0, smooth01(tUp));
				triangleGroupRef.current.scale.set(0.7, 0.7, 0.7);
			} else {
				triangleGroupRef.current.scale.set(1, 1, 1);
			}
		}

		// 枠線の独立した回転アニメーション
		if (lineSegmentsRef.current) {
			// 三角形本体とは逆方向にゆっくり回転
			lineSegmentsRef.current.rotation.x += delta * 0.15;
			lineSegmentsRef.current.rotation.y -= delta * 0.1;
			lineSegmentsRef.current.rotation.z += delta * 0.05;
		}

		// ====== 参照コード準拠：カードの"中央停止 + 慣性"だけ ======
		if (videoCardsRef.current) {
			const phaseLin = THREE.MathUtils.clamp(
				(scrollProgress - THIRD_PHASE_START) /
					(THIRD_PHASE_END - THIRD_PHASE_START),
				0,
				1,
			);
			const phaseEased = smooth01(phaseLin) ** VIDEO_EASE;

			if (scrollProgress >= VIDEO_START_PROGRESS) {
				const thetaRaw = phaseEased * TAU * ROT_TURNS;
				const thetaDwell = dwellWithOffset(
					thetaRaw,
					layout.slotStep,
					CARD_DWELL_FRAC,
					-(-Math.PI / 2), // centerOffset と一致
				);
				const kRot = 1 - Math.exp(-delta * VIDEO_ROT_INERTIA);
				smoothedTheta.current += (thetaDwell - smoothedTheta.current) * kRot;

				videoCardsRef.current.rotation.y = smoothedTheta.current;
				videoCardsRef.current.visible = true;

				// マテリアルの深度状態を正規化
				videoCardsRef.current.traverse((obj) => {
					const m = (obj as THREE.Mesh)?.material as
						| THREE.Material
						| THREE.Material[]
						| undefined;
					if (!m) return;
					const arr = Array.isArray(m) ? m : [m];
					for (const mat of arr) {
						(mat as any).depthTest = true;
						(mat as any).depthWrite = true;
						if ("alphaTest" in mat) (mat as any).alphaTest = 0.001;
					}
				});
			} else {
				videoCardsRef.current.visible = false;
			}
		}

		// ===== 黒円（拡大はゆっくり、縮小は速く） =====
		if (circleRef.current) {
			const endClamped = Math.max(
				CIRCLE_SCROLL_START + 1e-6,
				Math.min(CIRCLE_SCROLL_END, 1.0),
			);
			const tTarget = sstep(scrollProgress, CIRCLE_SCROLL_START, endClamped);
			const speed =
				tTarget >= circleTRef.current
					? CIRCLE_SMOOTH_EXPAND
					: CIRCLE_SMOOTH_SHRINK;
			const k = 1 - Math.exp(-delta * speed);
			circleTRef.current += (tTarget - circleTRef.current) * k;
			const growT = smooth01(circleTRef.current) ** CIRCLE_EASE;

			if (growT > 0) {
				if (triangleGroupRef.current) {
					circleRef.current.position
						.copy(triangleGroupRef.current.position)
						.add(new THREE.Vector3(0, 0, 0.15));
				}

				const cam = state.camera as THREE.PerspectiveCamera;
				const dist = cam.position.z - circleRef.current.position.z;
				const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5)) * dist;
				const halfW = halfH * (state.size.width / state.size.height);
				const needRadius = Math.sqrt(halfW * halfW + halfH * halfH);
				const s = THREE.MathUtils.lerp(0.001, needRadius * 1.2, growT);
				circleRef.current.scale.set(s, s, 1);

				// Contactセクションが表示されている時は黒い円を非表示にして宇宙空間を表示
                // ★修正: transitionProgress > 0 の時も黒い円を非表示にする
				circleRef.current.visible = !isContactVisible && transitionProgress === 0;

				const hideTri = s >= HIDE_TRI_AT_RADIUS;
				// Contactセクションが表示されている時はテトラを隠す（背景のみ表示）
				if (triangleVisibleMeshRef.current)
					triangleVisibleMeshRef.current.visible = !hideTri && !isContactVisible;
				if (lineSegmentsRef.current) lineSegmentsRef.current.visible = !hideTri && !isContactVisible;
				if (videoCardsRef.current) videoCardsRef.current.visible = !hideTri && !isContactVisible;

				if (starGroupRef.current) {
                    // ★追加: 宇宙空間の透明度制御
                    if (isContactVisible || transitionProgress > 0) {
                        // Contact表示中は spaceOpacity で透明度/可視性を制御
                        if (spaceOpacity < 0.05) {
                            starGroupRef.current.visible = false;
                        } else {
                            starGroupRef.current.visible = true;
                            // マテリアルの透明度を更新（簡易的な実装）
                            starGroupRef.current.traverse((obj) => {
                                const m = (obj as any).material;
                                if (m) {
                                    m.transparent = true;
                                    // userDataに元のopacityを保存していなければ保存
                                    if (m.userData.originalOpacity === undefined) {
                                        m.userData.originalOpacity = m.opacity || 1;
                                    }
                                    m.opacity = m.userData.originalOpacity * spaceOpacity;
                                    // depthWriteをoffにすると後ろが透けるが、星は加算合成などが多いのでOK
                                    // ただしPurpleNebulaなどは重なり順に注意
                                }
                            });
                        }
                    } else {
                        // 通常時（Top/Mission）: growTによるフェードアウト
                        const shouldShow = growT < HIDE_BG_AT_T;
                        starGroupRef.current.visible = shouldShow;

                        // 不透明度をリセット (1.0へ戻す)
                        if (shouldShow) {
                            starGroupRef.current.traverse((obj) => {
                                const m = (obj as any).material;
                                if (m && m.userData.originalOpacity !== undefined) {
                                    m.opacity = m.userData.originalOpacity;
                                }
                            });
                        }
                    }
                }
			} else {
				circleRef.current.visible = false;
				circleRef.current.scale.set(0.001, 0.001, 1);

				if (triangleVisibleMeshRef.current)
					triangleVisibleMeshRef.current.visible = true;
				if (lineSegmentsRef.current) lineSegmentsRef.current.visible = true;
				if (starGroupRef.current) {
                    starGroupRef.current.visible = true;
                    // Reset opacity
                    starGroupRef.current.traverse((obj) => {
                        const m = (obj as any).material;
                        if (m && m.userData.originalOpacity !== undefined) {
                            m.opacity = m.userData.originalOpacity;
                        }
                    });
                }
			}
		}

		// 背景スター微回転
		if (starGroupRef.current) {
			starGroupRef.current.rotation.y += 0.0005;
		}
	});

	return (
		<>
			<color attach="background" args={["black"]} />

			{/* ===== 通常シーン ===== */}
			<group ref={rootRef} position={[0, 0, ROOT_Z_OFFSET]}>
				<group ref={starGroupRef}>
					<Suspense fallback={null}>
						<StarParticles selfRotate={false} position={[0, 0, -10]} />
						<ShootingStars interval={3500} duration={4000} />
						{/* 紫色のガス状の雲（ランダム配置） */}
						{nebulaPositions.map((pos, index) => (
							<PurpleNebula
								key={index}
								position={[pos.x, pos.y, pos.z]}
								renderOrder={6}
								scale={pos.scale}
								opacity={pos.opacity}
								rotation={[0, 0, pos.rotation]}
							/>
						))}
					</Suspense>
				</group>

				{/* テトラ */}
				<group ref={triangleGroupRef} position={[0, 0, 0]}>
					<mesh
						ref={triangleVisibleMeshRef}
						renderOrder={3}
						onPointerDown={(e) => {
							e.stopPropagation();
							isDragging.current = true;
							previousMousePosition.current = { x: e.clientX, y: e.clientY };
						}}
						onPointerMove={(e) => {
							if (!isDragging.current) return;
							e.stopPropagation();

							const deltaX = e.clientX - previousMousePosition.current.x;
							const deltaY = e.clientY - previousMousePosition.current.y;

							triangleRotation.current.y += deltaX * 0.01;
							triangleRotation.current.x += deltaY * 0.01;

							previousMousePosition.current = { x: e.clientX, y: e.clientY };
						}}
						onPointerUp={(e) => {
							e.stopPropagation();
							isDragging.current = false;
						}}
						onPointerLeave={(e) => {
							e.stopPropagation();
							isDragging.current = false;
						}}
					>
						<tetrahedronGeometry args={[tetraRadius, 0]} />
						<heroShaderMaterial ref={heroMatRef} transparent={false} />
					</mesh>
					<primitive
						ref={lineSegmentsRef}
						object={lineSegments}
						renderOrder={4}
					/>
				</group>

				{/* カード群 */}
				<group ref={videoCardsRef} renderOrder={2} position={[0, 0, 0]}>
					<Suspense fallback={null}>
						<VideoCardsRenderer
							scrollProgress={scrollProgress}
							videoSlides={videoSlides}
							layout={layout}
							requiredTurns={requiredTurns}
							ROT_TURNS={ROT_TURNS}
							onCardClick={onCardClick}
							onCardHover={onCardHover}
						/>
					</Suspense>
				</group>

				{/* 黒円（暗転） */}
				<mesh
					ref={circleRef}
					position={[0, 0, 0.15]}
					renderOrder={1000}
					frustumCulled={false}
					visible={false}
				>
					<circleGeometry args={[1, 128]} />
					<primitive attach="material" object={featherMat} />
				</mesh>
			</group>

			{/* ===== 画面の液体屈折（ヒーロー内のみ作用） ===== */}
			<mesh
				ref={fluidRef}
				renderOrder={10000}
				frustumCulled={false}
				raycast={() => null}
			>
				<planeGeometry args={[2, 2, 1, 1]} />
				<hoverFluidMaterial
					ref={(m: any) => {
						if (m) hoverMatRef.current = m;
					}}
					attach="material"
					transparent={true}
					depthTest={false}
					depthWrite={false}
					blending={THREE.NoBlending as any}
					toneMapped={false}
				/>
			</mesh>
		</>
	);
}

// ===== HeroCanvas =====
interface HeroCanvasProps {
	children: ReactNode;
	videoSlides?: VideoSlide[];
}

const HeroCanvas = ({ children, videoSlides }: HeroCanvasProps) => {
	// フォールバック機能付きで安全にvideoSlidesを取得
	const safeVideoSlides = getSafeVideoSlides(videoSlides);

	const [scrollProgress, setScrollProgress] = useState(0);
	const [selectedCard, setSelectedCard] = useState<{
		slide: VideoSlide;
		index: number;
	} | null>(null);
	const [isCardHovering, setIsCardHovering] = useState(false);
	const [isContactVisible, setIsContactVisible] = useState(false);
    const [spaceOpacity, setSpaceOpacity] = useState(1);
    const [transitionProgress, setTransitionProgress] = useState(0);

	const handleCardClick = (slide: VideoSlide, index: number) => {
		setSelectedCard({ slide, index });
	};

	const handleCloseModal = () => {
		setSelectedCard(null);
	};

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;
			setScrollProgress(Math.min(Math.max(scrolled, 0), 1));
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<HeroStateContext.Provider value={{ setIsContactVisible, spaceOpacity, setSpaceOpacity, transitionProgress, setTransitionProgress }}>
			<Canvas
				camera={{ position: [0, 0, CAMERA_Z], fov: 75 }}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					zIndex: 0,
					pointerEvents: "auto",
				}}
				gl={{ antialias: true, alpha: false }}
			>
				<HeroScene
					scrollProgress={scrollProgress}
					videoSlides={safeVideoSlides}
					onCardClick={handleCardClick}
					onCardHover={setIsCardHovering}
					isContactVisible={isContactVisible}
                    spaceOpacity={spaceOpacity}
                    transitionProgress={transitionProgress}
				/>
			</Canvas>

			<div
				style={{
					position: "relative",
					zIndex: 10,
					minHeight: "1000vh",
					pointerEvents: "none",
				}}
			>
				{children}
			</div>

			{/* カード詳細モーダル */}
			{selectedCard && (
				<CardDetailModal
					isOpen={!!selectedCard}
					onClose={handleCloseModal}
					slide={selectedCard.slide}
					index={selectedCard.index}
				/>
			)}

			{/* HTMLホバーポインタ */}
			<HtmlHoverPointer isHovering={isCardHovering} />
		</HeroStateContext.Provider>
	);
};

export default HeroCanvas;
