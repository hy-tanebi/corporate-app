import Image from "next/image";
import Link from "next/link";
import { anton } from "./fonts";

interface HeroPill {
	label: string;
	href: string;
}

interface HeroVisual {
	src: string;
	alt: string;
}

interface PageHeroProps {
	label: string;
	english: string;
	title: string;
	lead: string;
	pills?: HeroPill[];
	visual?: HeroVisual;
}

export function PageHero({
	label,
	english,
	title,
	lead,
	pills,
	visual,
}: PageHeroProps) {
	return (
		<header className="pt-8 pb-16 lg:pt-12 lg:pb-24">
			<nav className="mb-12 lg:mb-16">
				<Link
					href="/"
					className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
				>
					← TANEBI CREATIVE
				</Link>
			</nav>

			{/* min-h はリード文が最長のページ(/service/issues)基準。全ページで第一画面の高さを揃える */}
			<div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-10 lg:gap-16 items-center lg:min-h-[540px]">
				{/* ビジュアル枠（画像支給までは種火プレースホルダー） */}
				<div className="order-2 lg:order-1">
					{visual ? (
						<Image
							src={visual.src}
							alt={visual.alt}
							width={880}
							height={660}
							className="w-full h-auto rounded-3xl"
							priority
						/>
					) : (
						<div
							aria-hidden
							className="relative aspect-[4/3] rounded-3xl bg-secondary overflow-hidden flex items-center justify-center"
						>
							{/* 単語の文字数に関係なく同じ幅にフィットさせるためSVGで描画 */}
							<svg
								viewBox="0 0 100 30"
								className="w-[88%] select-none text-foreground/[0.06]"
								role="presentation"
							>
								<text
									x="50"
									y="15"
									textAnchor="middle"
									dominantBaseline="central"
									textLength="100"
									lengthAdjust="spacingAndGlyphs"
									className={anton.className}
									fontSize="26"
									fill="currentColor"
									style={{ textTransform: "uppercase" }}
								>
									{english}
								</text>
							</svg>
							<span className="absolute bottom-8 right-8 h-4 w-4 rounded-full bg-[#e8590c]" />
						</div>
					)}
				</div>

				<div className="order-1 lg:order-2">
					<p
						className={`${anton.className} text-sm tracking-[0.3em] uppercase text-[#e8590c] mb-4`}
					>
						{label}
					</p>
					<h1 className="mb-3">
						<span
							className={`${anton.className} block text-6xl lg:text-8xl leading-[0.95] uppercase tracking-[0.04em]`}
						>
							{english}
						</span>
						<span className="mt-4 block text-xl lg:text-2xl font-black tracking-wide">
							{title}
						</span>
					</h1>
					<p className="mt-6 text-base lg:text-lg leading-loose text-foreground max-w-xl whitespace-pre-line">
						{lead}
					</p>

					{pills && pills.length > 0 && (
						<div className="mt-8 flex flex-wrap gap-3">
							{pills.map((pill) => {
								const isAnchor = pill.href.startsWith("#");
								return (
									<Link
										key={pill.href}
										href={pill.href}
										className="group inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2.5 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
									>
										{pill.label}
										<span
											aria-hidden
											className={
												isAnchor
													? "transition-transform group-hover:translate-y-0.5"
													: "transition-transform group-hover:translate-x-0.5"
											}
										>
											{isAnchor ? "↓" : "→"}
										</span>
									</Link>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
