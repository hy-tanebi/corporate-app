"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// コンテンツデータ
const CONTENT_ITEMS = [
	{
		id: "01",
		title: "AIとWebを使って、ビジネスの課題に向き合います。",
		description:
			"AIによる業務効率化や、Webサイトの制作・運用を通じて、日々の業務や運用上の課題に取り組んでいます。複雑になりがちな技術を、現場で無理なく活用できる形に整理し、実務に役立つ形で取り入れます。",
	},
	{
		id: "02",
		title: "外部の制作会社ではなく、チームの一員として。",
		description:
			"言われたものを作るだけではなく、業務内容や組織の状況を理解した上で、一緒に考えながら進めたいと考えています。社内のIT担当に近い立場で、WebやAI活用の相談役として継続的にサポートします。",
	},
	{
		id: "03",
		title: "つくる人、使う人、続ける事業のために。",
		description:
			"要件を満たすだけの制作ではなく、AIエージェントが正しく機能し、実際に使われ、事業の中で機能し続けることを見据えた三つの視点を重ねて設計・実装を行っていきます。",
	},
];

interface MissionContentProps {
	scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function MissionContent({
	scrollContainerRef,
}: MissionContentProps) {
	return (
		<>
			<div className="hidden md:block">
				<MissionContentDesktop scrollContainerRef={scrollContainerRef} />
			</div>
			<div className="block md:hidden">
				<MissionContentMobile scrollContainerRef={scrollContainerRef} />
			</div>
		</>
	);
}

// === Desktop Implementation (Sticky Scroll) ===
function MissionContentDesktop({
	scrollContainerRef,
}: {
	scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		container: scrollContainerRef as React.RefObject<HTMLElement>,
		offset: ["start start", "end end"],
	});

