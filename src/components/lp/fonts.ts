import { Anton, Noto_Sans_JP } from "next/font/google";

// LPページ専用フォント。英字ディスプレイはAnton、本文・和文見出しはNoto Sans JP。
// サイト全体のフォントには影響しない（LPコンテナにのみ適用する）。
export const anton = Anton({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
});

// Noto Sans JP は可変フォント。weight を列挙すると unicode-range ごとの @font-face が
// weight の数だけ複製され、同じ .woff2 を指す定義が4倍出力される（実測 497個 / 参照先は124個）。
// weight を省略すると font-weight: 100 900 の可変定義になり、全ウェイトを維持したまま CSS が 1/4 になる。
// Anton は可変フォントではないため weight: "400" を維持すること。
export const notoSansJp = Noto_Sans_JP({
	subsets: ["latin"],
	display: "swap",
});
