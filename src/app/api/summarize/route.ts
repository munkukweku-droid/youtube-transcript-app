import { NextRequest, NextResponse } from 'next/server';
import type { TranscriptEntry } from '@/lib/transcriptProvider';

/**
 * API endpoint for summarising transcripts. Accepts a POST body with a
 * `transcript` array (containing objects with start, end and text fields)
 * and returns a short summary and bullet points. If the OpenAI API key
 * is not configured the endpoint returns a 503 error. See README for
 * instructions on configuring summarisation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transcript = body?.transcript as TranscriptEntry[] | undefined;
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid transcript' }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Summarisation is not configured. Set OPENAI_API_KEY to enable.' },
        { status: 503 }
      );
    }

    // Concatenate all caption texts into a single string. Limit to first
    // 10,000 characters to avoid very long payloads. The model will
    // summarise the entire text.
    const fullText = transcript.map((t) => t.text).join(' ');
    const truncated = fullText.slice(0, 10000);

    // Build a prompt instructing the model to produce a concise summary and
    // bullet points. We add the [AI‑generated] marker to clarify the
    // provenance.
    const prompt = `Summarise the following YouTube transcript into a short paragraph followed by 3–5 bullet points listing the key points. Ensure the summary is concise yet captures the essence of the content.\n\nTranscript:\n${truncated}`;

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarises video transcripts.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.5,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `OpenAI API error: ${error}` }, { status: 502 });
    }
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content as string | undefined;
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      );
    }

    // Attempt to split the summary into a paragraph and bullet points.
    const lines = content.trim().split(/\n+/);
    let summary = '';
    const bullets: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
        bullets.push(trimmed.replace(/^[-*]\s*/, ''));
      } else if (!summary) {
        summary = trimmed;
      }
    }
    if (!summary && lines.length > 0) {
      summary = lines[0].trim();
    }
    return NextResponse.json({ summary, bullets });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}