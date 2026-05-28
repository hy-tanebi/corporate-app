import { formatChatEvent, streamDifyChat } from '@/lib/dify';
import { checkIpRateLimit, checkSessionRateLimit, getClientIp } from '@/lib/rate-limit';
import { buildSessionCookieHeader, getOrCreateSessionId } from '@/lib/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 500;

export async function POST(request: Request) {
  if (process.env.CHAT_DISABLED === 'true') {
    return new Response(JSON.stringify({ error: 'Chat is temporarily unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { sessionId, isNew } = getOrCreateSessionId(request);

  const ip = getClientIp(request);
  if (!checkIpRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!checkSessionRateLimit(sessionId)) {
    return new Response(JSON.stringify({ error: 'Daily message limit reached.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { message?: string; conversationId?: string | null };
  try {
    body = (await request.json()) as { message?: string; conversationId?: string | null };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const message = (body.message ?? '').trim();
  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const conversationId = body.conversationId ?? null;

  const controller = new AbortController();
  request.signal.addEventListener('abort', () => controller.abort());

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(streamController) {
      try {
        for await (const event of streamDifyChat({
          message,
          conversationId,
          userId: sessionId,
          signal: controller.signal,
        })) {
          streamController.enqueue(encoder.encode(formatChatEvent(event)));
          if (event.type === 'done' || event.type === 'error') break;
        }
      } finally {
        streamController.close();
      }
    },
    cancel() {
      controller.abort();
    },
  });

  const headers: Record<string, string> = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };
  if (isNew) {
    headers['Set-Cookie'] = buildSessionCookieHeader(sessionId);
  }

  return new Response(stream, { headers });
}
