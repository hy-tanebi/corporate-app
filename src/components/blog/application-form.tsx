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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, Phone, Music } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "名前は2文字以上で入力してください。",
  }),
  email: z.string().email({
    message: "正しいメールアドレスを入力してください。",
  }),
  phone: z.string().optional(),
  experience: z.string().min(10, {
    message: "演奏経験について10文字以上で入力してください。",
  }),
  available_days: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "参加可能日を少なくとも1つ選択してください。",
  }),
  message: z.string().optional(),
});

const weekdays = [
  { id: "monday", label: "月曜日" },
  { id: "tuesday", label: "火曜日" },
  { id: "wednesday", label: "水曜日" },
  { id: "thursday", label: "木曜日" },
  { id: "friday", label: "金曜日" },
  { id: "saturday", label: "土曜日" },
  { id: "sunday", label: "日曜日" },
];

interface ApplicationFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
}

export function ApplicationForm({ onSubmit }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      experience: "",
      available_days: [],
      message: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error("送信エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Mail className="w-5 h-5" />
          お問い合わせ・応募フォーム
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 名前 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    お名前 *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="山田太郎" {...field} />
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
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    メールアドレス *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 電話番号 */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    電話番号（任意）
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="090-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 演奏経験 */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    演奏経験 *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="楽器の演奏経験、バンド活動の経験、音楽歴などについて詳しくお書きください。"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 参加可能日 */}
            <FormField
              control={form.control}
              name="available_days"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base font-medium">
                      参加可能な曜日 *
                    </FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {weekdays.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name="available_days"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, day.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== day.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
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
                  <FormLabel>その他のメッセージ（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ご質問やご要望があれば、こちらにお書きください。"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "送信中..." : "応募する"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}