import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, BookOpen, Sparkles, Clock, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { journalService } from '../services/journalService';
import { JournalEntry } from '../types';
import { JournalCard } from '../components/JournalCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentEntries = async () => {
      try {
        const data = await journalService.getJournals(1, 6);
        setEntries(data.items);
        setTotalCount(data.total);
      } catch (err) {
        console.error('Failed to load recent entries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentEntries();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Action Banner */}
      <div className="bg-gradient-to-r from-lavender-100 via-cream-100 to-lavender-50 rounded-3xl p-8 border border-lavender-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-lavender-700">
            {getGreeting()}, {user?.username}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 mt-1">
            How was your day?
          </h1>
          <p className="text-ink-600 text-sm mt-2 font-serif italic max-w-xl">
            Record what’s on your mind in natural Manglish. Speak freely — no need to translate your thoughts beforehand.
          </p>
        </div>

        <Link
          to="/record"
          className="inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-sm shadow-soft hover:shadow-soft-lg transition-all group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span>Record Voice Entry</span>
        </Link>
      </div>

      {/* Stats Quick Glance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 p-5 rounded-2xl border border-cream-300 shadow-soft flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-ink-900">{totalCount}</div>
            <div className="text-xs text-ink-500">Journal Reflections</div>
          </div>
        </div>

        <div className="bg-white/70 p-5 rounded-2xl border border-cream-300 shadow-soft flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-ink-900">Manglish</div>
            <div className="text-xs text-ink-500">Fine-Tuned Whisper Small</div>
          </div>
        </div>

        <div className="bg-white/70 p-5 rounded-2xl border border-cream-300 shadow-soft flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-ink-900">Romanized</div>
            <div className="text-xs text-ink-500">Preserving Spoken Nuance</div>
          </div>
        </div>
      </div>

      {/* Recent Entries Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink-900">Recent Reflections</h2>
            <p className="text-xs text-ink-500">Your latest recorded thoughts</p>
          </div>
          {entries.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-semibold text-lavender-700 hover:text-lavender-800 flex items-center space-x-1"
            >
              <span>View all entries</span>
              <Clock className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-400">
            <Loader2 className="w-8 h-8 animate-spin text-lavender-600 mb-2" />
            <p className="text-sm">Loading your journal...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white/60 rounded-3xl p-12 text-center border border-dashed border-cream-300">
            <div className="w-16 h-16 rounded-full bg-lavender-100 text-lavender-600 flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink-900 mb-2">
              Your journal is waiting for its first memory
            </h3>
            <p className="text-sm text-ink-600 max-w-md mx-auto mb-6">
              Press the record button and share a thought from today in Manglish. We’ll transcribe it into Romanized text automatically.
            </p>
            <Link
              to="/record"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-medium text-sm shadow-soft transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Entry</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
