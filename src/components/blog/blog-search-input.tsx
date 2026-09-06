"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildBlogHref } from "./blog-list-utils";

interface BlogSearchInputProps {
	/** サーバー側で解決済みの現在の検索語 */
	query: string;
	/** サーバー側で解決済みの現在のカテゴリ */
	category: string;
}

/**
 * 記事検索の入力欄だけを担うクライアントアイランド。
 *
 * 絞り込み自体はサーバー側（app/blog/page.tsx）が searchParams を見て行う。
 * ここで useSearchParams を使うと、静的プリレンダリング時に一覧全体が
 * Suspense の fallback に置き換わり、記事リンクが初期HTMLから消えるため。
 */
export function BlogSearchInput({ query, category }: BlogSearchInputProps) {
	const router = useRouter();
	const [value, setValue] = useState(query);

	// 戻る/進むや、カテゴリ切り替えでURLが変わったときに入力欄を追従させる
	useEffect(() => {
		setValue(query);
	}, [query]);

	// 1文字ごとにサーバーへ問い合わせないよう待ってから遷移する
	useEffect(() => {
		if (value === query) return;
		const timer = setTimeout(() => {
			router.replace(buildBlogHref(value, category), { scroll: false });
		}, 300);
		return () => clearTimeout(timer);
	}, [value, query, category, router]);

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
			<Input
				type="text"
				placeholder="記事を検索..."
				value={value}
				onChange={(e) => setValue(e.target.value)}
				className="pl-9 pr-8 text-sm h-9"
			/>
			{value && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setValue("")}
					className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
				>
					<X className="h-3 w-3 text-gray-500" />
				</Button>
			)}
		</div>
	);
}
