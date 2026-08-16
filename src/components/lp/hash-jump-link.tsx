"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { markHashJump } from "@/lib/hash-jump";

type HashJumpLinkProps = ComponentProps<typeof Link>;

/**
 * `/#contact` のようにトップページのセクションへ飛ぶリンク。
 *
 * クリック時に markHashJump() を呼び、遷移先の HomeClient がスナップ完了まで
 * 黒カバーを出せるようにする。見た目・挙動は next/link と同じ。
 */
export function HashJumpLink({ onClick, href, ...props }: HashJumpLinkProps) {
	return (
		<Link
			href={href}
			onClick={(event) => {
				markHashJump();
				onClick?.(event);
			}}
			{...props}
		/>
	);
}
