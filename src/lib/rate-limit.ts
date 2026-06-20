type RateEntry = { count: number; resetAt: number };

// サーバーメモリに保持（Vercel インスタンス間では共有されないがコーポレート規模では許容）
const store = new Map<string, RateEntry>();

function check(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/** IP 単位: 10 req/min */
export function checkIpRateLimit(ip: string): boolean {
  return check(`ip:${ip}`, 10, 60_000);
}

/** セッション単位: 30 msg/day */
export function checkSessionRateLimit(sessionId: string): boolean {
  return check(`session:${sessionId}`, 30, 24 * 60 * 60_000);
}

/**
 * クライアント IP を取得する。
 *
 * Vercel のエッジは信頼できるクライアント IP を `x-real-ip` に設定する
 * （クライアントが偽装した同名ヘッダは上書きされる）。一方 `x-forwarded-for` は
 * クライアントが先頭に偽の IP を差し込めるため、先頭要素をそのまま信頼すると
 * IP 単位の rate limit を回避されてしまう。Vercel が付与する実 IP は末尾側に来る。
 * そこで `x-real-ip` を優先し、無い場合のみ `x-forwarded-for` の末尾要素に
 * フォールバックする（Vercel 公式ヘルパー `ipAddress` と同じ優先順）。
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const last = forwarded
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .at(-1);
    if (last) return last;
  }

  return 'unknown';
}
