"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion"; // Keep for content fade/slide if needed, or fully GSAP. Mixing is fine for simple item staggering.
import { Menu, X } from "lucide-react";
import gsap from "gsap";

export function SidebarMenu() {
	const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // For X button animation
	const pathRef = useRef<SVGPathElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const toggleMenu = () => setIsOpen((prev) => !prev);

    // Close with animation for the X button
    const handleClose = async () => {
        setIsClosing(true);
        // Wait for rotation (approx 400ms)
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsOpen(false);
        setIsClosing(false);
    };

	const menuItems = [
		{ href: "/blog", label: "Blog" },
		{ href: "/about", label: "About" },
		{ href: "/contact", label: "お問い合わせ" },
	];

	useEffect(() => {
		if (isOpen) {
			// Open Animation
			// Start flat on the right
			const width = window.innerWidth;
			const height = window.innerHeight;

            // 画面の少し右外からスタート
			const startPath = `M ${width} 0 Q ${width} ${height / 2} ${width} ${height}`;
            // 最終的になめらかな曲線で覆う (画面幅の半分くらいまで)
            // 制御点を遠くに飛ばして「ニュルっ」とさせる
			const targetX = width > 768 ? width - 400 : 0; // PC: 400px幅, SP: 全画面
            const controlOffset = width > 768 ? 200 : 100; // 制御点の引っ張り具合

            // アニメーションステップ
            // 1. 制御点が先行して左に伸びる（液体が伸びる感じ）
			const midPath = `M ${width} 0 Q ${targetX - controlOffset} ${height / 2} ${width} ${height}`;
            // 2. 最終形（長方形に近いが、少しアールを残すか、完全に埋める）
            // 完全に四角にするなら Lを使うが、ニュルっと感なら曲線のまま着地が良い
            // ここではシンプルに四角形に着地させる
			const endPath = `M ${width} 0 Q ${targetX} ${height / 2} ${width} ${height} L ${targetX} ${height} L ${targetX} 0 Z`;

            // GSAPでpathのd属性を補間するのは難しいので、カスタムオブジェクトで数値をトゥイーンさせてdを更新する
            // あるいは、シンプルなSVG変形ならSnap.svgなどが強いが、今回はReact+GSAPでやる。
            // GSAPのMorphSVGPluginは有料なので、自前で制御点座標をアニメーションさせる。

		}
	}, [isOpen]);

    // GSAP Context Effect
    useEffect(() => {
        const svgPath = pathRef.current;
        if (!svgPath) return;

        const ctx = gsap.context(() => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            // メニュー幅
            const menuWidth = width > 768 ? 450 : width;

            if (isOpen) {
                // OPEN ANIMATION
                // 1. Path appears
                gsap.set(svgPath, { attr: { d: `M ${width} 0 Q ${width} ${height / 2} ${width} ${height} Z` }, opacity: 1 });

                const tl = gsap.timeline();

                // 制御点と終点をアニメーション
                // オブジェクトで管理してonUpdateでパスを適用
                const progress = { x: width, controlX: width };

                // OPEN ANIMATION
                tl.to(progress, {
                    x: width - menuWidth,
                    controlX: width - menuWidth - 40, // オーバーシュートを控えめに（100 -> 40）
                    duration: 0.6, // 少し速く
                    ease: "power3.out", // より自然な減速
                    onUpdate: () => {
                         const x = progress.x;
                         const cx = progress.controlX;
                         svgPath.setAttribute("d", `M ${width} 0 L ${x} 0 Q ${cx} ${height / 2} ${x} ${height} L ${width} ${height} Z`);
                    }
                })
                .to(progress, {
                    controlX: width - menuWidth, // 戻る動きも小さくなる
                    duration: 0.8,
                    ease: "elastic.out(1, 0.5)",
                    onUpdate: () => {
                         const x = progress.x;
                         const cx = progress.controlX;
                         svgPath.setAttribute("d", `M ${width} 0 L ${x} 0 Q ${cx} ${height / 2} ${x} ${height} L ${width} ${height} Z`);
                    }
                });

            } else {
                // CLOSE ANIMATION
                 const currentD = svgPath.getAttribute("d");
                 if (!currentD || currentD.includes(`M ${width} 0 Q ${width} ${height / 2} ${width} ${height}`)) return; // 既に閉じている

                 // width, menuWidth are already defined in the upper scope
                 const progress = { x: width - menuWidth, controlX: width - menuWidth };

                 const tl = gsap.timeline();

                 // 1. 閉じる時も少し粘り気を持たせるが控えめに
                 tl.to(progress, {
                     x: width,
                     controlX: width - menuWidth + 40, // 逆方向に少し残る（控えめに）
                     duration: 0.5,
                     ease: "power2.in",
                     onUpdate: () => {
                         const x = progress.x;
                         const cx = progress.controlX;
                         svgPath.setAttribute("d", `M ${width} 0 L ${x} 0 Q ${cx} ${height / 2} ${x} ${height} L ${width} ${height} Z`);
                     }
                 })
                 .to(progress, {
                     controlX: width, // 完全に収束
                     duration: 0.3,
                     ease: "power2.out",
                     onUpdate: () => {
                         const x = progress.x;
                         const cx = progress.controlX;
                         svgPath.setAttribute("d", `M ${width} 0 L ${x} 0 Q ${cx} ${height / 2} ${x} ${height} L ${width} ${height} Z`);
                     }
                 });
            }
        });

        return () => ctx.revert();
    }, [isOpen]);


	return (
		<>
             {/* Liquid Background Layer */}
             <div className="fixed inset-0 z-50 pointer-events-none" style={{ zIndex: 45 }}>
                <svg className="w-full h-full" style={{ display: isOpen ? 'block' : 'none', overflow: 'visible' }}>
                    <path ref={pathRef} fill="#5c5c58" />
                </svg>
             </div>

			{/* Collapsed State: Right Sidebar Strip */}
			<div
                className={`fixed top-0 right-0 h-screen w-[60px] md:w-[80px] bg-white/90 backdrop-blur-sm z-40 flex flex-col items-center justify-center border-l border-gray-200 transition-colors duration-300 pointer-events-auto cursor-pointer hover:bg-gray-100 group`}
                onClick={toggleMenu}
            >
				<button
					className="p-2 rounded-full group-hover:bg-gray-200 transition-colors focus:outline-none"
					type="button"
					aria-label="Open menu"
				>
					<Menu className="w-8 h-8 text-black" strokeWidth={1.5} />
				</button>
				<div className="writing-vertical-rl text-xs tracking-widest text-gray-500 mt-8 font-medium select-none group-hover:text-black transition-colors">
					MENU
				</div>
			</div>

			{/* Expanded Overlay & Menu Content */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={toggleMenu}
							className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] pointer-events-auto"
						/>

						{/* Menu Content Container */}
						<div
							className="fixed top-0 right-0 h-screen w-full max-w-[450px] z-50 flex flex-col p-8 md:p-12 pointer-events-auto"
						>
							<div className="flex justify-end mb-12">
								<button
									onClick={handleClose}
									className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
									type="button"
									aria-label="Close menu"
								>
                                    <motion.div
                                        animate={{ rotate: isClosing ? 90 : 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                    >
									    <X className="w-8 h-8" strokeWidth={1.5} />
                                    </motion.div>
								</button>
							</div>

							<nav className="flex flex-col space-y-8">
								{menuItems.map((item, i) => (
									<motion.div
                                        key={item.href}
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{
                                            x: 0,
                                            opacity: 1,
                                            transition: { delay: 0.4 + i * 0.1, type: "spring", stiffness: 100 }
                                        }}
                                        exit={{
                                            x: 50,
                                            opacity: 0,
                                            transition: { delay: 0, duration: 0.2 }
                                        }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className="group"
                                        >
                                            <span className="text-4xl md:text-5xl font-bold text-white tracking-wider group-hover:text-[#fbbf24] transition-colors font-sans">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </motion.div>
								))}
							</nav>

							<motion.div
								className="mt-auto text-white/50 text-sm"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, transition: { delay: 0.8 } }}
								exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
							>
								<p>&copy; TANEBI CREATIVE</p>
							</motion.div>
						</div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
