"use client";
import { useState, FormEvent } from 'react';
import type { TranscriptResponse } from '@/lib/transcriptProvider';

interface VideoFormProps {
  /** Callback invoked after a successful fetch, providing both the URL and the transcript response */
  onResult: (result: { url: string; data: TranscriptResponse }) => void;
}

export default function VideoForm({ onResult }: VideoFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch transcript');
      }
      onResult({ url, data: json });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="url"
          required
          className="w-full p-2 border rounded"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Transcript'}
        </button>
      </form>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {/* Transcript rendering is handled by the parent component when onResult is called */}
    </div>
  );
}