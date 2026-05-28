# Dify チャットボット カスタムUI 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dify iframe を廃止し、SSEストリーミング・UFOアニメーション付きの Next.js カスタムチャットUIに置き換える。

**Architecture:** Next.js Route Handler が Dify API のプロキシを担い、DIFY_API_KEY はサーバー専用。クライアントは `/api/chat` に POST して SSE を受信する。ChatWidget は dynamic import で遅延読み込みし、UFO→ビーム→パネルのフェーズ遷移を CSS で制御する。

**Tech Stack:** Next.js 15 App Router / TypeScript / Tailwind CSS / Biome / dotenvx / CSS Transitions

---

## 前提確認

- ブランチ: `feature/dify-chatbot-widget`
- パッケージマネージャー: `pnpm`
- lint: `pnpm lint` (Biome) / format: `pnpm format`
- ビルド確認: `pnpm build`
- テストフレームワークなし → TypeScript 型チェック + `pnpm build` + 手動 curl/ブラウザテストで検証

## ファイル構成

| 種別 | パス | 役割 |
|------|------|------|
| 新規 | `src/components/chat/types.ts` | 共有型 (Message, ChatEvent) |
| 新規 | `src/lib/dify.ts` | Dify API クライアント（サーバー専用） |
| 新規 | `src/lib/session.ts` | 匿名セッション ID 管理 |
| 新規 | `src/lib/rate-limit.ts` | IP ベース簡易レート制限 |
| 新規 | `src/app/api/chat/route.ts` | SSE プロキシ Route Handler |
| 新規 | `src/app/api/chat/parameters/route.ts` | Opening Statement 取得（キャッシュ付き） |
| 新規 | `src/components/chat/ChatWidget.tsx` | エントリ・状態管理・アニメーション制御 |
| 新規 | `src/components/chat/Spaceship.tsx` | UFO ボタン（CSS/SVG） |
| 新規 | `src/components/chat/TractorBeam.tsx` | トラクタービーム演出 |
| 新規 | `src/components/chat/ChatPanel.tsx` | チャットパネル本体 |
| 新規 | `src/components/chat/MessageList.tsx` | メッセージ表示 |
| 新規 | `src/components/chat/ChatInput.tsx` | 入力欄 |
| 変更 | `src/app/layout.tsx` | dynamic import で新 ChatWidget に差し替え |
| 削除 | `src/components/ChatWidget.tsx` | iframe 版を削除 |

---

## Task 1: 共有型定義

**Files:**
- Create: `src/components/chat/types.ts`

- [ ] **Step 1: `src/components/chat/types.ts` を作成**

```typescript
// クライアント・サーバー両方で使う型

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

// サーバーからクライアントへ送る正規化 SSE イベント
export type ChatEvent =
  | { type: 'meta'; conversationId: string }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export function formatChatEvent(event: ChatEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
```

- [ ] **Step 2: 型チェック確認**

```bash
cd /Users/sugawarahayato/事業案/TANEBI_CREATIVE/corporate-app
pnpm build 2>&1 | tail -20
```

Expected: 型エラーなし（既存エラーがあれば記録しておく）

- [ ] **Step 3: コミット**

```bash
git add src/components/chat/types.ts
git commit -m "feat: チャットボット共有型定義を追加"
```

---

## Task 2: Dify API クライアント

**Files:**
- Create: `src/lib/dify.ts`

- [ ] **Step 1: `src/lib/dify.ts` を作成**

```typescript
import type { ChatEvent } from '@/components/chat/types';

export { formatChatEvent } from '@/components/chat/types';

// Dify SSE イベントの生の型（サーバー内部のみ）
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
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/lib/dify.ts
git commit -m "feat: Dify API SSEクライアントを追加"
```

---

## Task 3: セッション管理

**Files:**
- Create: `src/lib/session.ts`

- [ ] **Step 1: `src/lib/session.ts` を作成**

ストリーミング Response に Set-Cookie を含めるため、`next/headers` の `cookies()` ではなくリクエストヘッダーから直接読む。

