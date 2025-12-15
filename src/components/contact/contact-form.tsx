"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, Building2, MessageSquare, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { sendContactEmail } from "@/app/actions/contact";
import * as Dialog from "@radix-ui/react-dialog";

const formSchema = z.object({
	name: z.string().min(2, {
		message: "名前は2文字以上で入力してください。",
	}),
	email: z.string().email({
		message: "正しいメールアドレスを入力してください。",
	}),
	company: z.string().optional(),
	subject: z.string().min(2, {
		message: "件名は2文字以上で入力してください。",
	}),
	message: z.string().min(10, {
		message: "メッセージは10文字以上で入力してください。",
	}),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
	const [isPending, startTransition] = useTransition();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [formData, setFormData] = useState<FormValues | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			subject: "",
			message: "",
		},
	});

	// 確認画面への遷移（バリデーション通過後）
	const handleConfirm = (values: FormValues) => {
		setFormData(values);
		setIsConfirmOpen(true);
	};

	// 実際の送信処理
	const handleFinalSubmit = () => {
		if (!formData) return;

		const submitData = new FormData();
		submitData.append("name", formData.name);
		submitData.append("email", formData.email);
		submitData.append("company", formData.company || "");
		submitData.append("subject", formData.subject);
		submitData.append("message", formData.message);

		startTransition(async () => {
			const result = await sendContactEmail(
				// @ts-ignore: prevState unused
				{ success: false, message: "" },
				submitData
			);

			if (result.success) {
				toast.success(result.message);
				form.reset();
				setFormData(null);
				setIsConfirmOpen(false);
			} else {
				toast.error(result.message);
				// エラー時はモーダルを閉じてフォームで修正させる
				setIsConfirmOpen(false);
				if (result.errors) {
					if (result.errors.name) form.setError("name", { message: result.errors.name[0] });
					if (result.errors.email) form.setError("email", { message: result.errors.email[0] });
					if (result.errors.subject) form.setError("subject", { message: result.errors.subject[0] });
					if (result.errors.message) form.setError("message", { message: result.errors.message[0] });
				}
			}
		});
	};

	return (
		<>
			<Card className="border-2 border-white/20 bg-black/80 backdrop-blur-sm">
				<CardHeader>
					<CardTitle className="text-2xl flex items-center gap-2 text-white">
						<Mail className="w-6 h-6" />
						お問い合わせフォーム
					</CardTitle>
					<p className="text-sm text-gray-300 mt-2">
						お気軽にお問い合わせください。担当者より折り返しご連絡いたします。
					</p>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleConfirm)}
							className="space-y-6"
						>
							{/* 名前 */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2 text-white">
											<User className="w-4 h-4" />
											お名前 *
										</FormLabel>
										<FormControl>
											<Input placeholder="山田太郎" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" disabled={isPending} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* メールアドレス */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2 text-white">
											<Mail className="w-4 h-4" />
											メールアドレス *
										</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="example@email.com"
												{...field}
												className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 会社名・団体名 */}
							<FormField
								control={form.control}
								name="company"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2 text-white">
											<Building2 className="w-4 h-4" />
											会社名・団体名（任意）
										</FormLabel>
										<FormControl>
											<Input placeholder="株式会社〇〇" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" disabled={isPending} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 件名 */}
							<FormField
								control={form.control}
								name="subject"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2 text-white">
											<MessageSquare className="w-4 h-4" />
											件名 *
										</FormLabel>
										<FormControl>
											<Input placeholder="お問い合わせ内容の件名" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" disabled={isPending} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* メッセージ */}
							<FormField
								control={form.control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-white">メッセージ *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="お問い合わせ内容をご記入ください。"
												className="resize-none min-h-[150px] bg-white/10 border-white/20 text-white placeholder:text-gray-400"
												{...field}
												disabled={isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isPending}>
								確認画面へ
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* 送信確認モーダル */}
			<Dialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
					<Dialog.Content className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 max-w-lg w-[95vw] md:w-full p-0 overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
						<div className="p-6">
							<Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
								<Mail className="w-5 h-5" />
								送信内容の確認
							</Dialog.Title>

							<div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
								<div className="grid grid-cols-[100px_1fr] gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
									<span className="font-bold text-gray-500 dark:text-gray-400">お名前</span>
									<span className="text-gray-900 dark:text-gray-100">{formData?.name}</span>
								</div>

								<div className="grid grid-cols-[100px_1fr] gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
									<span className="font-bold text-gray-500 dark:text-gray-400">メール</span>
									<span className="text-gray-900 dark:text-gray-100 break-all">{formData?.email}</span>
								</div>

								{formData?.company && (
									<div className="grid grid-cols-[100px_1fr] gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
										<span className="font-bold text-gray-500 dark:text-gray-400">会社名</span>
										<span className="text-gray-900 dark:text-gray-100">{formData?.company}</span>
									</div>
								)}

								<div className="grid grid-cols-[100px_1fr] gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
									<span className="font-bold text-gray-500 dark:text-gray-400">件名</span>
									<span className="text-gray-900 dark:text-gray-100">{formData?.subject}</span>
								</div>

								<div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
									<span className="font-bold text-gray-500 dark:text-gray-400 block border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">メッセージ</span>
									<p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{formData?.message}</p>
								</div>
							</div>

							<div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
								<Button
									variant="outline"
									onClick={() => setIsConfirmOpen(false)}
									className="flex-1"
									disabled={isPending}
								>
									戻る
								</Button>
								<Button
									onClick={handleFinalSubmit}
									className="flex-1"
									disabled={isPending}
								>
									{isPending ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											送信中...
										</>
									) : (
										"送信する"
									)}
								</Button>
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
