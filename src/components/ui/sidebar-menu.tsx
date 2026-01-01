"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Home, Rocket, User, MessageCircle } from "lucide-react";
import gsap from "gsap";

interface SidebarMenuProps {
    onNavigate?: (path: string) => void;
}

export function SidebarMenu({ onNavigate }: SidebarMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // For X button animation
	const pathRef = useRef<SVGPathElement>(null);

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
		{ href: "/", label: "TOP", icon: Home, description: "トップページ" },
		{ href: "/mission", label: "MISSION", icon: Rocket, description: "目指すもの" },
		{ href: "/about", label: "ABOUT", icon: User, description: "TANEBI CREATIVEについて" },
		{ href: "/contact", label: "CONTACT", icon: MessageCircle, description: "お気軽にお問い合わせください" },
	];

    // GSAP Context Effect for Liquid Animation
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
                    <path ref={pathRef} fill="#1f1f1f" />
                </svg>
             </div>

			{/* Collapsed State: Responsive (Floating Button on Mobile, Sidebar Strip on Desktop) */}
			<div
                className={`fixed z-40 bg-white/90 backdrop-blur-sm transition-colors duration-300 pointer-events-auto cursor-pointer hover:bg-gray-100 group flex flex-col items-center justify-center
                    /* Mobile Styles: Floating Button top-right */
                    top-8 right-2 w-[50px] h-[50px] rounded-full shadow-lg border border-gray-100
                    /* Desktop Styles: Sidebar Strip */
                    md:top-0 md:right-0 md:h-screen md:w-[80px] md:rounded-none md:shadow-none md:border-l md:border-t-0 md:border-gray-200
                `}
                onClick={toggleMenu}
            >
				<button
					className="p-2 rounded-full group-hover:bg-gray-200 transition-colors focus:outline-none"
					type="button"
					aria-label="Open menu"
				>
					<Menu className="w-8 h-8 text-black" strokeWidth={1.5} />
				</button>
				<div className="hidden md:block writing-vertical-rl text-xs tracking-widest text-gray-500 mt-8 font-medium select-none group-hover:text-black transition-colors">
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
							className="fixed top-0 right-0 w-full max-w-[450px] z-50 flex flex-col p-8 md:p-12 pointer-events-auto"
                            style={{ height: '100dvh' }} // モバイルアドレスバー対応
						>
							{/* Close Button Area */}
							<div className="absolute top-8 right-2 w-[50px] h-[50px] flex items-center justify-center z-50 md:static md:w-full md:h-auto md:block md:text-right md:mb-12">
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

							<nav className="flex flex-col space-y-4 md:space-y-6 flex-1 justify-center items-center md:items-start md:justify-start md:flex-initial w-full">
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
                                        className="w-full"
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={(e) => {
                                                if (onNavigate) {
                                                    if (item.href === '/' || item.href === '/about' || item.href === '/mission' || item.href === '/contact') {
                                                        e.preventDefault();
                                                        onNavigate(item.href);
                                                    }
                                                }
                                                setIsOpen(false);
                                            }}
                                            className="group relative block w-full md:w-[400px]"
                                        >
                                            {/* Desktop Hover Card: White Background, Icon Pops Up */}
                                            <div className="
                                                hidden md:flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300
                                                text-white
                                                md:hover:text-[#60d5fa]
                                            ">
                                                {/* Icon: Pops up ("Nyutto") on hover */}
                                                <div className="h-0 overflow-hidden md:group-hover:h-auto md:group-hover:mb-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-0 md:group-hover:opacity-100 flex justify-center origin-bottom">
                                                    <item.icon className="w-10 h-10" strokeWidth={1.5} />
                                                </div>

                                                {/* Label */}
                                                <span className="text-4xl md:text-5xl font-bold tracking-wider font-sans md:group-hover:mb-2 transition-all duration-300">
                                                    {item.label}
                                                </span>

                                                {/* Description: Hidden by default, appears on hover */}
                                                <div className="h-0 overflow-hidden md:group-hover:h-auto transition-all duration-300 opacity-0 md:group-hover:opacity-100">
                                                    <span className="text-sm font-bold tracking-wide">
                                                        {item.description}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mobile Styles (Visible on Mobile) */}
                                            <div className="md:hidden text-center">
                                                 <span className="text-4xl font-bold text-white tracking-wider font-sans">
                                                    {item.label}
                                                </span>
                                            </div>
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
