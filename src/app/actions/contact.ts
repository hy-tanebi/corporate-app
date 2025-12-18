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

    // 解説:
    // Resendでは、メールの「送信元(From)」は必ず「Resendで認証されたドメイン」である必要があります。
    // 一方、「送信先(To)」はGmailなど任意のアドレスで構いません。
    // エラー "The gmail.com domain is not verified" は、FromアドレスにGmailを指定してしまったために発生しています。
    // したがって、Fromは認証済みの 'contact@tanebi-net.com' に固定し、
    // Toは環境変数の CONTACT_EMAIL (ユーザーのGmail等) を使用するように分離します。

    const fromAddress = 'Contact Form <contact@tanebi-net.com>';
    const recipientEmail = myEmail; // 環境変数のアドレス（Gmail等でもOK）

    // 1. 管理者への通知メール
    const sendToAdmin = resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `【お問い合わせ】${subject} (${name}様)`,
      replyTo: email, // ユーザーのメアドをReply-Toに設定（返信ボタンでユーザーに返せるように）
      text: `以下の内容でお問い合わせがありました。\n\n名前: ${name}\n会社名: ${company || '未入力'}\nメール: ${email}\n件名: ${subject}\n\nメッセージ:\n${message}`,
    });

    // 2. ユーザーへの自動返信メール
    const sendAutoReply = resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: `【自動返信】お問い合わせありがとうございます`,
      text: `${name} 様\n\nお問い合わせありがとうございます。\n以下の内容で受け付けいたしました。\n担当者より折り返しご連絡させていただきますので、今しばらくお待ちください。\n\n--------------------------------------------------\n件名: ${subject}\nお名前: ${name}\n会社名: ${company || '未入力'}\nメッセージ:\n${message}\n--------------------------------------------------\n\n※このメールは自動送信されています。`,
    });

    // 並行して送信実行
    const [adminResult, userResult] = await Promise.all([sendToAdmin, sendAutoReply]);

    // 管理者への送信さえ成功していればよしとする（または両方のエラーをチェックする）
    if (adminResult.error) {
        console.error('Error sending email to admin:', adminResult.error);
        return {
          success: false,
          message: `メール送信エラー: ${adminResult.error.message || '不明なエラー'}`
        };
    }

    // ユーザーへの自動返信が失敗した場合（ログには出すが、問い合わせ自体は受け取れているので成功とする）
    if (userResult.error) {
        console.warn('Error sending auto-reply:', userResult.error);
        // ここでreturn falseにするかは要件次第だが、問い合わせ自体は受け取れているので成功とする
    }

    return { success: true, message: 'お問い合わせを受け付けました。（自動返信メールをお送りしました）' };
  } catch (error) {
    console.error('Server error:', error);
    return { success: false, message: 'サーバーエラーが発生しました。' };
  }
}
