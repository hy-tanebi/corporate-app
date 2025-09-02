import { Badge } from "@/components/ui/badge";

// カテゴリーごとの色設定（ダークモードでもライトモードと同じ色）
const categoryColors: Record<string, string> = {
	技術: "bg-blue-100 text-blue-800 dark:bg-blue-100 dark:text-blue-800",
	日常: "bg-green-100 text-green-800 dark:bg-green-100 dark:text-green-800",
	音楽: "bg-red-100 text-red-800 dark:bg-red-100 dark:text-red-800",
};

// デフォルトカラー
const defaultColor =
	"bg-gray-100 text-gray-800 dark:bg-gray-100 dark:text-gray-800";

interface CategoryBadgeProps {
	category: string;
	size?: "sm" | "default";
}

export function CategoryBadge({
	category,
	size = "default",
}: CategoryBadgeProps) {
	const colorClass = categoryColors[category] || defaultColor;

	return (
		<Badge
			variant="secondary"
			className={`${colorClass} ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}
		>
			{category}
		</Badge>
	);
}
