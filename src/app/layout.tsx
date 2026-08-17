import type { Metadata } from "next";
import { DEFAULT_METADATA } from "@/lib/seo";
import { ThemeProvider } from "@/contexts/theme-context";
import Providers from "@/components/Providers";
import { GTMScript } from "@/components/GTMScript";
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
					{/* ChatWidget（Dify iframe版・右下のUFOボタン）は検証中のため本番では出さない。
					    src/components/ChatWidget.tsx は残置してあるので、公開するときは
					    import と <ChatWidget /> を戻し、Vercel に NEXT_PUBLIC_DIFY_CHATBOT_URL を設定する。
					    UFOボタンとの重なりを避けるための余白指定が sidebar-menu.tsx と
					    service/components/scroll-to-top-button.tsx に残っているが、
					    再開時にそのまま効くよう据え置いている。 */}
				</Providers>
			</body>
		</html>
	);
}
