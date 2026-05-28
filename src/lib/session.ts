const SESSION_COOKIE = 'tanebi_chat_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30日（秒）

export function getOrCreateSessionId(request: Request): {
  sessionId: string;
  isNew: boolean;
} {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(
    /tanebi_chat_session=([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i,
  );
  if (match?.[1]) return { sessionId: match[1], isNew: false };
  return { sessionId: crypto.randomUUID(), isNew: true };
}

export function buildSessionCookieHeader(sessionId: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE}=${sessionId}`,
    'Path=/',
    `Max-Age=${MAX_AGE}`,
    'HttpOnly',
    'SameSite=Lax',
    ...(isProduction ? ['Secure'] : []),
  ];
  return parts.join('; ');
}
