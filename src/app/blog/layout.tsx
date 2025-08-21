import { MousePointer } from "@/components/three/mouse-pointer";

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{children}
			<MousePointer />
		</>
	);
}