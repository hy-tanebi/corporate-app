import Link from "next/link";

export function CtaBlock() {
	return (
		<section className="my-16 lg:my-24 rounded-2xl bg-secondary px-6 py-12 lg:px-12 lg:py-16 text-center">
			<h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4">
				まずは話を聞いてみる
			</h2>
			<p className="text-muted-foreground mb-8">
				「何を頼めばいいかまだ分からない」という状態での相談で大丈夫です。
				<br className="hidden lg:inline" />
				初回の相談は無料です。
			</p>
			<Link
				href="/#contact"
				className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:opacity-90 transition-opacity"
			>
				無料で相談する →
			</Link>
		</section>
	);
}
