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
import { Mail, User, Building2, MessageSquare } from "lucide-react";
import { useState } from "react";

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

interface ContactFormProps {
	onSubmit?: (data: z.infer<typeof formSchema>) => Promise<void>;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			subject: "",
			message: "",
		},
	});

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsSubmitting(true);
		try {
			if (onSubmit) {
				await onSubmit(values);
			} else {
				// 仮の処理（後でデータベース連携を実装）
				console.log("Form submitted:", values);
				alert("送信が完了しました。（デモ）");
			}
			form.reset();
		} catch (error) {
			console.error("送信エラー:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
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
						onSubmit={form.handleSubmit(handleSubmit)}
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
										<Input placeholder="山田太郎" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
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
										<Input placeholder="株式会社〇〇" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
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
										<Input placeholder="お問い合わせ内容の件名" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
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
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? "送信中..." : "送信する"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
