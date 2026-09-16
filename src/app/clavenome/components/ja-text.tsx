import { loadDefaultJapaneseParser } from "budoux";

// 日本語の本文を文節で区切り、間にゼロ幅スペース（U+200B）を挟む。
// 親要素に `word-break: keep-all` を当てると、行の折り返しが文節の切れ目だけで起きる
// （「氏｜名」「しま｜す」のような単語の途中での改行を防ぐ）。
// RSC でビルド時に処理されるので、budoux はクライアントには配信されない。
const parser = loadDefaultJapaneseParser();

export function JaText({ children }: { children: string }) {
	return <>{parser.parse(children).join("​")}</>;
}
