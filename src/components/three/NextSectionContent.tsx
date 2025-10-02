"use client";

import { ReactNode } from "react";

// 次のセクションの具体的なコンテンツを定義
// 必要に応じてここに複雑なレイアウトやコンポーネントを追加

interface NextSectionContentProps {
	children?: ReactNode;
	title?: string;
	subtitle?: string;
	navigationItems?: string[];
}

export function DefaultNextSectionContent({
	title = "Next Phase",
	subtitle = "Portfolio & Technology Stack",
	navigationItems = ["About", "Projects", "Skills", "Contact"],
}: NextSectionContentProps) {
	return {
		title,
		subtitle,
		navigationItems,
		// 将来的にはここにより複雑なコンテンツ定義を追加
		customElements: [] as ReactNode[],
	};
}

// カスタムコンテンツの型定義
export interface NextSectionContentData {
	title: string;
	subtitle: string;
	navigationItems: string[];
	customElements?: ReactNode[];
}

// このファイルはユーティリティ関数を提供するため、デフォルトエクスポートは使用しない
