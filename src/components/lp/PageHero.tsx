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

			<div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-10 lg:gap-16 items-center">
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
							<span
								className={`${anton.className} select-none text-[26vw] lg:text-[11rem] leading-none uppercase text-foreground/[0.06]`}
							>
								{english}
							</span>
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
					<p className="mt-6 text-base lg:text-lg leading-loose text-muted-foreground max-w-xl whitespace-pre-line">
						{lead}
					</p>

					{pills && pills.length > 0 && (
						<div className="mt-8 flex flex-wrap gap-3">
							{pills.map((pill) => (
								<Link
									key={pill.href}
									href={pill.href}
									className="group inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2.5 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
								>
									{pill.label}
									<span
										aria-hidden
										className="transition-transform group-hover:translate-x-0.5"
									>
										→
									</span>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
