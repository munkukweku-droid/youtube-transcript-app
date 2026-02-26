import type { TranscriptEntry } from './transcriptProvider';

/**
 * Convert a float representing seconds into an SRT timestamp (HH:MM:SS,mmm).
 * Hours are zero‑padded to 2 digits. Milliseconds are zero‑padded to 3 digits.
 *
 * @param seconds Number of seconds
 */
export function toSrtTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds - Math.floor(seconds)) * 1000);
  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const mmm = String(millis).padStart(3, '0');
  return `${hh}:${mm}:${ss},${mmm}`;
}

/**
 * Convert seconds into a WebVTT timestamp (HH:MM:SS.mmm).
 * Similar to SRT but uses a dot instead of a comma for milliseconds.
 *
 * @param seconds Number of seconds
 */
export function toVttTimestamp(seconds: number): string {
  const srt = toSrtTimestamp(seconds);
  return srt.replace(',', '.');
}

/**
 * Format an array of transcript entries into plain text. Each caption text is
 * separated by a newline. Optionally include timestamps before each line.
 *
 * @param transcript Array of transcript entries
 * @param includeTimestamps Whether to prefix each line with a timestamp
 */
export function formatPlainText(transcript: TranscriptEntry[], includeTimestamps = false): string {
  return transcript
    .map((entry) => {
      const line = entry.text.trim();
      if (includeTimestamps) {
        const ts = toSrtTimestamp(entry.start);
        return `${ts} ${line}`;
      }
      return line;
    })
    .join('\n');
}

/**
 * Format transcript entries into SRT. Each cue is numbered sequentially.
 * The SRT format uses comma for millisecond separator.
 *
 * @param transcript Array of transcript entries
 */
export function formatSRT(transcript: TranscriptEntry[]): string {
  return transcript
    .map((entry, index) => {
      const seq = index + 1;
      const start = toSrtTimestamp(entry.start);
      const end = toSrtTimestamp(entry.end);
      const text = entry.text.trim();
      return `${seq}\n${start} --> ${end}\n${text}`;
    })
    .join('\n\n');
}

/**
 * Format transcript entries into WebVTT. The file starts with 'WEBVTT'.
 * Each cue is separated by a blank line and uses a dot for millisecond
 * separation.
 *
 * @param transcript Array of transcript entries
 */
export function formatVTT(transcript: TranscriptEntry[]): string {
  const cues = transcript
    .map((entry) => {
      const start = toVttTimestamp(entry.start);
      const end = toVttTimestamp(entry.end);
      const text = entry.text.trim();
      return `${start} --> ${end}\n${text}`;
    })
    .join('\n\n');
  return `WEBVTT\n\n${cues}`;
}