import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'YouTube Transcript Viewer',
  description: 'Convert YouTube videos into transcripts you can search, copy, and download.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}