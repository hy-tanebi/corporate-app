export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

export type ChatEvent =
  | { type: 'meta'; conversationId: string }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export function formatChatEvent(event: ChatEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
