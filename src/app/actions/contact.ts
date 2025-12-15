'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  company: z.string().optional(),
  subject: z.string().min(1, '件名を入力してください'),
  message: z.string().min(1, 'メッセージを入力してください'),
});

export type ContactState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    company?: string[];
    subject?: string[];
    message?: string[];
  };
};

export async function sendContactEmail(prevState: ContactState, formData: FormData): Promise<ContactState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: '入力内容に誤りがあります。',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, company, subject, message } = validatedFields.data;

  try {
    const userEmail = 'onboarding@resend.dev';
    const myEmail = process.env.CONTACT_EMAIL;

    if (!myEmail) {
        // 環境変数が設定されていない場合のエラーハンドリング
        // ユーザー入力(email)を使うと、Resendの無料枠制限でエラーになるため、
        // 開発者向けに明確なエラーを出すか、安全なフォールバックを行う
        console.error('SERVER SETUP ERROR: CONTACT_EMAIL is not set in .env.local');
        return {
            success: false,
            message: 'システムエラー: 管理者設定に不備があります。CONTACT_EMAILを設定してください。'
        };
    }

    const data = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: [myEmail],
      subject: `【お問い合わせ】${subject} (${name}様)`,
      replyTo: email,
      text: `以下の内容でお問い合わせがありました。\n\n名前: ${name}\n会社名: ${company || '未入力'}\nメール: ${email}\n件名: ${subject}\n\nメッセージ:\n${message}`,
    });

    if (data.error) {
        console.error('Resend API Error Details:', JSON.stringify(data.error, null, 2));

        // 特定のエラーに対するユーザーフレンドリーなメッセージ
        if (data.error.name === 'validation_error' && data.error.message.includes('resend.dev')) {
             return { success: false, message: '設定エラー: テストモードでは未登録のアドレスに送信できません。' };
        }

        return { success: false, message: 'メールの送信に失敗しました。' };
    }

    return { success: true, message: 'お問い合わせを受け付けました。' };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, message: 'サーバーエラーが発生しました。' };
  }
}
