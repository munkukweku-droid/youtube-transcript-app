"use client";
import { useState } from 'react';
import type { TranscriptEntry } from '@/lib/transcriptProvider';

interface SummarySectionProps {
  transcript: TranscriptEntry[];
}

/**
 * Provides a button to request a summary of the transcript. The summary is
 * generated via the `/api/summarize` endpoint and consists of a short
 * paragraph and bullet points. Displays loading state and errors.
 */
export default function SummarySection({ transcript }: SummarySectionProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ summary: string; bullets: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSummarise = async () => {
    setError(null);
    setSummary(null);
    setLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to summarise transcript');
      }
      setSummary(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleSummarise}
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        disabled={loading}
      >
        {loading ? 'Summarising...' : 'Summarise Transcript'}
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {summary && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold mb-2">Summary (AI‑generated)</h3>
          <p className="mb-2">{summary.summary}</p>
          {summary.bullets && summary.bullets.length > 0 && (
            <ul className="list-disc list-inside space-y-1">
              {summary.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}