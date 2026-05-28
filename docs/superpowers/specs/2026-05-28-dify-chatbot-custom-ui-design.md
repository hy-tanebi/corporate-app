# Dify チャットボット カスタムUI 設計書

- **作成日**: 2026-05-28
- **対象ブランチ**: `feature/dify-chatbot-widget`
- **ステータス**: ドラフト / レビュー待ち

## 1. 目的

TANEBI CREATIVE コーポレートサイト (tanebi-net.com) において、Dify のホスト型チャットUIを iframe で埋め込んでいる現状を廃し、Dify API を直接叩く Next.js カスタムUI に置き換える。

ねらい:
- サイトのデザイントーン（宇宙テーマ・ミニマルライト）に合わせた一体感のあるチャット体験
- 演出（UFO → トラクタービーム → チャット登場）でブランド体験を強化
- Dify ロゴや UI 干渉を排除し、運用上の自由度を確保

## 2. 現状

- `src/components/ChatWidget.tsx`: Dify Web App URL (`NEXT_PUBLIC_DIFY_CHATBOT_URL`) を iframe で埋め込み、右下フローティングパネルで表示
- `src/app/layout.tsx`: ルートに `<ChatWidget />` を配置
- UFO 絵文字 (🛸) のフローティングボタンで開閉
- Difyロゴを隠すための白オーバーレイをかけて運用中

## 3. 要件

### 機能要件

| # | 要件 |
|---|------|
| F1 | Dify API (`/v1/chat-messages`) を叩く独自チャットUI |
| F2 | 右下フローティングパネル（現状踏襲） |
| F3 | ビジュアル: ミニマルライト（白ベース + 紫/インディゴアクセント） |
| F4 | SSE ストリーミング（応答の文字を逐次表示） |
| F5 | 会話履歴はセッションのみ。リロードで消える |
| F6 | 初期メッセージは Dify の Opening Statement を使用 |
| F7 | 開閉アニメーション: ① UFO が上に移動 → ② 黄色いトラクタービームが下に伸びる → ③ チャットパネルがフェードイン |
| F8 | UFO は暫定的に CSS/SVG。将来 react-three-fiber の3Dモデルに差し替え可能な抽象化 |

### 非機能要件（セキュリティ・運用）

| # | 要件 |
|---|------|
| N1 | Dify API キーはサーバー側のみ。クライアントに露出しない |
| N2 | IP ベースの簡易レート制限（10 req/min/IP） |
| N3 | 入力文字数制限（1メッセージ 500文字） |
| N4 | 同一 IP の同時 SSE 接続数 1 |
| N5 | 匿名セッション ID（HttpOnly Cookie）を Dify の `user` フィールドに利用 |
| N6 | 緊急停止スイッチ（`CHAT_DISABLED=true` で全停止） |
| N7 | クライアント切断時に upstream Dify fetch を abort |
| N8 | 公開コーポレートサイト規模（月数千〜数万PV）を想定 |

### スコープ外（次フェーズ）

- Turnstile / hCaptcha 等のキャプチャ
- Markdown レンダリング（プレーンテキスト表示で初期リリース）
- Upstash Redis 等の分散レート制限
- Dify 利用量アラート連携
- 会話履歴のサーバー永続化
- 多言語対応
- A/B テスト

## 4. アーキテクチャ

```
┌──────────────────────────────────────────┐
│ ChatWidget (Client Component, lazy)      │
│  ├─ Spaceship (UFOボタン, CSS/SVG)       │
│  ├─ TractorBeam (CSS演出)                │
│  └─ ChatPanel                            │
│      ├─ MessageList                      │
│      └─ ChatInput                        │
└──────────────────────────────────────────┘
                  │
                  │ fetch (POST, SSE response)
                  ▼
┌──────────────────────────────────────────┐
│ Next.js Route Handlers (Node runtime)    │
│  ├─ /api/chat            (SSE proxy)     │
│  └─ /api/chat/parameters (cached)        │
└──────────────────────────────────────────┘
                  │
                  │ HTTPS + Bearer DIFY_API_KEY
                  ▼
┌──────────────────────────────────────────┐
│ Dify Cloud API                           │
│  ├─ POST /v1/chat-messages (streaming)   │
│  └─ GET  /v1/parameters                  │
└──────────────────────────────────────────┘
```

