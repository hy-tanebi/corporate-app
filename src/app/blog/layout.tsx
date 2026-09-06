import { BlogFooter } from "@/components/blog/blog-footer";
import { MousePointer } from "@/components/three/mouse-pointer";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<div className="fixed top-4 right-4 z-50 hidden lg:block">
				<ThemeToggle />
			</div>
			{children}
			<BlogFooter />
			<MousePointer />
		</div>
	);
}
