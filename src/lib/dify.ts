import type { ChatEvent } from '@/components/chat/types';

export { formatChatEvent } from '@/components/chat/types';

type DifyEvent =
  | { event: 'message'; answer: string; conversation_id: string; message_id: string }
  | { event: 'message_end'; conversation_id: string; message_id: string }
  | { event: 'error'; code: string; message: string; status: number }
  | { event: 'ping' };

export async function* streamDifyChat(params: {
  message: string;
  conversationId: string | null;
  userId: string;
  signal: AbortSignal;
}): AsyncGenerator<ChatEvent> {
  const baseUrl = process.env.DIFY_API_BASE_URL ?? 'https://api.dify.ai/v1';
  const apiKey = process.env.DIFY_API_KEY;

  if (!apiKey) {
    yield { type: 'error', message: 'Service unavailable' };
    return;
  }

  const body = {
    query: params.message,
    response_mode: 'streaming',
    conversation_id: params.conversationId ?? '',
    user: params.userId,
    inputs: {},
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: params.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    yield { type: 'error', message: 'Failed to connect to AI service' };
    return;
  }

  if (!res.ok) {
    yield { type: 'error', message: `AI service error: ${res.status}` };
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    yield { type: 'error', message: 'No response body' };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let metaSent = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;

        let parsed: DifyEvent;
        try {
          parsed = JSON.parse(raw) as DifyEvent;
        } catch {
          continue;
        }

        if (parsed.event === 'message') {
          if (!metaSent) {
            yield { type: 'meta', conversationId: parsed.conversation_id };
            metaSent = true;
          }
          if (parsed.answer) yield { type: 'delta', text: parsed.answer };
        } else if (parsed.event === 'message_end') {
          yield { type: 'done' };
        } else if (parsed.event === 'error') {
          yield { type: 'error', message: parsed.message };
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      yield { type: 'error', message: 'Stream interrupted' };
    }
  } finally {
    reader.releaseLock();
  }
}
