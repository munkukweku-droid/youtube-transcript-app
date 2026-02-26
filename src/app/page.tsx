"use client";

import { useState } from 'react';
import VideoForm from '@/components/VideoForm';
import TranscriptViewer from '@/components/TranscriptViewer';
import type { TranscriptResponse } from '@/lib/transcriptProvider';

export default function HomePage() {
  const [url, setUrl] = useState<string | null>(null);
  const [data, setData] = useState<TranscriptResponse | null>(null);
  const [lang, setLang] = useState<string>('');

  // Callback when the form successfully fetches a transcript. Stores the URL
  // and transcript data and sets the selected language to the default track.
  function handleResult(result: { url: string; data: TranscriptResponse }) {
    setUrl(result.url);
    setData(result.data);
    const available = result.data.availableLanguages || [];
    const defaultLang =
      available.find((l) => l.isDefault)?.code || available[0]?.code || 'en';
    setLang(defaultLang);
  }

  // Fetch a transcript for the current URL in the specified language. Called
  // when the user selects a new language. It reuses the stored URL.
  async function handleLanguageChange(newLang: string) {
    if (!url) return;
    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, lang: newLang }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error(json.error || 'Failed to fetch transcript');
        return;
      }
      setData(json);
      setLang(newLang);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-center">YouTube Transcript Viewer</h1>
      <VideoForm onResult={handleResult} />
      {data && url && (
        <TranscriptViewer data={data} currentLang={lang} onLanguageChange={handleLanguageChange} />
      )}
    </main>
  );
}
