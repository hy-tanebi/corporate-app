import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getBlogPost } from "@/lib/microcms";

const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function GET(request: NextRequest) {
	const secret = process.env.MICROCMS_PREVIEW_SECRET;
	if (!secret) {
		console.error("[preview] MICROCMS_PREVIEW_SECRET が未設定です");
		return new Response("Preview not configured", { status: 500 });
	}

	const { searchParams } = request.nextUrl;
	const requestSecret = searchParams.get("secret");
	const slug = searchParams.get("slug");
	const draftKey = searchParams.get("draftKey");

	if (!requestSecret || requestSecret !== secret) {
		return new Response("Invalid token", { status: 401 });
	}
	if (!slug || !SLUG_PATTERN.test(slug)) {
		return new Response("Invalid slug", { status: 400 });
	}
	if (!draftKey) {
		return new Response("Missing draftKey", { status: 400 });
	}

	try {
		await getBlogPost(slug, draftKey);
	} catch {
		return new Response("Post not found", { status: 404 });
	}

	const dm = await draftMode();
	dm.enable();

	const cookieStore = await cookies();
	cookieStore.set("__microcms_preview_draftkey", draftKey, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 3600,
		path: "/blog",
	});

	redirect(`/blog/${encodeURIComponent(slug)}`);
}
