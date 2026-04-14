import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// カテゴリーごとの色設定（microCMSで実際に使用している3つのみ）
const categoryColors: Record<string, string> = {
	技術: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	日常: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
	音楽: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// デフォルトカラー
const defaultColor =
	"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

interface CategoryBadgeProps {
	category: string;
	size?: "sm" | "default";
	linkable?: boolean;
}

export function CategoryBadge({
	category,
	size = "default",
	linkable = true,
}: CategoryBadgeProps) {
	const colorClass = categoryColors[category] || defaultColor;

	const badge = (
		<Badge
			variant="secondary"
			className={`${colorClass} ${size === "sm" ? "text-xs px-2 py-0.5" : ""} ${linkable ? "hover:opacity-80 transition-opacity cursor-pointer" : ""}`}
		>
			{category}
		</Badge>
	);

	if (linkable) {
		return (
			<Link href={`/blog?category=${encodeURIComponent(category)}`}>
				{badge}
			</Link>
		);
	}

	return badge;
}