設計原則:
- **APIキーはサーバー専用**: クライアントは `/api/chat` のみ叩く
- **SSE中継には薄い変換層**: Dify のイベント形式をそのまま漏らさず、UI 用の正規化スキーマで返す
- **チャットウィジェットは dynamic import**: ページ初期描画では読み込まない（LCP/INP 影響を抑える）

## 5. コンポーネント設計

### 5.1 ファイル構成（新規/変更）

| 種別 | パス | 役割 |
|------|------|------|
| 新規 | `src/lib/dify.ts` | Dify API 型定義・fetch クライアント |
| 新規 | `src/lib/rate-limit.ts` | IP ベース簡易レート制限（in-memory Map、TTL付き） |
| 新規 | `src/lib/session.ts` | 匿名セッション ID 発行・取得（HttpOnly Cookie） |
| 新規 | `src/app/api/chat/route.ts` | チャットメッセージ送信（SSE プロキシ） |
| 新規 | `src/app/api/chat/parameters/route.ts` | Opening Statement 取得（キャッシュ） |
| 新規 | `src/components/chat/ChatWidget.tsx` | エントリ。状態管理・アニメーション制御 |
| 新規 | `src/components/chat/Spaceship.tsx` | UFO ボタン |
| 新規 | `src/components/chat/TractorBeam.tsx` | ビーム演出 |
| 新規 | `src/components/chat/ChatPanel.tsx` | チャットパネル本体 |
| 新規 | `src/components/chat/MessageList.tsx` | メッセージ表示 |
| 新規 | `src/components/chat/ChatInput.tsx` | 入力欄 |
| 変更 | `src/components/ChatWidget.tsx` | 削除（新 `chat/ChatWidget.tsx` へ移行） |
| 変更 | `src/app/layout.tsx` | 新 ChatWidget を dynamic import で配置 |

### 5.2 ChatWidget の責務

```
ChatWidget
  状態:
    - phase: 'closed' | 'lifting' | 'beaming' | 'open' | 'closing'
    - messages: Message[]
    - conversationId: string | null
    - isStreaming: boolean
    - error: string | null
    - openingStatement: string | null
  振る舞い:
    - 初回マウント時に /api/chat/parameters を fetch（キャッシュ）
    - phase 遷移をタイマーで制御
    - sendMessage(text) → /api/chat に POST、SSE を読み、messages を更新
```

### 5.3 Message 型

```ts
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};
```

## 6. API 仕様

### 6.1 `POST /api/chat`

**リクエスト**:
```json
{
  "message": "こんにちは",
  "conversationId": null
}
```

**レスポンス**: `text/event-stream`

イベント形式（薄い正規化）:
```
data: {"type":"meta","conversationId":"abc-123"}

data: {"type":"delta","text":"こん"}

data: {"type":"delta","text":"にちは！"}

data: {"type":"done"}
```

エラー時:
```
data: {"type":"error","message":"rate limit exceeded"}
```

**HTTP ステータス**:
- `200`: ストリーム開始（中身のエラーは event で返す）
- `400`: 入力検証エラー（文字数超過等）
- `429`: レート制限到達
- `503`: `CHAT_DISABLED=true`

**サーバーロジック**:
1. `CHAT_DISABLED` チェック → true なら 503
2. Cookie から匿名セッション ID 取得、なければ発行
3. レート制限チェック（IP + セッション）
4. 入力検証（文字数、空文字）
5. Dify `/v1/chat-messages` に SSE で POST
6. クライアント切断を `request.signal` で監視し、`AbortController` で upstream を切る
7. Dify の各イベントを薄い正規化スキーマに変換して中継

**ランタイム設定**:
```ts
export const runtime = 'nodejs';
export const maxDuration = 60;
```

### 6.2 `GET /api/chat/parameters`

**レスポンス**:
```json
{
  "openingStatement": "こんにちは！TANEBI CREATIVE へようこそ。何でもお気軽にどうぞ。"
}
```

**キャッシュ**:
- `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
- サーバー内メモリにもキャッシュ（5分）

## 7. 環境変数

| 変数名 | スコープ | 用途 |
|--------|---------|------|
| `DIFY_API_KEY` | サーバー専用 | Dify API 認証 |
| `DIFY_API_BASE_URL` | サーバー専用 | デフォルト `https://api.dify.ai/v1` |
| `CHAT_DISABLED` | サーバー専用 | `true` で全停止 |
| ~~`NEXT_PUBLIC_DIFY_CHATBOT_URL`~~ | 削除 | iframe廃止に伴い不要 |

