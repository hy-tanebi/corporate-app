"use client";

import { useEffect, useRef } from "react";

interface HtmlHoverPointerProps {
	isHovering: boolean;
}

/** 円の直径。translate(-50%, -50%) で中心をマウス位置に合わせている */
const SIZE_PX = 160;
/** 1フレームあたり目標値に近づく割合 */
const LERP = 0.15;
/** これ以下の差は収束とみなして目標値に吸着させる */
const EPSILON = 0.001;

/**
 * 3Dカードにホバーしたときにマウス位置へ出る「CLICK」の円。
 * 流体エフェクトの影響を受けないよう、Canvas ではなく HTML レイヤーで描く。
 *
 * 実装上の要点が3つある。
 *
 * 1. 位置は left/top ではなく transform で動かす。
 *    left/top はレイアウト計算を伴うため、マウス移動のたびにレイアウトシフトとして
 *    計上されていた（DevTools の CLS で、カードにホバーしている間だけ shifts が
 *    増え続け、カード外に出ると止まる挙動として実測できた）。
 *    transform での移動はレイアウトを起こさないので、この計上自体が無くなる。
 *
 * 2. React の state を持たない。
 *    以前は mousemove のたびに setState していたため、マウスを動かす限り
 *    再レンダリングが発生していた。座標もスケールも ref に持ち、DOM を直接書く。
 *
 * 3. rAF は1本だけ、しかも仕事が無くなったら止める。
 *    以前はスケール用の rAF が、目標値に到達したあとも毎フレーム自分を予約し続けて
 *    いた。ホバーしていない間も回りっぱなしになる明確な不具合だった。
 */
export function HtmlHoverPointer({ isHovering }: HtmlHoverPointerProps) {
	const elementRef = useRef<HTMLDivElement>(null);
	const pointerRef = useRef({ x: 0, y: 0 });
	const scaleRef = useRef(0);
	const targetScaleRef = useRef(0);
	const rafRef = useRef<number | null>(null);
	// isHovering 側の effect から呼ぶため、スケジューラを ref 経由で公開する
	const scheduleRef = useRef<() => void>(() => {});

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		const render = () => {
			// scale → translate(-50%, -50%) → translate3d の順に効くため、
			// 拡大率にかかわらず円の中心がマウス位置に一致する
			element.style.transform = `translate3d(${pointerRef.current.x}px, ${pointerRef.current.y}px, 0) translate(-50%, -50%) scale(${scaleRef.current})`;
		};

		// tick と schedule は相互に呼び合う。schedule は tick より後に定義されるが、
		// 実際に呼ばれるのは初期化後なので問題ない
		const tick = () => {
			rafRef.current = null;

			const diff = targetScaleRef.current - scaleRef.current;
			if (Math.abs(diff) < EPSILON) {
				scaleRef.current = targetScaleRef.current;
			} else {
				scaleRef.current += diff * LERP;
			}

			render();

			if (scaleRef.current !== targetScaleRef.current) {
				schedule();
			} else if (scaleRef.current === 0) {
				// 完全に消えたので合成レイヤーを手放す。常時 will-change を付けたままにすると
				// レイヤー用のメモリを確保し続けてしまう
				element.style.willChange = "auto";
			}
		};

		const schedule = () => {
			if (rafRef.current !== null) return;
			element.style.willChange = "transform";
			rafRef.current = requestAnimationFrame(tick);
		};

		scheduleRef.current = schedule;

		const handlePointerMove = (event: PointerEvent) => {
			pointerRef.current.x = event.clientX;
			pointerRef.current.y = event.clientY;
			// 見えていない間は DOM を触る必要がない。座標だけ覚えておき、
			// ホバーが始まったときにまとめて反映する
			if (targetScaleRef.current > 0 || scaleRef.current > 0) {
				schedule();
			}
		};

		render();
		window.addEventListener("pointermove", handlePointerMove, {
			passive: true,
		});

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		targetScaleRef.current = isHovering ? 1 : 0;
		scheduleRef.current();
	}, [isHovering]);

	return (
		<div
			ref={elementRef}
			style={{
				position: "fixed",
				// 位置は transform で与えるため、基準は常にビューポート左上に固定する
				left: 0,
				top: 0,
				width: `${SIZE_PX}px`,
				height: `${SIZE_PX}px`,
				borderRadius: "50%",
				backgroundColor: "white",
				// この文字列は毎レンダリング同じ値でなければならない。
				// 値が変わると React が DOM に書き戻し、上の effect が直接書いた
				// transform を打ち消してしまう（同じ値なら React は DOM を触らない）
				transform: "translate3d(0px, 0px, 0) translate(-50%, -50%) scale(0)",
				pointerEvents: "none",
				zIndex: 9999,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "black",
				fontWeight: "bold",
				fontSize: "24px",
				letterSpacing: "0.1em",
				mixBlendMode: "difference",
			}}
		>
			CLICK
		</div>
	);
}
