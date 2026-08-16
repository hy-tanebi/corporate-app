/**
 * ハッシュ付きでトップページへ遷移するときに立てるフラグ。
 *
 * トップは1000vhのスクロール演出ページで、セクションの表示はスクロール量に紐づく。
 * 他ページから `/#contact` 等で来た場合は到達までにスナップ処理が入るため、
 * その中間状態を黒カバーで隠す必要がある。HomeClient が初回レンダリングの時点で
 * カバーを出せるよう、遷移元のクリック時に sessionStorage へ立てておく。
 *
 * sessionStorage を経由するのは SSR/直接アクセス時の hydration とずらすため。
 * 直接アクセスはクリックを経ないのでフラグが無く、LoadingScreen が代わりに覆う。
 *
 * リンクを増やすときは HashJumpLink を使うこと。生の next/link で `/#...` を張ると
 * カバーが出ず、スナップの中間状態がそのまま見えてしまう。
 */
export const HASH_JUMP_FLAG = "tanebi:hash-jump";

/** ハッシュ付きトップ遷移の直前に呼ぶ。フラグは HomeClient 側で1回使い切る */
export function markHashJump() {
	if (typeof window === "undefined") return;
	sessionStorage.setItem(HASH_JUMP_FLAG, "1");
}