dotenvx で暗号化管理。Vercel 環境変数にも同様に設定。

## 8. アニメーション仕様

V5 で承認された挙動を採用:

| フェーズ | 所要時間 | 内容 |
|---------|---------|------|
| `lifting` | 約 1.1秒 | UFO が右下から上方向にゆっくり移動 |
| `beaming` | 約 0.7秒 | UFO 底辺からトラクタービーム（黄色、扇形）が下に伸びる |
| `panel-appear` | 約 0.8秒 | ビーム下端付近からチャットパネルがフェードイン（軽くblur→clear） |

閉じる時は逆順、合計約 1秒。

実装:
- ビーム位置は UFO の DOM 位置から JS で動的計算（ピクセル ズレ防止）
- CSS Transitions / Keyframes ベース。framer-motion は当面導入しない（既存依存にあるが新規には不要）

## 9. セキュリティ・運用

### 9.1 レート制限（簡易版）

実装: `src/lib/rate-limit.ts`

- IP ベース: 10 req/min
- セッションベース: 30 メッセージ/日
- in-memory `Map<key, { count, resetAt }>` で実装
- Vercel の serverless インスタンス間では共有されないが、コーポレートサイト規模では実用十分

### 9.2 入力検証

- 最大 500文字
- 空文字・空白のみは拒否
- `Content-Length` で先にブロック

### 9.3 セッション

- 初回アクセスで UUID v4 を発行
- HttpOnly + Secure + SameSite=Lax Cookie
- 有効期限 30日
- Dify の `user` フィールドに渡す

### 9.4 緊急停止

- `CHAT_DISABLED=true` で `/api/chat` が 503 を返す
- UI 側は 503 を検知してエラーメッセージ表示

### 9.5 ストリーム abort

```ts
const controller = new AbortController();
request.signal.addEventListener('abort', () => controller.abort());
const upstream = await fetch(difyUrl, { signal: controller.signal, ... });
```

## 10. 段階的実装方針

1. **Phase 1**: API ルート（`/api/chat`, `/api/chat/parameters`）と Dify クライアント
2. **Phase 2**: ChatWidget の状態管理とチャット動作（演出なし、最小UI）
3. **Phase 3**: アニメーション（UFO・ビーム・パネル登場）
4. **Phase 4**: スタイル調整・dynamic import 化・本番投入前テスト

各フェーズ末で `pnpm lint` / `pnpm build` 通過と動作確認を必須とする。

## 11. リスクと留意点

| リスク | 対策 |
|--------|------|
| in-memory rate limit が serverless 間で共有されない | コーポレート規模では許容。将来 Upstash Redis に差し替え |
| クライアント切断検知漏れで Dify コスト発生 | `request.signal` + `AbortController` で必ず upstream abort |
| Dify 側プロンプトインジェクション | Dify 側のシステムプロンプト・RAG範囲・ツール権限で対策（UI 側では防げない） |
| iframe 廃止で既存ユーザー体験が変わる | フォールバック不要（メジャー変更として扱う） |
| 3Dモデル後日差し替え時の互換性 | `Spaceship.tsx` をプロップ駆動の薄いラッパに保つ |

## 12. 完了条件

- [ ] 既存 `src/components/ChatWidget.tsx` が削除されている
- [ ] iframe 関連の環境変数 `NEXT_PUBLIC_DIFY_CHATBOT_URL` が削除されている
- [ ] `/api/chat` で SSE が動作する
- [ ] `/api/chat/parameters` から Opening Statement が取得できる
- [ ] レート制限が動作する（手動テストで 429 を確認）
- [ ] 緊急停止スイッチが動作する（`CHAT_DISABLED=true` で 503）
- [ ] ローカルで UFO → ビーム → パネル登場が確認できる
- [ ] `pnpm lint` / `pnpm build` が通る
- [ ] Vercel プレビューデプロイで動作確認

## 13. 参考

- [Dify API ドキュメント](https://docs.dify.ai/en/guides/application-publishing/developing-with-apis)
- [Dify Send Chat Message API](https://docs.dify.ai/api-reference)
- [Dify Get App Parameters API](https://docs.dify.ai/api-reference/applications/get-app-parameters)
- [Vercel Functions Duration](https://vercel.com/docs/functions/configuring-functions/duration)
- 設計時のセカンドオピニオン: Codex review session `019e6d3b-25ad-7ab2-a00b-8ce83306c138`
