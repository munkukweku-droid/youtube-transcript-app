"use client";
import { useState } from 'react';
import type { TranscriptResponse } from '@/lib/transcriptProvider';
import LanguageSelector from './LanguageSelector';
import SearchBar from './SearchBar';
import TranscriptDisplay from './TranscriptDisplay';
import ExportButtons from './ExportButtons';
import SummarySection from './SummarySection';

interface TranscriptViewerProps {
  /** Transcript data and metadata returned from the API */
  data: TranscriptResponse;
  /** The currently selected language code */
  currentLang: string;
  /** Called when a new language is selected to fetch a different transcript */
  onLanguageChange: (lang: string) => void;
}

/**
 * Renders the transcript along with metadata, search, export buttons and
 * summarisation. Also provides a language selector when multiple tracks are
 * available. Handles search highlighting locally.
 */
export default function TranscriptViewer({ data, currentLang, onLanguageChange }: TranscriptViewerProps) {
  const [search, setSearch] = useState('');

  const { title, channel, thumbnail, duration, transcript, availableLanguages } = data;

  return (
    <div className="mt-6">
      {/* Metadata section */}
      <div className="flex items-start space-x-4">
        {thumbnail && (
          <img src={thumbnail} alt="Video thumbnail" className="w-32 h-20 object-cover rounded" />
        )}
        <div>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {channel && <p className="text-gray-600">{channel}</p>}
          {typeof duration === 'number' && (
            <p className="text-gray-600">Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')} mins</p>
          )}
        </div>
      </div>
      {availableLanguages && availableLanguages.length > 1 && (
        <LanguageSelector
          languages={availableLanguages}
          selected={currentLang}
          onSelect={onLanguageChange}
        />
      )}
      <SearchBar value={search} onChange={setSearch} />
      <ExportButtons transcript={transcript} title={title} />
      <TranscriptDisplay transcript={transcript} search={search} />
      <SummarySection transcript={transcript} />
    </div>
  );
}