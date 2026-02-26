"use client";
import { useState } from 'react';
import { formatPlainText, formatSRT, formatVTT } from '@/lib/formatter';
import type { TranscriptEntry } from '@/lib/transcriptProvider';

interface ExportButtonsProps {
  transcript: TranscriptEntry[];
  title?: string;
}

/**
 * Buttons to copy the transcript to the clipboard or download it in
 * different subtitle formats (TXT, SRT, VTT). When copying, a brief
 * confirmation message is shown.
 */
export default function ExportButtons({ transcript, title }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const filenameBase = (title || 'transcript').replace(/[^a-z0-9_-]+/gi, '_').toLowerCase();

  function triggerDownload(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    try {
      const text = formatPlainText(transcript);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore copy errors */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mt-4">
      <button
        onClick={handleCopy}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {copied ? 'Copied!' : 'Copy Transcript'}
      </button>
      <button
        onClick={() => triggerDownload(`${filenameBase}.txt`, formatPlainText(transcript), 'text/plain')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download TXT
      </button>
      <button
        onClick={() => triggerDownload(`${filenameBase}.srt`, formatSRT(transcript), 'application/x-subrip')}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Download SRT
      </button>
      <button
        onClick={() => triggerDownload(`${filenameBase}.vtt`, formatVTT(transcript), 'text/vtt')}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Download VTT
      </button>
    </div>
  );
}