```typescript
const SESSION_COOKIE = 'tanebi_chat_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30日（秒）

/** リクエストから既存セッション ID を取得、なければ新規発行 */
export function getOrCreateSessionId(request: Request): {
  sessionId: string;
  isNew: boolean;
} {
  const cookieHeader = request.headers.get('cookie') ?? '';
  // UUID v4 形式 (例: 550e8400-e29b-41d4-a716-446655440000)
  const match = cookieHeader.match(
    /tanebi_chat_session=([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i,
  );
  if (match?.[1]) return { sessionId: match[1], isNew: false };
  return { sessionId: crypto.randomUUID(), isNew: true };
}

/** Response の Set-Cookie ヘッダー用文字列を構築 */
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
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/lib/session.ts
git commit -m "feat: 匿名セッションID管理を追加"
```

---

## Task 4: レート制限

**Files:**
- Create: `src/lib/rate-limit.ts`

- [ ] **Step 1: `src/lib/rate-limit.ts` を作成**

```typescript
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
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/lib/rate-limit.ts
git commit -m "feat: IPベース簡易レート制限を追加"
```

---

## Task 5: `/api/chat/parameters` Route Handler

**Files:**
- Create: `src/app/api/chat/parameters/route.ts`

- [ ] **Step 1: `src/app/api/chat/parameters/route.ts` を作成**

```typescript
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// サーバーメモリキャッシュ（5分）
let cachedStatement: string | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cachedStatement !== null && now < cacheExpiresAt) {
    return NextResponse.json(
      { openingStatement: cachedStatement },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  }

  const baseUrl = process.env.DIFY_API_BASE_URL ?? 'https://api.dify.ai/v1';
  const apiKey = process.env.DIFY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ openingStatement: null });
  }

  try {
    const res = await fetch(`${baseUrl}/parameters`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json({ openingStatement: null });
    }

    const data = (await res.json()) as { opening_statement?: string };
    cachedStatement = data.opening_statement ?? null;
    cacheExpiresAt = now + CACHE_TTL;

    return NextResponse.json(
      { openingStatement: cachedStatement },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch {
    return NextResponse.json({ openingStatement: null });
  }
}
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 3: 手動テスト（ローカルサーバー起動済みの場合）**

```bash
# 別ターミナルで pnpm dev を起動した状態で
curl http://localhost:3000/api/chat/parameters
```

Expected: `{"openingStatement":null}` または Dify の opening_statement の値

- [ ] **Step 4: コミット**

```bash
git add src/app/api/chat/parameters/route.ts
git commit -m "feat: /api/chat/parameters Route Handler を追加"
```

---

## Task 6: `/api/chat` Route Handler（SSEプロキシ）

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: `src/app/api/chat/route.ts` を作成**

```typescript
import { streamDifyChat, formatChatEvent } from '@/lib/dify';
import { checkIpRateLimit, checkSessionRateLimit, getClientIp } from '@/lib/rate-limit';
import { buildSessionCookieHeader, getOrCreateSessionId } from '@/lib/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 500;

