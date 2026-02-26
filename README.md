# YouTube Transcript Viewer

This repository contains a full‑stack Next.js application that converts YouTube video URLs into human‑readable transcripts. Users can paste a YouTube link and the app will extract the video’s metadata and captions (where available) so they can be searched, copied to the clipboard, downloaded as TXT/SRT/VTT, and even summarised with AI. The UI is responsive, accessible and handles invalid inputs gracefully.

## Setup (development)

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Run the development server**

   ```sh
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

## Project structure

This project uses the Next.js **App Router** and TypeScript. Key folders include:

- `src/lib/` – Utilities for parsing YouTube URLs (`youtube.ts`), fetching and caching transcripts (`providers/`, `transcriptProvider.ts`, `cache.ts`), formatting transcripts (`formatter.ts`) and applying rate limiting (`rateLimiter.ts`).
- `src/app/` – Application routes using the App Router. API endpoints live under `src/app/api/`, including `transcript/route.ts` for fetching transcripts and `summarize/route.ts` for AI‑generated summaries. `layout.tsx` defines global HTML structure and `page.tsx` is the home page.
- `src/components/` – Reusable React components for the form, transcript viewer, language selector, search bar, export buttons and summarisation section.
- `src/__tests__/` – Jest unit tests for the URL parser, transcript provider, API route and formatter utilities.

## Environment variables

The following environment variables can be defined to configure the application:

| Name | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | API key for OpenAI. When set, users can click “Summarise Transcript” to generate a concise summary using GPT‑3.5. Without this, the summarisation endpoint returns a 503 error. |
| `REDIS_URL` | No | Connection string for a Redis instance. When provided, transcripts and rate limit counters are stored in Redis, allowing caching and rate limiting across serverless instances. Without it, in‑memory caches are used (suitable for development). |
| `RATE_LIMIT_POINTS` | No | Number of allowed transcript fetches per IP within the rate limit window. Default: `20`. |
| `RATE_LIMIT_DURATION` | No | Duration of the rate limit window in seconds. Default: `60` seconds. |

Set these variables in a `.env.local` file for local development or in your hosting provider’s environment settings.

## Transcript fetching

Transcripts are fetched using the `YoutubeTranscriptProvider`. This provider first attempts to use the `youtube-caption-extractor` package to retrieve official caption tracks and basic video details【930633602005964†L0-L6】. If that fails (for example if the package is unavailable) it falls back to YouTube’s public `timedtext` API to download caption tracks and `oEmbed` to fetch video metadata. Available caption languages are listed and the user can switch languages via the dropdown.

Results are cached on the server (in memory or Redis) keyed by `videoId` and language for one hour, reducing latency and external requests. The API route also enforces a per‑IP rate limit using `rate-limiter-flexible` to mitigate abuse. If the rate limit is exceeded, a `429` response with a `Retry‑After` header is returned.

## Summarisation

The `/api/summarize` endpoint accepts a transcript and, when an `OPENAI_API_KEY` is provided, sends it to OpenAI’s chat completion API with a prompt instructing the model to produce a short paragraph and bullet points. The UI exposes this via the “Summarise Transcript” button and displays the AI‑generated summary along with bullet points. Summaries are clearly marked as AI‑generated. Without an API key, this feature is disabled and the endpoint returns a 503.

## Running tests

Unit tests are implemented with Jest and can be run via:

```sh
npm test
```

These tests cover URL parsing, transcript fetching (with mocked dependencies), API route behaviour and transcript formatting into TXT, SRT and VTT.

## Deployment

This application is designed for serverless deployment on platforms such as **Vercel**, **Railway** or **Render**. To deploy on Vercel:

1. Push this repository to a Git provider (GitHub, GitLab or Bitbucket).
2. Create a new Vercel project and import the repository. Choose “Next.js” when prompted.
3. In Vercel’s Environment Variables settings, define `OPENAI_API_KEY` (if summarisation is desired) and `REDIS_URL` (if using Vercel KV or another Redis instance) as well as optional rate limit settings.
4. Deploy the project. Vercel will build and serve the Next.js app using the App Router and serverless API routes.

Railway or Render deployments follow a similar pattern: ensure environment variables are set and run `npm run build` during the build step. Use `npm start` to serve the production build.

## Known limitations and future improvements

- **Caption availability:** The app relies on official YouTube captions. If a video has no captions, the API returns a clear error and no transcript is displayed. Integrating speech‑to‑text as a fallback is possible but not implemented here to avoid ToS concerns.
- **Shorts and playlists:** The URL parser rejects YouTube Shorts and playlist URLs; only standard video URLs (and `youtu.be` links) are supported.
- **Summarisation costs:** Using the OpenAI API incurs costs. Summaries are limited to the first 10,000 characters of the transcript to control token usage.
- **Accessibility:** Basic ARIA labels and keyboard navigation are included, but further accessibility testing could be performed.
- **Internationalisation:** The UI is currently English‑only; adding localisation would improve usability for non‑English speakers.

## Design overview

The application is composed of a single page with the following components:

| Component | Description |
| --- | --- |
| **VideoForm** | A form where the user pastes a YouTube URL and submits it. On success it invokes a callback with the URL and transcript response. Displays validation and loading states. |
| **TranscriptViewer** | Displays the fetched transcript along with video metadata. Accepts the current language and a handler for when the user selects a different language. |
| **LanguageSelector** | Dropdown listing available caption languages (with markers for auto‑generated and default tracks). Triggers re‑fetch when changed. |
| **SearchBar** | Text input that debounces changes and notifies the parent component of the search term. |
| **TranscriptDisplay** | Shows each transcript line with a timestamp. When a search term is provided, matching terms are highlighted. The list is scrollable to handle long transcripts. |
| **ExportButtons** | Buttons for copying the transcript to the clipboard and downloading it as `.txt`, `.srt` or `.vtt` files. |
| **SummarySection** | Optional AI summary. Provides a button to call the `/api/summarize` endpoint, and displays a paragraph and bullet points once generated. |

The page state consists of the pasted URL, the fetched transcript data (`TranscriptResponse`), the selected language and the search term. The form updates the transcript data; the language selector triggers a re‑fetch; the search bar filters the displayed transcript; and the summarisation section calls the separate API route when requested.