// src/app/page.tsx
import HeroCanvasWithCMS from "@/components/three/HeroCanvasWithCMS";
import HomeClient from "./components/HomeClient";

export default function Home() {
	return (
		<HeroCanvasWithCMS>
			{/* クライアント側のUIロジックをHomeClientに委譲 */}
			<HomeClient />
		</HeroCanvasWithCMS>
	);
}