export async function POST(request: Request) {
  // 緊急停止スイッチ
  if (process.env.CHAT_DISABLED === 'true') {
    return new Response(JSON.stringify({ error: 'Chat is temporarily unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // セッション
  const { sessionId, isNew } = getOrCreateSessionId(request);

  // レート制限
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

  // リクエストボディ
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

  // upstream abort
  const controller = new AbortController();
  request.signal.addEventListener('abort', () => controller.abort());

  // SSE ストリーム
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
  // 新規セッションのみ Set-Cookie
  if (isNew) {
    headers['Set-Cookie'] = buildSessionCookieHeader(sessionId);
  }

  return new Response(stream, { headers });
}
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 3: 手動テスト（環境変数設定済みの場合）**

```bash
# 別ターミナルで pnpm dev を起動した状態で
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"こんにちは","conversationId":null}' \
  --no-buffer
```

Expected: SSE イベントが流れてくる
```
data: {"type":"meta","conversationId":"xxx"}
data: {"type":"delta","text":"こんにちは"}
...
data: {"type":"done"}
```

- [ ] **Step 4: CHAT_DISABLED テスト**

```bash
CHAT_DISABLED=true curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

Expected: HTTP 503

- [ ] **Step 5: レート制限テスト（11回連続送信）**

```bash
for i in {1..11}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
done
```

Expected: 最初の10回は 200、11回目は 429

- [ ] **Step 6: コミット**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: /api/chat SSEプロキシ Route Handler を追加（レート制限・abort対応）"
```

---

## Task 7: ChatInput コンポーネント

**Files:**
- Create: `src/components/chat/ChatInput.tsx`

- [ ] **Step 1: `src/components/chat/ChatInput.tsx` を作成**

```typescript
'use client';

import { useRef } from 'react';

type Props = {
  onSend: (text: string) => void;
  disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const text = inputRef.current?.value.trim() ?? '';
    if (!text || disabled) return;
    onSend(text);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter で送信、Shift+Enter で改行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
      <textarea
        ref={inputRef}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="メッセージを入力..."
        rows={1}
        maxLength={500}
        className="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        aria-label="送信"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

---

## Task 8: MessageList コンポーネント

**Files:**
- Create: `src/components/chat/MessageList.tsx`

- [ ] **Step 1: `src/components/chat/MessageList.tsx` を作成**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import type { Message } from './types';

type Props = {
  messages: Message[];
  isStreaming: boolean;
  openingStatement: string | null;
  error: string | null;
};

export default function MessageList({ messages, isStreaming, openingStatement, error }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {/* Opening Statement（初期メッセージ） */}
      {openingStatement && messages.length === 0 && (
        <div className="max-w-[85%] rounded-b-xl rounded-tr-xl bg-indigo-500 px-4 py-3 text-sm leading-relaxed text-white">
          {openingStatement}
        </div>
      )}

      {/* メッセージ一覧 */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'rounded-br-sm bg-gray-100 text-gray-900'
                : 'rounded-bl-sm bg-indigo-500 text-white'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {/* ストリーミング中のインジケーター */}
      {isStreaming && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-bl-sm rounded-xl bg-indigo-500 px-4 py-3">
            <span className="inline-flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
```

---

## Task 9: ChatPanel コンポーネント

**Files:**
- Create: `src/components/chat/ChatPanel.tsx`

- [ ] **Step 1: `src/components/chat/ChatPanel.tsx` を作成**

```typescript
'use client';

import type { Message } from './types';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

type Props = {
  messages: Message[];
  isStreaming: boolean;
  openingStatement: string | null;
  error: string | null;
  onSendMessage: (text: string) => void;
  onClose: () => void;
  style?: React.CSSProperties;
};

export default function ChatPanel({
  messages,
  isStreaming,
  openingStatement,
  error,
  onSendMessage,
  onClose,
  style,
}: Props) {
  return (
    <div
      className="fixed right-6 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      style={{ bottom: '96px', width: '320px', height: '420px', ...style }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">AI アシスタント</p>
          <p className="text-xs text-indigo-200">● オンライン</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-indigo-200 transition-colors hover:text-white"
          aria-label="チャットを閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* メッセージエリア */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        openingStatement={openingStatement}
        error={error}
      />

      {/* 入力欄 */}
      <ChatInput onSend={onSendMessage} disabled={isStreaming} />
    </div>
  );
}
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 3: コミット（Task 7〜9 まとめて）**

```bash
git add src/components/chat/ChatInput.tsx src/components/chat/MessageList.tsx src/components/chat/ChatPanel.tsx
git commit -m "feat: ChatInput / MessageList / ChatPanel コンポーネントを追加"
```

---

## Task 10: Spaceship コンポーネント（CSS UFO）

**Files:**
- Create: `src/components/chat/Spaceship.tsx`

- [ ] **Step 1: `src/components/chat/Spaceship.tsx` を作成**

`ref` を外から受け取れるよう `forwardRef` で実装しておく（ビーム位置計算に使う）。

```typescript
'use client';

import { forwardRef } from 'react';

type Phase = 'closed' | 'lifting' | 'beaming' | 'open' | 'closing';

type Props = {
  phase: Phase;
  onClick: () => void;
};

const Spaceship = forwardRef<HTMLDivElement, Props>(function Spaceship({ phase, onClick }, ref) {
  const isLifted = phase === 'beaming' || phase === 'open';

  return (
    <div
      ref={ref}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={isLifted ? 'チャットを閉じる' : 'AIアシスタントを開く'}
      className="fixed z-50 cursor-pointer"
      style={{
        right: isLifted ? '50px' : '24px',
        bottom: isLifted ? '360px' : '24px',
        width: isLifted ? '78px' : '64px',
        transition: 'right 1.1s cubic-bezier(0.22, 1, 0.36, 1), bottom 1.1s cubic-bezier(0.22, 1, 0.36, 1), width 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
        animation: 'ufoFloat 3.5s ease-in-out infinite',
      }}
    >
      {/* アンテナ */}
      <div className="flex justify-center gap-4 pb-0.5">
        {['-2px', '2px'].map((offset) => (
          <div
            key={offset}
            className="relative h-2.5 w-0.5 rounded-sm bg-gray-400"
            style={{ transform: `translateX(${offset})` }}
          >
            <div
              className="absolute -left-1 -top-1.5 h-2.5 w-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle, #facc15, #f59e0b)',
                boxShadow: '0 0 6px #facc15',
              }}
            />
          </div>
        ))}
      </div>

      {/* ドーム */}
      <div
        className="mx-auto h-4 w-[45%] rounded-t-full"
        style={{
          background: 'linear-gradient(135deg, #bfdbfe, #93c5fd, #60a5fa)',
          boxShadow: '0 0 12px rgba(147,197,253,0.5), inset 0 0 6px rgba(255,255,255,0.3)',
        }}
      />

      {/* 本体 */}
      <div
        className="relative -mt-1 h-4 w-full rounded-full"
        style={{
          background: 'linear-gradient(180deg, #9ca3af, #6b7280, #4b5563)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        {/* 窓 */}
        <div className="absolute left-1/2 top-1 flex -translate-x-1/2 gap-1">
          {['#34d399', '#60a5fa', '#f472b6', '#facc15'].map((color) => (
            <div
              key={color}
              className="h-2 w-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 4px ${color}` }}
            />
          ))}
        </div>
      </div>

      {/* 下部グロー */}
      <div
        className="mx-auto h-1.5 w-[70%] rounded-full"
        style={{
          background: 'linear-gradient(180deg, rgba(250,204,21,0.5), rgba(250,204,21,0))',
        }}
      />
    </div>
  );
});

export default Spaceship;
```

- [ ] **Step 2: `globals.css` に UFO アニメーション keyframes を追加**

`src/app/globals.css` の末尾に追記:

```css
@keyframes ufoFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
```

- [ ] **Step 3: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/components/chat/Spaceship.tsx src/app/globals.css
git commit -m "feat: CSS/SVG UFO Spaceship コンポーネントを追加"
```

---

## Task 11: TractorBeam コンポーネント

**Files:**
- Create: `src/components/chat/TractorBeam.tsx`

- [ ] **Step 1: `src/components/chat/TractorBeam.tsx` を作成**

`spaceshipRef` を受け取り、UFO 底辺の実際の DOM 位置からビームを配置する。

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

type Phase = 'closed' | 'lifting' | 'beaming' | 'open' | 'closing';

type Props = {
  phase: Phase;
  spaceshipRef: React.RefObject<HTMLDivElement | null>;
};

type BeamPosition = { top: number; right: number } | null;

export default function TractorBeam({ phase, spaceshipRef }: Props) {
  const [position, setPosition] = useState<BeamPosition>(null);
  const beamVisible = phase === 'beaming' || phase === 'open';

  // UFO の底辺位置を測定してビームを配置
  useEffect(() => {
    if (!beamVisible) return;

    function measureAndAlign() {
      const el = spaceshipRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const beamWidth = 90;
      const ufoBottomY = rect.bottom;
      const ufoCenterX = rect.left + rect.width / 2;
      const rightFromViewport = window.innerWidth - (ufoCenterX + beamWidth / 2);
      setPosition({ top: ufoBottomY, right: rightFromViewport });
    }

    // UFO の transition 完了後に測定（transition は 1.1s）
    const timer = setTimeout(measureAndAlign, 50);
    return () => clearTimeout(timer);
  }, [beamVisible, spaceshipRef]);

  if (!beamVisible || !position) return null;

  return (
    <div
      className="pointer-events-none fixed z-40"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
        width: '90px',
        height: beamVisible ? '80px' : '0px',
        clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
        background:
          'linear-gradient(to bottom, rgba(253,224,71,0.95) 0%, rgba(250,204,21,0.55) 50%, rgba(251,191,36,0.15) 100%)',
        animation: beamVisible ? 'beamGrow 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none',
        transformOrigin: 'top center',
      }}
    >
      {/* 内側の明るいコア */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          clipPath: 'polygon(46% 0%, 54% 0%, 66% 100%, 34% 100%)',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: `globals.css` にビームアニメーションを追加**

`src/app/globals.css` の末尾に追記:

```css
@keyframes beamGrow {
  0%   { height: 0;   opacity: 0; }
  20%  { opacity: 1; }
  100% { height: 80px; opacity: 1; }
}
```

- [ ] **Step 3: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/components/chat/TractorBeam.tsx src/app/globals.css
git commit -m "feat: トラクタービーム演出コンポーネントを追加"
```

---

## Task 12: ChatWidget（状態管理・アニメーション統合）

**Files:**
- Create: `src/components/chat/ChatWidget.tsx`

- [ ] **Step 1: `src/components/chat/ChatWidget.tsx` を作成**

```typescript
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatEvent, Message } from './types';
import ChatPanel from './ChatPanel';
import Spaceship from './Spaceship';
import TractorBeam from './TractorBeam';

type Phase = 'closed' | 'lifting' | 'beaming' | 'open' | 'closing';

export default function ChatWidget() {
  const [phase, setPhase] = useState<Phase>('closed');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openingStatement, setOpeningStatement] = useState<string | null>(null);

  const spaceshipRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Opening Statement を初回マウント時に取得
  useEffect(() => {
    fetch('/api/chat/parameters')
      .then((r) => r.json())
      .then((data: { openingStatement: string | null }) => {
        setOpeningStatement(data.openingStatement);
      })
      .catch(() => {/* サイレントに失敗 */});
  }, []);

  // 開くアニメーション: lifting → beaming → open
  function handleOpen() {
    if (phase !== 'closed') return;
    setPhase('lifting');
    setTimeout(() => setPhase('beaming'), 1150); // UFO 移動完了後
    setTimeout(() => setPhase('open'), 1850);    // ビーム展開後
  }

  // 閉じるアニメーション: closing → closed
  function handleClose() {
    if (phase !== 'open') return;
    // 進行中のストリームを中断
    abortRef.current?.abort();
    setPhase('closing');
    setTimeout(() => setPhase('closed'), 1000);
  }

  function handleToggle() {
    if (phase === 'closed') handleOpen();
    else if (phase === 'open') handleClose();
  }

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 返答メッセージのプレースホルダー
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, conversationId }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? `Error ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            const event = JSON.parse(raw) as ChatEvent;

            if (event.type === 'meta') {
              setConversationId(event.conversationId);
            } else if (event.type === 'delta') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + event.text } : m,
                ),
              );
            } else if (event.type === 'error') {
              setError(event.message);
              // 空のプレースホルダーを削除
              setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            } else if (event.type === 'done') {
              break;
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message ?? 'エラーが発生しました');
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, conversationId],
  );

  // パネルの表示・非表示（フェードイン/アウト）
  const panelVisible = phase === 'open';
  const panelStyle: React.CSSProperties = {
    opacity: panelVisible ? 1 : 0,
    transform: panelVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(12px)',
    filter: panelVisible ? 'blur(0)' : 'blur(2px)',
    transition: panelVisible
      ? 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), filter 0.8s'
      : 'opacity 0.3s, transform 0.3s, filter 0.3s',
    pointerEvents: panelVisible ? 'auto' : 'none',
  };

  return (
    <>
      <Spaceship ref={spaceshipRef} phase={phase} onClick={handleToggle} />
      <TractorBeam phase={phase} spaceshipRef={spaceshipRef} />
      {(phase === 'open' || phase === 'closing') && (
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          openingStatement={openingStatement}
          error={error}
          onSendMessage={sendMessage}
          onClose={handleClose}
          style={panelStyle}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/chat/ChatWidget.tsx
git commit -m "feat: ChatWidget メイン状態管理・アニメーション統合"
```

---

## Task 13: layout.tsx 更新・既存ファイル削除

**Files:**
- Modify: `src/app/layout.tsx`
- Delete: `src/components/ChatWidget.tsx`

- [ ] **Step 1: `src/app/layout.tsx` を更新**

`ChatWidget` を dynamic import で遅延読み込みに切り替える。

`src/app/layout.tsx` を開き、以下のように変更する:

```typescript
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { DEFAULT_METADATA } from "@/lib/seo";
import { ThemeProvider } from "@/contexts/theme-context";
import Providers from "@/components/Providers";
import { GTMScript } from "@/components/GTMScript";
import "./globals.css";

// チャットウィジェットはページ初期描画に影響しないよう遅延読み込み
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"), {
  ssr: false,
});

export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <GTMScript />
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 旧 `src/components/ChatWidget.tsx` を削除**

```bash
git rm src/components/ChatWidget.tsx
```

- [ ] **Step 3: ビルド確認**

```bash
pnpm build 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/app/layout.tsx
git commit -m "feat: layout.tsx を dynamic import に更新・旧 ChatWidget を削除"
```

---

## Task 14: 環境変数の整理

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: 環境変数に `DIFY_API_KEY` と `DIFY_API_BASE_URL` を追加（dotenvxで暗号化）**

```bash
# DIFY_API_KEY を追加（実際の API Key に置き換える）
dotenvx set DIFY_API_KEY "your-dify-api-key-here" -f .env.local

# DIFY_API_BASE_URL を追加
dotenvx set DIFY_API_BASE_URL "https://api.dify.ai/v1" -f .env.local

# CHAT_DISABLED を追加（通常は false）
dotenvx set CHAT_DISABLED "false" -f .env.local
```

- [ ] **Step 2: `NEXT_PUBLIC_DIFY_CHATBOT_URL` を削除**

`.env.local` を開き、`NEXT_PUBLIC_DIFY_CHATBOT_URL` の行を削除する（dotenvx で管理の場合は暗号化行ごと削除）。

- [ ] **Step 3: ローカル動作確認**

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開き:
1. 右下に UFO が表示される
2. UFO をクリックすると、UFO が上に移動し、ビームが伸び、チャットパネルが現れる
3. メッセージを送信するとストリーミング表示される
4. ✕ ボタンでチャットが閉じる

- [ ] **Step 4: Vercel 環境変数を設定**

Vercel ダッシュボード > Settings > Environment Variables で以下を設定:
- `DIFY_API_KEY`: Dify の API キー
- `DIFY_API_BASE_URL`: `https://api.dify.ai/v1`
- `CHAT_DISABLED`: `false`

`NEXT_PUBLIC_DIFY_CHATBOT_URL` は Vercel からも削除する。

- [ ] **Step 5: lint と build を最終確認**

```bash
pnpm lint
pnpm build
```

Expected: エラーなし

- [ ] **Step 6: コミット**

```bash
git add .env.local
git commit -m "chore: Dify API 環境変数を追加・iframe用変数を削除"
```

---

## Task 15: Push & PR 作成

- [ ] **Step 1: feature ブランチを push**

```bash
git push origin feature/dify-chatbot-widget
```

- [ ] **Step 2: Vercel プレビューデプロイで動作確認**

PR の Vercel プレビュー URL を開き、以下を確認:
1. チャットウィジェットが右下に表示される
2. UFO クリックでアニメーションが正常に動作する
3. メッセージが Dify 経由でストリーミング表示される
4. レート制限（11回連打で 429）が動作する

- [ ] **Step 3: `dev` ブランチへの PR を作成**

```bash
gh pr create \
  --base dev \
  --title "feat: Dify iframe を廃止してカスタムチャットUI に置き換え" \
  --body "$(cat <<'EOF'
## Summary

- Dify の iframe 埋め込みを廃止し、Dify API 直叩きのカスタムチャットUIに移行
- UFO → トラクタービーム → パネル登場のアニメーション演出を実装
- SSE ストリーミング対応（文字が逐次表示）
- IPベースのレート制限・入力長制限・匿名セッション・緊急停止スイッチを実装（Codex セキュリティレビュー反映）

## Test plan

- [ ] ローカルで UFO → ビーム → パネル登場アニメーションを確認
- [ ] メッセージ送信でストリーミング表示を確認
- [ ] `CHAT_DISABLED=true` で 503 を確認
- [ ] 11回連打で 429 を確認
- [ ] `pnpm lint` / `pnpm build` が通ることを確認
- [ ] Vercel プレビューデプロイで動作確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 完了チェックリスト（設計書 §12 より）

- [ ] 既存 `src/components/ChatWidget.tsx` が削除されている
- [ ] iframe 関連の環境変数 `NEXT_PUBLIC_DIFY_CHATBOT_URL` が削除されている
- [ ] `/api/chat` で SSE が動作する
- [ ] `/api/chat/parameters` から Opening Statement が取得できる
- [ ] レート制限が動作する（手動テストで 429 を確認）
- [ ] 緊急停止スイッチが動作する（`CHAT_DISABLED=true` で 503）
- [ ] ローカルで UFO → ビーム → パネル登場が確認できる
- [ ] `pnpm lint` / `pnpm build` が通る
- [ ] Vercel プレビューデプロイで動作確認
