import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Volume2, Sparkles, Languages, ChevronRight } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalCardProps {
  entry: JournalEntry;
}

export const JournalCard: React.FC<JournalCardProps> = ({ entry }) => {
  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/journal/${entry.id}`}
      className="group block bg-white/80 hover:bg-white rounded-2xl p-6 border border-cream-300/80 hover:border-lavender-300 shadow-soft hover:shadow-soft-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between text-xs font-medium text-ink-500 mb-2">
        <span className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-lavender-500" />
          <span>{formattedDate}</span>
        </span>
        {entry.audio_path && (
          <span className="flex items-center space-x-1 text-lavender-600 bg-lavender-50 px-2 py-0.5 rounded-full border border-lavender-200">
            <Volume2 className="w-3 h-3" />
            <span>Voice</span>
          </span>
        )}
      </div>

      <h3 className="font-serif text-lg font-semibold text-ink-900 group-hover:text-lavender-700 transition-colors mb-2 line-clamp-1">
        {entry.title}
      </h3>

      <p className="text-sm text-ink-600 line-clamp-2 italic mb-4 font-serif leading-relaxed">
        "{entry.edited_transcript || entry.original_transcript}"
      </p>

      {/* Feature tags & Read more */}
      <div className="flex items-center justify-between pt-3 border-t border-cream-200 text-xs text-ink-500">
        <div className="flex items-center space-x-2">
          {entry.english_translation && (
            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Languages className="w-3 h-3" />
              <span>Translated</span>
            </span>
          )}
          {entry.polished_entry && (
            <span className="inline-flex items-center space-x-1 text-lavender-700 bg-lavender-50 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3" />
              <span>Polished</span>
            </span>
          )}
        </div>

        <span className="flex items-center space-x-0.5 text-lavender-600 group-hover:translate-x-0.5 transition-transform font-medium">
          <span>Read</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};
