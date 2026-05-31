import type { Metadata } from "next";
import { DEFAULT_METADATA } from "@/lib/seo";
import { ThemeProvider } from "@/contexts/theme-context";
import Providers from "@/components/Providers";
import { GTMScript } from "@/components/GTMScript";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<body className="antialiased" suppressHydrationWarning>
				<GTMScript />
				<Providers>
					<ThemeProvider>{children}</ThemeProvider>
					<ChatWidget />
				</Providers>
			</body>
		</html>
	);
}
