"use client";
import type { TranscriptEntry } from '@/lib/transcriptProvider';

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  search: string;
}

/**
 * Render a list of transcript entries. Each line shows the timestamp and
 * text. If a search term is provided, matching text segments are
 * highlighted. Timestamps are shown in mm:ss format for readability.
 */
export default function TranscriptDisplay({ transcript, search }: TranscriptDisplayProps) {
  const term = search.trim().toLowerCase();

  function formatTime(s: number): string {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return (
    <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto border rounded p-4 bg-white">
      {transcript.map((entry, idx) => {
        const text = entry.text;
        let parts: React.ReactNode = text;
        if (term) {
          const lower = text.toLowerCase();
          const segments: React.ReactNode[] = [];
          let pos = 0;
          let matchIndex = lower.indexOf(term);
          while (matchIndex !== -1) {
            if (matchIndex > pos) {
              segments.push(text.slice(pos, matchIndex));
            }
            segments.push(
              <mark key={matchIndex} className="bg-yellow-200">
                {text.slice(matchIndex, matchIndex + term.length)}
              </mark>
            );
            pos = matchIndex + term.length;
            matchIndex = lower.indexOf(term, pos);
          }
          if (pos < text.length) {
            segments.push(text.slice(pos));
          }
          parts = segments;
        }
        return (
          <div key={idx} className="flex space-x-2 text-sm">
            <span className="text-blue-600 cursor-default" title={`From ${entry.start.toFixed(2)}s to ${entry.end.toFixed(2)}s`}>
              {formatTime(entry.start)}
            </span>
            <span className="flex-1">{parts}</span>
          </div>
        );
      })}
    </div>
  );
}