import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const secret = process.env.MICROCMS_WEBHOOK_SECRET;

	if (!secret) {
		console.error("[revalidate] MICROCMS_WEBHOOK_SECRET が未設定です");
		return NextResponse.json(
			{ message: "Webhook secret not configured" },
			{ status: 500 },
		);
	}

	// リクエストボディを取得
	const body = await request.text();

	// microCMS の署名を検証
	const signature = request.headers.get("X-MICROCMS-Signature");
	if (!signature) {
		return NextResponse.json(
			{ message: "Missing signature" },
			{ status: 401 },
		);
	}

	const expectedSignature = crypto
		.createHmac("sha256", secret)
		.update(body)
		.digest("hex");

	// タイミング攻撃を防ぐため timingSafeEqual で比較
	const sigBuffer = Buffer.from(signature);
	const expectedBuffer = Buffer.from(expectedSignature);

	if (
		sigBuffer.length !== expectedBuffer.length ||
		!crypto.timingSafeEqual(sigBuffer, expectedBuffer)
	) {
		return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
	}

	// キャッシュを破棄して再生成
	revalidatePath("/");
	revalidatePath("/blog");
	revalidatePath("/blog/[slug]", "page");

	console.info("[revalidate] キャッシュを再生成しました");

	return NextResponse.json({ revalidated: true, now: Date.now() });
}
