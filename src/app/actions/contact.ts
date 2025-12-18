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
    const myEmail = process.env.CONTACT_EMAIL;

    if (!myEmail) {
        console.error('SERVER SETUP ERROR: CONTACT_EMAIL is not set in .env.local');
        return {
            success: false,
            message: 'システムエラー: 管理者設定に不備があります。CONTACT_EMAILを設定してください。'
        };
    }

    // 解説:
    // 独自ドメインのDNS設定がまだ反映されていない、または使用しないため
    // Resendのテスト用ドメイン (onboarding@resend.dev) を送信元として使用します。
    // これにより、受信側のGmailアドレス (CONTACT_EMAIL) に確実に届くようになります。
    const fromAddress = 'Contact Form <onboarding@resend.dev>';
    const recipientEmail = myEmail;

    // 1. 管理者への通知メール
    const data = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `【お問い合わせ】${subject} (${name}様)`,
      replyTo: email, // ユーザーのメアドをReply-Toに設定
      text: `以下の内容でお問い合わせがありました。\n\n名前: ${name}\n会社名: ${company || '未入力'}\nメール: ${email}\n件名: ${subject}\n\nメッセージ:\n${message}`,
    });

    if (data.error) {
        console.error('Resend API Error Details:', JSON.stringify(data.error, null, 2));
        return {
          success: false,
          message: `メール送信エラー: ${data.error.message || '不明なエラー'}`
        };
    }

    return { success: true, message: 'お問い合わせを受け付けました。' };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, message: 'サーバーエラーが発生しました。' };
  }
}
