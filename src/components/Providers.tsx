"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/loading/LoadingScreen";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isTopPage = pathname === "/";
	const [isLoading, setIsLoading] = useState(true);

	const handleLoadingComplete = () => {
		setIsLoading(false);
	};

	return (
		<>
			{isTopPage && isLoading && (
				<LoadingScreen onLoadingComplete={handleLoadingComplete} />
			)}
			{children}
			<Toaster richColors position="top-center" />
		</>
	);
}
