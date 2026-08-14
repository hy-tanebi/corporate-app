"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/loading/LoadingScreen";

export default function Providers({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isTopPage = pathname === "/";
	// 初回ロードがトップページの場合のみローディング画面を出す。
	// 下層ページからのクライアント遷移で後からマウントされると、
	// 黒いオーバーレイ + body overflow:hidden で「トップに戻れない」状態になるため。
	const [isInitialLandingTop] = useState(isTopPage);
	const [isLoading, setIsLoading] = useState(true);

	const handleLoadingComplete = () => {
		setIsLoading(false);
	};

	return (
		<>
			{isInitialLandingTop && isTopPage && isLoading && (
				<LoadingScreen onLoadingComplete={handleLoadingComplete} />
			)}
			{children}
		</>
	);
}
