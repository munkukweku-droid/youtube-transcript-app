/**
 * Extracts a YouTube video ID from a given URL or plain ID string.
 *
 * Supports the following URL formats:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/v/VIDEO_ID
 *
 * Playlist and Shorts URLs are rejected. If the input appears to be a bare
 * video ID (11 characters of word or dash), it is returned as‑is.
 *
 * @param input A YouTube URL or bare video ID
 * @returns The extracted video ID
 * @throws Error if the URL is invalid or unsupported
 */
export function extractVideoId(input: string): string {
  if (!input) {
    throw new Error('URL cannot be empty');
  }
  const trimmed = input.trim();
  // If input looks like a bare video ID (11 chars), return it directly.
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  let url: URL;
  try {
    // Prepend protocol if missing
    const withProtocol = /^(https?:)?\/\//.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    url = new URL(withProtocol);
  } catch (err) {
    throw new Error('Invalid URL');
  }
  // Disallow playlists
  if (url.searchParams.has('list')) {
    throw new Error('Playlist URLs are not supported');
  }
  // Disallow YouTube Shorts
  if (url.pathname.startsWith('/shorts')) {
    throw new Error('Shorts URLs are not supported');
  }
  const host = url.hostname.replace(/^www\./, '');
  // youtu.be short links
  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return id;
    }
    throw new Error('Invalid YouTube video ID in URL');
  }
  // youtube.com
  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    // Watch URLs: v parameter
    const v = url.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
      return v;
    }
    // Embedded or legacy path formats
    const pathMatch = url.pathname.match(/\/(embed|v)\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch) {
      return pathMatch[2];
    }
  }
  throw new Error('Unsupported YouTube URL');
}