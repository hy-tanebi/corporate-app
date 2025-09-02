"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CreateApplicationData } from "@/lib/types/application";

const applicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  experience: z.string().min(10),
  available_days: z.array(z.string()).min(1),
  message: z.string().optional(),
});

export async function createApplication(data: CreateApplicationData) {
  try {
    // バリデーション
    const validatedData = applicationSchema.parse(data);

    // Prismaでデータベースに保存
    const applicationData = await prisma.application.create({
      data: validatedData,
    });

    // 管理者への通知メール送信（実装例）
    await sendNotificationEmail(validatedData);

    // 確認メール送信（実装例）
    await sendConfirmationEmail(validatedData);

    revalidatePath("/blog");

    return {
      success: true,
      message: "応募を受け付けました。確認メールをお送りしますので、ご確認ください。",
      data: applicationData,
    };
  } catch (error) {
    console.error("Application submission error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "入力内容に不備があります。",
        errors: error.issues,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "応募の送信中にエラーが発生しました。",
    };
  }
}

// 管理者への通知メール送信（実装例）
async function sendNotificationEmail(data: CreateApplicationData) {
  // ここにメール送信のロジックを実装
  // 例: Resend, SendGrid, Amazon SES等を使用
  console.log("管理者への通知メール:", {
    subject: `新しい応募: ${data.name}様`,
    applicant: data,
  });
}

// 応募者への確認メール送信（実装例）
async function sendConfirmationEmail(data: CreateApplicationData) {
  // ここに確認メール送信のロジックを実装
  console.log("確認メール送信:", {
    to: data.email,
    subject: "応募ありがとうございます",
    applicant: data.name,
  });
}