"use client";

import { Toaster } from "sonner";
import { ContactForm } from "./contact-form";

/**
 * お問い合わせフォームと、その結果通知用の Toaster をひとまとめにしたもの。
 *
 * この2つを同じ動的チャンクに入れることで、zod / react-hook-form / radix / sonner を
 * 「お問い合わせ導線に到達したとき」まで遅延できる。
 * Toaster をルートレイアウト(Providers.tsx)に戻すと sonner が全ページに載るため、戻さないこと。
 */
export function ContactExperience() {
	return (
		<>
			<ContactForm />
			<Toaster richColors position="top-center" />
		</>
	);
}
