import Link from "next/link";

const links = [
	{ href: "/", label: "TOP" },
	{ href: "/service", label: "できること" },
	{ href: "/service/issues", label: "課題から探す" },
	{ href: "/blog", label: "ブログ一覧" },
	{ href: "/#contact", label: "お問い合わせ" },
];

/**
 * ブログ配下のフッター。
 *
 * /blog にはグローバルメニューが無く、一覧からサイトの他のページへ戻る導線が
 * 一切なかった（クローラから見ても行き止まり）。ハンバーガーメニューは
 * デスクトップで右端 80px の帯になり ThemeToggle と重なるため、
 * ブログ側は通常のフッターで揃える。
 */
export function BlogFooter() {
	return (
		<footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
			<div className="container mx-auto px-4 py-10 max-w-5xl">
				<nav aria-label="フッター">
					<ul className="flex flex-wrap gap-x-6 gap-y-3">
						{links.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<p className="mt-8 text-xs text-gray-500 dark:text-gray-500">
					TANEBI CREATIVE ／ 岩手県奥州市
				</p>
			</div>
		</footer>
	);
}
