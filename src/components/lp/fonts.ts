import { Anton, Noto_Sans_JP } from "next/font/google";

// LPページ専用フォント。英字ディスプレイはAnton、本文・和文見出しはNoto Sans JP。
// サイト全体のフォントには影響しない（LPコンテナにのみ適用する）。
export const anton = Anton({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
});

export const notoSansJp = Noto_Sans_JP({
	weight: ["400", "500", "700", "900"],
	subsets: ["latin"],
	display: "swap",
});
