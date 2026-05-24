"use client";

import { useState } from "react";

export default function ChatWidget() {
	const [isOpen, setIsOpen] = useState(false);
	const chatbotUrl = process.env.NEXT_PUBLIC_DIFY_CHATBOT_URL;

	if (!chatbotUrl) return null;

	return (
		<>
			{/* チャットパネル */}
			{isOpen && (
				<div className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] rounded-2xl shadow-2xl overflow-hidden border border-border bg-background">
					<iframe
						src={chatbotUrl}
						title="TANEBI AI アシスタント"
						className="w-full h-full"
						allow="microphone"
					/>
				</div>
			)}

			{/* UFO フローティングボタン */}
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl bg-background border border-border hover:scale-110 transition-transform duration-200"
				aria-label={isOpen ? "チャットを閉じる" : "AIアシスタントを開く"}
			>
				{isOpen ? "✕" : "🛸"}
			</button>
		</>
	);
}
