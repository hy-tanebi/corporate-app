import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

let cachedStatement: string | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cachedStatement !== null && now < cacheExpiresAt) {
    return NextResponse.json(
      { openingStatement: cachedStatement },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  }

  const baseUrl = process.env.DIFY_API_BASE_URL ?? 'https://api.dify.ai/v1';
  const apiKey = process.env.DIFY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ openingStatement: null });
  }

  try {
    const res = await fetch(`${baseUrl}/parameters`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json({ openingStatement: null });
    }

    const data = (await res.json()) as { opening_statement?: string };
    cachedStatement = data.opening_statement ?? null;
    cacheExpiresAt = now + CACHE_TTL;

    return NextResponse.json(
      { openingStatement: cachedStatement },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch {
    return NextResponse.json({ openingStatement: null });
  }
}
