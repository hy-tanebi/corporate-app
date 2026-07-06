import Link from "next/link";

interface PageHeroProps {
	label: string;
	title: string;
	lead: string;
}

export function PageHero({ label, title, lead }: PageHeroProps) {
	return (
		<header className="pt-8 pb-16 lg:pt-12 lg:pb-24">
			<nav className="mb-12 lg:mb-16">
				<Link
					href="/"
					className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					← TANEBI CREATIVE
				</Link>
			</nav>
			<p className="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4">
				{label}
			</p>
			<h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight mb-8">
				{title}
			</h1>
			<p className="text-base lg:text-lg leading-relaxed text-muted-foreground max-w-2xl whitespace-pre-line">
				{lead}
			</p>
		</header>
	);
}
