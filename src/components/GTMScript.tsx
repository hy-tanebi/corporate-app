"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * 計測タグを一切載せないページ。
 * /clavenome は「通信ゼロ・収集ゼロ」を掲げるアプリのサポート・プライバシーポリシーページなので、
 * そのページ自体にも解析タグを置かない。
 * ルートレイアウトは全ページ共通のため、ここでパスを見て出し分ける。
 */
const TRACKING_FREE_PATHS = ["/clavenome"];

export function GTMScript() {
	const pathname = usePathname();
	if (!GTM_ID) return null;
	if (TRACKING_FREE_PATHS.includes(pathname)) return null;
	return <GoogleTagManager gtmId={GTM_ID} />;
}
