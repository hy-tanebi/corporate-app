// 目次で表示する見出しの型
export interface HeadingItem {
	id: string;
	text: string;
	level: number;
}

// HTMLから見出しを抽出してアンカー付きHTMLを生成
export function extractHeadingsAndAddAnchors(html: string): {
	headings: HeadingItem[];
	modifiedHtml: string;
} {
	const headings: HeadingItem[] = [];

	// 見出しタグを検索して抽出・ID付与（h1-h3のみ対象）
	const modifiedHtml = html.replace(
		/<(h[1-3])([^>]*)>(.*?)<\/h[1-3]>/gi,
		(_match, tag, attributes, content) => {
			const level = parseInt(tag.replace("h", ""));
			const text = content.replace(/<[^>]*>/g, ""); // HTMLタグを除去してテキストのみ抽出

			// IDを生成（連番ベースで確実に動作するように）
			const baseId = `heading-${headings.length + 1}`;
			const id = baseId;

			// 重複回避は不要（連番ベースなので）
			const uniqueId = id;

			headings.push({
				id: uniqueId,
				text: text,
				level: level,
			});

			console.log(`Generated heading: ${text} -> ${uniqueId}`); // デバッグログ

			// 既存のid属性をチェック
			const hasId = attributes.includes("id=");
			const newAttributes = hasId
				? attributes
				: `${attributes} id="${uniqueId}"`;

			return `<${tag}${newAttributes}>${content}</${tag}>`;
		},
	);

	return {
		headings,
		modifiedHtml,
	};
}

// スムーススクロール用のヘルパー関数
export function scrollToHeading(id: string) {
	console.log("Attempting to scroll to:", id); // デバッグログ

	// DOMが更新されるまで少し待つ
	setTimeout(() => {
		const element = document.getElementById(id);
		console.log("Found element:", element); // デバッグログ

		if (element) {
			const headerOffset = 80; // 固定ヘッダーなどがある場合のオフセット
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition =
				elementPosition + window.pageYOffset - headerOffset;

			console.log("Scrolling to position:", offsetPosition); // デバッグログ

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		} else {
			console.log("Element not found for id:", id); // デバッグログ
			// 全てのh1-h3要素をログ出力してデバッグ
			const allHeadings = document.querySelectorAll("h1[id], h2[id], h3[id]");
			console.log(
				"All headings with IDs:",
				Array.from(allHeadings).map((h) => ({ id: h.id, text: h.textContent })),
			);

			// プロースエリア内の見出しも確認
			const proseHeadings = document.querySelectorAll(
				".prose h1, .prose h2, .prose h3",
			);
			console.log(
				"Prose headings:",
				Array.from(proseHeadings).map((h) => ({
					tagName: h.tagName,
					id: h.id,
					text: h.textContent?.substring(0, 50),
				})),
			);
		}
	}, 500); // 500ms待つ（ハイドレーション完了まで待機）
}
