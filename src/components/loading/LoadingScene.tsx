"use client";

// フォールバック用のシンプルな表示（非表示）は不要になったので削除

// ローディング中はシンプルな背景のみ表示（宇宙飛行士はHeroセクションで表示）
export default function LoadingScene() {
	return (
		<>
			{/* 環境光 - シンプルな背景 */}
			<ambientLight intensity={1} />
			{/* 黒背景のみ - 宇宙飛行士はHeroセクションで表示することでパフォーマンス改善 */}
			<color attach="background" args={["black"]} />
		</>
	);
}

