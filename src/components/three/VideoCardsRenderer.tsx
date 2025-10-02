import * as THREE from "three";
import VideoCard3D from "./VideoCard3D";
import { VideoSlide } from "../../types/content";

// Constants
const TAU = Math.PI * 2;
const THIRD_PHASE_START = 0.5;
const THIRD_PHASE_END = 0.88;
const VIDEO_START_PROGRESS = 0.57;
const VIDEO_EASE = 5.0;
const CARD_DWELL_FRAC = 0.95;
const GAP_TURNS = 0.15;
const FADE_FRAC = 0.7;

// Utility functions
const smooth01 = (x: number) => {
	const t = THREE.MathUtils.clamp(x, 0, 1);
	return t * t * (3 - 2 * t);
};

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

interface VideoCardsRendererProps {
	scrollProgress: number;
	videoSlides: VideoSlide[];
	layout: {
		n: number;
		items: Array<{
			index: number;
			angle: number;
			x: number;
			z: number;
			rank: number;
		}>;
		slotStep: number;
	};
	requiredTurns: number;
	ROT_TURNS: number;
	onCardClick?: (slide: VideoSlide, index: number) => void;
}

export default function VideoCardsRenderer({
	scrollProgress,
	videoSlides,
	layout,
	requiredTurns,
	ROT_TURNS,
	onCardClick,
}: VideoCardsRendererProps) {
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
		layout.slotStep,
		CARD_DWELL_FRAC,
		-(-Math.PI / 2), // centerOffset と同値
	);

	const thetaStart = thirdPhaseAtStartEased * TAU * ROT_TURNS;
	const thetaStartDisplay = dwellWithOffset(
		thetaStart,
		layout.slotStep,
		CARD_DWELL_FRAC,
		-(-Math.PI / 2),
	);

	const thetaRel = Math.max(0, thetaDisplay - thetaStartDisplay);

	const { slotStep } = layout;
	const appearStart = 0;
	const appearEnd = TAU;
	const holdEnd = TAU * (1 + GAP_TURNS);
	const fadeEnd = requiredTurns * TAU;

	return (
		<>
			{layout.items.map(({ index, angle, x, z, rank }) => {
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
					if (thetaRel < fadeStartAt) opacity = 1;
					else if (thetaRel < fadeOutEnd) {
						const k = (thetaRel - fadeStartAt) / (slotStep * FADE_FRAC);
						opacity = 1 - smooth01(THREE.MathUtils.clamp(k, 0, 1));
					} else opacity = 0;
				} else {
					opacity = 0;
				}

				const slide = videoSlides[index];

				return (
					<VideoCard3D
						key={slide.id}
						videoSrc={slide.mp4}
						imageSrc={slide.imageSrc}
						mediaType={slide.mediaType || "video"}
						title={slide.title}
						position={[x, 0, z]}
						rotation={[0, angle + Math.PI, 0]}
						isActive={opacity > 0.05}
						progress={phaseEased}
						scale={0.7}
						opacity={opacity}
						onClick={() => onCardClick?.(slide, index)}
					/>
				);
			})}
		</>
	);
}
