import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';
import { YoutubeTranscriptProvider } from '@/lib/providers/youtubeProvider';
import { getCache, setCache } from '@/lib/cache';
import { applyRateLimit } from '@/lib/rateLimiter';

// Instantiate a provider once per module. In a serverless environment this
// instance may be reused across invocations, improving performance.
const provider = new YoutubeTranscriptProvider();

/**
 * API route for fetching YouTube transcripts.
 *
 * Expects a POST request with a JSON body containing a `url` and optional
 * `lang` property. The server will extract the video ID, fetch the
 * transcript using the configured provider and return a JSON response
 * containing metadata and transcript lines. Errors are returned with an
 * informative message and appropriate status code.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url as string | undefined;
    const lang = body?.lang as string | undefined;
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid URL' }, { status: 400 });
    }
    // Apply rate limit based on client IP. Next.js provides request.ip when
    // running on Node; fall back to X‑Forwarded‑For header if necessary.
    const ip =
      (request as any).ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const rate = await applyRateLimit(ip);
    if (!rate.allowed) {
      const retry = rate.retryAfter ? rate.retryAfter.toString() : '60';
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': retry } }
      );
    }
    // Parse and normalise the video ID. This will throw if invalid.
    const videoId = extractVideoId(url);
    const cacheKey = `${videoId}:${lang || ''}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    const data = await provider.getTranscript(videoId, lang);
    // Cache the result for one hour (3600 seconds).
    if (data?.transcript?.length) {
      await setCache(cacheKey, data, 60 * 60 * 1000);
    }
    return NextResponse.json(data);
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}