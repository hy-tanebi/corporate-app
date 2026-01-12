import * as THREE from "three";

// Constants (must match hero-canvas.tsx / VideoCardsRenderer.tsx)
export const TAU = Math.PI * 2;
export const THIRD_PHASE_START = 0.3;
export const THIRD_PHASE_END = 0.93;
export const VIDEO_START_PROGRESS = 0.35;
export const VIDEO_EASE = 5.0;
export const CARD_DWELL_FRAC = 0.95;
export const GAP_TURNS = 0.15;
export const FADE_FRAC = 0.7;

// Utility functions
export const smooth01 = (x: number) => {
	const t = THREE.MathUtils.clamp(x, 0, 1);
	return t * t * (3 - 2 * t);
};

export function dwellWithOffset(
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

export interface CardStatus {
	opacity: number;
	isActive: boolean;
	progress: number;
}

export function calculateCardStatus(
	scrollProgress: number,
	rank: number,
	slotStep: number,
	requiredTurns: number,
	ROT_TURNS: number,
): CardStatus {
	// Phase Calculation
	const phaseLin = THREE.MathUtils.clamp(
		(scrollProgress - THIRD_PHASE_START) /
			(THIRD_PHASE_END - THIRD_PHASE_START),
		0,
		1,
	);
	const phaseEased = smooth01(phaseLin) ** VIDEO_EASE;

	const thirdPhaseAtStart =
		(VIDEO_START_PROGRESS - THIRD_PHASE_START) /
		(THIRD_PHASE_END - THIRD_PHASE_START);
	const thirdPhaseAtStartEased = smooth01(thirdPhaseAtStart) ** VIDEO_EASE;

	const thetaRaw = phaseEased * TAU * ROT_TURNS;
	const thetaDisplay = dwellWithOffset(
		thetaRaw,
		slotStep,
		CARD_DWELL_FRAC,
		-(-Math.PI / 2),
	);

	const thetaStart = thirdPhaseAtStartEased * TAU * ROT_TURNS;
	const thetaStartDisplay = dwellWithOffset(
		thetaStart,
		slotStep,
		CARD_DWELL_FRAC,
		-(-Math.PI / 2),
	);

	const thetaRel = Math.max(0, thetaDisplay - thetaStartDisplay);

	const appearStart = 0;
	const appearEnd = TAU;
	const holdEnd = TAU * (1 + GAP_TURNS);
	const fadeEnd = requiredTurns * TAU;

	const appearAt = rank * slotStep;
	const fadeInEnd = appearAt + slotStep * FADE_FRAC;
	const fadeStartAt = TAU * (1 + GAP_TURNS) + rank * slotStep;
	const fadeOutEnd = fadeStartAt + slotStep * FADE_FRAC;

	let opacity = 0;
	if (thetaRel >= appearStart && thetaRel < appearEnd) {
		if (thetaRel < appearAt) opacity = 0;
		else if (thetaRel < fadeInEnd) {
			const k = (thetaRel - appearAt) / (slotStep * FADE_FRAC);
			opacity = smooth01(THREE.MathUtils.clamp(k, 0, 1));
		} else {
			opacity = 1;
		}
	} else if (thetaRel >= appearEnd && thetaRel < holdEnd) {
		opacity = 1;
	} else if (thetaRel >= holdEnd && thetaRel < fadeEnd) {
		if (thetaRel < fadeStartAt) {
			opacity = 0.3;
		} else if (thetaRel < fadeOutEnd) {
			const k = (thetaRel - fadeStartAt) / (slotStep * FADE_FRAC);
			opacity = (1 - smooth01(THREE.MathUtils.clamp(k, 0, 1))) * 0.3;
		} else {
			opacity = 0;
		}
	} else {
		opacity = 0;
	}

	const isInteractive = thetaRel < holdEnd;
	const finalIsInteractive = isInteractive && opacity > 0.05;

	return {
		opacity,
		isActive: finalIsInteractive,
		progress: phaseEased,
	};
}
