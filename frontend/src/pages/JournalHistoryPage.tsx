import React, { useEffect, useState } from 'react';
import { Search, Loader2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { journalService } from '../services/journalService';
import { JournalEntry } from '../types';
import { JournalCard } from '../components/JournalCard';

export const JournalHistoryPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const limit = 12;

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await journalService.getJournals(page, limit, debouncedSearch || undefined);
        setEntries(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load journal history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page, debouncedSearch]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-900">Journal History</h1>
          <p className="text-xs text-ink-500 font-serif italic mt-0.5">
            Browse and revisit your past Manglish voice memories
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries or words..."
            className="w-full pl-10 pr-4 py-2 bg-white/90 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400">
          <Loader2 className="w-8 h-8 animate-spin text-lavender-600 mb-2" />
          <p className="text-sm">Fetching journal pages...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white/60 rounded-3xl p-12 text-center border border-dashed border-cream-300">
          <BookOpen className="w-12 h-12 text-ink-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-ink-900 mb-1">No reflections found</h3>
          <p className="text-xs text-ink-500 max-w-sm mx-auto">
            {search ? `No entries matching "${search}". Try another keyword.` : 'Start recording to fill your journal archives.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-white border border-cream-300 hover:bg-cream-100 disabled:opacity-40 text-ink-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-ink-600 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl bg-white border border-cream-300 hover:bg-cream-100 disabled:opacity-40 text-ink-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