	// Smooth scroll progress to create "fuwatto" (soft/floating) feel.
	// Adjusted for stability: faster tracking (stiffness 60) with reduced overshoot (damping 30).
	// Mass added for natural deceleration.
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 60,
		damping: 30,
		mass: 0.8,
		restDelta: 0.001,
	});

	// Unified Phase Logic: 0 to 3
	const currentPhase = useTransform(smoothProgress, [0, 1], [0, 3]);

	// Shapes Transforms (Syncing perfectly with phase)
	// Shape 1: Square (Business) - Phase 0-1
	const squareOpacity = useTransform(
		currentPhase,
		[0, 0.2, 0.8, 1],
		[0, 1, 1, 0],
	);
	const squareScale = useTransform(currentPhase, [0, 1], [0.95, 1.05]);
	const squareRotate = useTransform(currentPhase, [0, 1], [0, 10]);

	// Shape 2: Pair (Partner) - Phase 1-2
	const pairOpacity = useTransform(
		currentPhase,
		[1, 1.2, 1.8, 2],
		[0, 1, 1, 0],
	);
	const pairScale = useTransform(currentPhase, [1, 2], [0.95, 1.05]);
	const pairGap = useTransform(currentPhase, [1, 2], [-50, 50]);

	// Shape 3: Sanpo-yoshi (Triangle/Circles) - Phase 2-3 (Standardized)
	const sanpoOpacity = useTransform(
		currentPhase,
		[2, 2.2, 2.8, 3.0],
		[0, 1, 1, 0],
	);
	const sanpoScale = useTransform(currentPhase, [2, 3], [0.95, 1.05]);
	const sanpoRotate = useTransform(currentPhase, [2, 3], [0, 0]);
	// Move from outside (expanded) to inside (tight overlap) - Keep convergence speed punchy
	const sanpoOffset = useTransform(currentPhase, [2, 2.4], [100, 0]); // Adjusted for shorter duration
	const centerScale = useTransform(currentPhase, [2.25, 2.45], [0, 1]); // Adjusted for shorter duration

	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div
			ref={containerRef}
			className="relative w-full max-w-[1600px] mx-auto"
			style={{ height: isMobile ? "500vh" : "450vh" }}
		>
			<div className="sticky top-0 h-screen w-full flex flex-row overflow-hidden">
				{/* Left Column: Visuals (50%) - Centered */}
				<div className="w-1/2 h-full flex items-center justify-center relative">
					<div className="relative w-[500px] h-[500px] flex items-center justify-center">
						{/* Shape 1: Square */}
						<motion.div
							className="absolute bg-[#50B070] rounded-3xl"
							style={{
								width: 280,
								height: 280,
								scale: squareScale,
								opacity: squareOpacity,
								rotate: squareRotate,
								zIndex: 10,
								willChange: "transform, opacity",
							}}
						/>

						{/* Shape 2: Pair */}
						<motion.div
							className="absolute flex items-center justify-center"
							style={{
								scale: pairScale,
								opacity: pairOpacity,
								zIndex: 10,
								willChange: "transform, opacity",
							}}
						>
							<div className="relative flex items-center justify-center">
								<motion.div
									className="w-[180px] h-[180px] bg-[#E6C844] rounded-full mix-blend-multiply opacity-90"
									style={{
										x: pairGap,
										willChange: "transform",
									}}
								/>
								<motion.div
									className="w-[180px] h-[180px] bg-[#205090] rounded-full mix-blend-multiply opacity-90"
									style={{
										x: useTransform(pairGap, (v) => -v),
										willChange: "transform",
									}}
								/>
							</div>
						</motion.div>
						{/* Shape 3: Sanpo-yoshi (Pyramid Layout - Centered matching Pair) */}
						<motion.div
							className="absolute flex items-center justify-center"
							style={{
								scale: sanpoScale,
								opacity: sanpoOpacity,
								rotate: sanpoRotate,
								zIndex: 10,
								willChange: "transform, opacity",
							}}
						>
							<div className="relative w-[400px] h-[400px] flex items-center justify-center">
								{/* Top: Seller */}
								<motion.div
									className="absolute top-[30px] w-[180px] h-[180px] rounded-full mix-blend-multiply opacity-90"
									style={{
										backgroundColor: "#50B070",
										y: useTransform(sanpoOffset, (v) => -v),
									}}
								/>

								{/* Bottom Right: Buyer */}
								<motion.div
									className="absolute bottom-[40px] right-[40px] w-[180px] h-[180px] rounded-full mix-blend-multiply opacity-90"
									style={{
										backgroundColor: "#205090",
										x: sanpoOffset,
										y: sanpoOffset,
									}}
								/>

								{/* Bottom Left: Society (Sun) */}
								<motion.div
									className="absolute bottom-[40px] left-[40px] w-[180px] h-[180px] rounded-full mix-blend-multiply opacity-90"
									style={{
										backgroundColor: "#E6C844",
										x: useTransform(sanpoOffset, (v) => -v),
										y: sanpoOffset,
									}}
								/>

								{/* Center: Sanpo (Flower) */}
								<motion.div
									className="absolute flex items-center justify-center z-20"
									style={{ scale: centerScale, width: 140, height: 140 }}
								>
									{/* Petals */}
									{[0, 60, 120, 180, 240, 300].map((deg) => (
										<div
											key={deg}
											className="absolute w-[60px] h-[60px] bg-white rounded-full shadow-sm"
											style={{ transform: `rotate(${deg}deg) translate(28px)` }}
										/>
									))}
									{/* Center Stigma */}
									<div className="absolute w-[70px] h-[70px] bg-[#FFF5E5] rounded-full shadow-inner flex items-center justify-center">
										<div className="w-[30px] h-[30px] bg-[#FF8C00] rounded-full opacity-90 shadow-sm" />
									</div>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</div>

				{/* Right Column: Text Content (50%) - Check padding */}
				<div className="w-1/2 h-full flex flex-col justify-center relative pointer-events-none">
					<div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-auto">
						{CONTENT_ITEMS.map((item, index) => (
							<ScrollOpacityItem
								key={item.id}
								data={item}
								index={index}
								phase={currentPhase}
								duration={1.0}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function ScrollOpacityItem({
	data,
	index,
	phase,
	duration = 1.0,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: Data structure
	data: any;
	index: number;
	// biome-ignore lint/suspicious/noExplicitAny: Motion value type
	phase: any;
	duration?: number;
}) {
	const opacity = useTransform(
		phase,
		[index, index + 0.2, index + duration - 0.2, index + duration],
		[0, 1, 1, 0],
	);

	const y = useTransform(phase, [index, index + duration], [50, -50]);

	return (
		<motion.div className="absolute w-full max-w-4xl" style={{ opacity, y }}>
			{index === 0 && (
				<span className="block text-[#50B070] font-bold text-xl mb-4">01.</span>
			)}
			{index === 1 && (
				<span className="block font-bold text-xl mb-4">
					<span className="text-[#E6C844]">02</span>
					<span className="text-[#205090]">.</span>
				</span>
			)}
			{index === 2 && (
				<span className="block font-bold text-xl mb-4">
					<span className="text-[#50B070]">0</span>
					<span className="text-[#E6C844]">3</span>
					<span className="text-[#205090]">.</span>
				</span>
			)}
			<h3 className="text-[2rem] font-black text-white mb-6 leading-[1.3] font-sans tracking-wide">
				{data.title}
			</h3>
			<p className="text-base text-gray-300 leading-loose">
				{data.description}
			</p>
		</motion.div>
	);
}

// === Mobile Implementation (Sticky Scroll - Single Column) ===
function MissionContentMobile({
	scrollContainerRef,
}: {
	scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		container: scrollContainerRef as React.RefObject<HTMLElement>,
		offset: ["start start", "end end"],
	});

	// Same optimized spring as desktop for stability
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 60,
		damping: 30,
		mass: 0.8,
		restDelta: 0.001,
	});

	// Unified Phase Logic: 0 to 3
	const currentPhase = useTransform(smoothProgress, [0, 1], [0, 3]);

	// Shape 1: Square - Phase 0-1
	const squareOpacity = useTransform(
		currentPhase,
		[0, 0.2, 0.8, 1],
		[0, 1, 1, 0],
	);
	const squareScale = useTransform(currentPhase, [0, 1], [0.95, 1.05]);
	const squareRotate = useTransform(currentPhase, [0, 1], [0, 10]);

	// Shape 2: Pair - Phase 1-2
	const pairOpacity = useTransform(
		currentPhase,
		[1, 1.2, 1.8, 2],
		[0, 1, 1, 0],
	);
	const pairScale = useTransform(currentPhase, [1, 2], [0.95, 1.05]);
	const pairGap = useTransform(currentPhase, [1, 2], [-30, 30]);

	// Shape 3: Sanpo - Phase 2-3
	const sanpoOpacity = useTransform(
		currentPhase,
		[2, 2.2, 2.8, 3.0],
		[0, 1, 1, 0],
	);
	const sanpoScale = useTransform(currentPhase, [2, 3], [0.95, 1.05]);
	const sanpoOffset = useTransform(currentPhase, [2, 2.4], [60, 0]);
	const centerScale = useTransform(currentPhase, [2.25, 2.45], [0, 1]);

	return (
		<div
			ref={containerRef}
			className="relative w-full"
			style={{ height: "300vh" }}
		>
			<div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-8">
				{/* Shapes Container (Top) */}
				<div className="relative w-[200px] h-[200px] flex items-center justify-center mb-6">
					{/* Shape 1: Square */}
					<motion.div
						className="absolute bg-[#50B070] rounded-3xl"
						style={{
							width: 140,
							height: 140,
							scale: squareScale,
							opacity: squareOpacity,
							rotate: squareRotate,
							zIndex: 10,
						}}
					/>

					{/* Shape 2: Pair */}
					<motion.div
						className="absolute flex items-center justify-center"
						style={{
							scale: pairScale,
							opacity: pairOpacity,
							zIndex: 10,
						}}
					>
						<div className="relative flex items-center justify-center">
							<motion.div
								className="w-[100px] h-[100px] bg-[#E6C844] rounded-full mix-blend-multiply opacity-90"
								style={{ x: pairGap }}
							/>
							<motion.div
								className="w-[100px] h-[100px] bg-[#205090] rounded-full mix-blend-multiply opacity-90"
								style={{ x: useTransform(pairGap, (v) => -v) }}
							/>
						</div>
					</motion.div>

					{/* Shape 3: Sanpo */}
					<motion.div
						className="absolute flex items-center justify-center"
						style={{
							scale: sanpoScale,
							opacity: sanpoOpacity,
							zIndex: 10,
						}}
					>
						<div className="relative w-[220px] h-[240px] flex items-center justify-center">
							{/* Top: Green (Seller) - Centered at top */}
							<motion.div
								className="absolute w-[120px] h-[120px] rounded-full bg-[#50B070] mix-blend-multiply opacity-90"
								style={{
									top: 20,
									left: "50%",
									marginLeft: -60,
									y: useTransform(sanpoOffset, (v) => -v)
								}}
							/>
							{/* Bottom Left: Yellow (Society) */}
							<motion.div
								className="absolute w-[120px] h-[120px] rounded-full bg-[#E6C844] mix-blend-multiply opacity-90"
								style={{
									bottom: 20,
									left: "50%",
									marginLeft: -100,
									x: useTransform(sanpoOffset, (v) => -v),
									y: sanpoOffset
								}}
							/>
							{/* Bottom Right: Blue (Buyer) */}
							<motion.div
								className="absolute w-[120px] h-[120px] rounded-full bg-[#205090] mix-blend-multiply opacity-90"
								style={{
									bottom: 20,
									left: "50%",
									marginLeft: -20,
									x: sanpoOffset,
									y: sanpoOffset
								}}
							/>
							{/* Center Flower */}
							<motion.div
								className="absolute flex items-center justify-center z-20"
								style={{
									scale: centerScale,
									width: 80,
									height: 80,
								}}
							>
								{[0, 60, 120, 180, 240, 300].map((deg) => (
									<div
										key={deg}
										className="absolute w-[32px] h-[32px] bg-white rounded-full shadow-sm"
										style={{ transform: `rotate(${deg}deg) translate(16px)` }}
									/>
								))}
								<div className="absolute w-[40px] h-[40px] bg-[#FFF5E5] rounded-full shadow-inner flex items-center justify-center">
									<div className="w-[18px] h-[18px] bg-[#FF8C00] rounded-full opacity-90 shadow-sm" />
								</div>
							</motion.div>
						</div>
					</motion.div>
				</div>

				{/* Text Content (Bottom) - Stacked */}
				<div className="relative w-full h-[200px]">
					{CONTENT_ITEMS.map((item, index) => (
						<ScrollOpacityItemMobile
							key={item.id}
							data={item}
							index={index}
							phase={currentPhase}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function ScrollOpacityItemMobile({
	data,
	index,
	phase,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: Data structure
	data: any;
	index: number;
	// biome-ignore lint/suspicious/noExplicitAny: Motion value type
	phase: any;
}) {
	const opacity = useTransform(
		phase,
		[index, index + 0.2, index + 0.8, index + 1],
		[0, 1, 1, 0],
	);

	const y = useTransform(phase, [index, index + 1], [30, -30]);

	return (
		<motion.div className="absolute inset-0 w-full" style={{ opacity, y }}>
			{index === 0 && (
				<span className="block text-[#50B070] font-bold text-lg mb-2">01.</span>
			)}
			{index === 1 && (
				<span className="block font-bold text-lg mb-2">
					<span className="text-[#E6C844]">02</span>
					<span className="text-[#205090]">.</span>
				</span>
			)}
			{index === 2 && (
				<span className="block font-bold text-lg mb-2">
					<span className="text-[#50B070]">0</span>
					<span className="text-[#E6C844]">3</span>
					<span className="text-[#205090]">.</span>
				</span>
			)}
			<h3 className="text-[1.3rem] font-black text-white leading-[1.3] mb-3">
				{data.title}
			</h3>
			<p className="text-sm text-gray-300 leading-relaxed">
				{data.description}
			</p>
		</motion.div>
	);
}


