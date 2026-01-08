"use client";

import { useState, useEffect, type ReactNode } from "react";
import { AudioProvider } from "@/contexts/audio-context";
import LoadingScreen from "@/components/loading/LoadingScreen";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleLoadingComplete = () => {
		setIsLoading(false);
	};

	// SSR時は何も表示しない
	if (!isMounted) {
		return null;
	}

	return (
		<AudioProvider>
			{isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
			{children}
			<Toaster richColors position="top-center" />
		</AudioProvider>
	);
}
