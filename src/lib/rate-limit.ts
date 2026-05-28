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

/** x-forwarded-for または x-real-ip から IP を取得 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}
