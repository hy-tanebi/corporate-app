import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const slug = searchParams.get("slug");

	if (slug && !SLUG_PATTERN.test(slug)) {
		return new Response("Invalid slug", { status: 400 });
	}

	const dm = await draftMode();
	dm.disable();

	const cookieStore = await cookies();
	cookieStore.delete("__microcms_preview_draftkey");

	redirect(slug ? `/blog/${encodeURIComponent(slug)}` : "/blog");
}
