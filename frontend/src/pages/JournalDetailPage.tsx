import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Volume2,
  Trash2,
  Edit3,
  Save,
  ArrowLeft,
  Loader2,
  Languages,
  Sparkles,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { journalService } from '../services/journalService';
import { aiService } from '../services/aiService';
import { JournalEntry } from '../types';

export const JournalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // AI loading
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return;
      setLoading(false);
      try {
        const data = await journalService.getJournalById(parseInt(id, 10));
        setEntry(data);
        setEditedTitle(data.title);
        setEditedTranscript(data.edited_transcript);
      } catch (err) {
        console.error('Failed to load journal entry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  const handleUpdate = async () => {
    if (!entry) return;
    setIsSaving(true);
    try {
      const updated = await journalService.updateJournal(entry.id, {
        title: editedTitle,
        edited_transcript: editedTranscript,
      });
      setEntry(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update entry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setIsDeleting(true);
    try {
      await journalService.deleteJournal(entry.id);
      navigate('/history');
    } catch (err) {
      console.error('Failed to delete entry:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTranslate = async () => {
    if (!entry) return;
    setAiLoading('translating');
    try {
      const res = await aiService.translate(entry.edited_transcript);
      const updated = await journalService.updateJournal(entry.id, {
        english_translation: res.english_translation,
      });
      setEntry(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handlePolish = async () => {
    if (!entry) return;
    setAiLoading('polishing');
    try {
      const res = await aiService.polish(entry.edited_transcript);
      const updated = await journalService.updateJournal(entry.id, {
        polished_entry: res.polished_entry,
      });
      setEntry(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleSummarize = async () => {
    if (!entry) return;
    setAiLoading('summarizing');
    try {
      const res = await aiService.summarize(entry.edited_transcript);
      const updated = await journalService.updateJournal(entry.id, {
        summary: res.summary,
      });
      setEntry(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-400">
        <Loader2 className="w-8 h-8 animate-spin text-lavender-600 mb-2" />
        <p className="text-sm">Reading journal memory...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-16">
        <h2 className="font-serif text-xl font-bold text-ink-900 mb-2">Entry not found</h2>
        <Link to="/history" className="text-sm text-lavender-700 hover:underline">
          Return to History
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to reflections</span>
        </Link>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white text-xs font-medium shadow-sm transition-colors"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-white hover:bg-cream-200 border border-cream-300 text-ink-700 text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-xl text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Are you sure you want to permanently delete this entry?</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 bg-white text-ink-700 border border-cream-300 rounded-lg hover:bg-cream-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Journal Card */}
      <article className="bg-white/95 rounded-3xl p-8 border border-cream-300 shadow-soft space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium text-lavender-700 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full font-serif text-2xl font-bold text-ink-900 bg-cream-50 p-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-lavender-500"
            />
          ) : (
            <h1 className="font-serif text-3xl font-bold text-ink-900 leading-tight">{entry.title}</h1>
          )}
        </div>

        {/* Audio Player if present */}
        {entry.audio_path && (
          <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-lavender-100 text-lavender-700 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <audio controls src={`/${entry.audio_path}`} className="w-full" />
          </div>
        )}

        {/* Manglish Spoken Words */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500 block mb-2">
            Spoken Manglish (Romanized)
          </span>
          {isEditing ? (
            <textarea
              rows={4}
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="w-full p-4 bg-cream-50 rounded-2xl border border-cream-300 font-serif text-ink-900 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-lavender-500"
            />
          ) : (
            <p className="font-serif text-lg text-ink-900 italic leading-relaxed bg-cream-50/50 p-5 rounded-2xl border border-cream-200">
              "{entry.edited_transcript}"
            </p>
          )}
        </div>

        {/* AI Enhancements */}
        <div className="space-y-4 pt-4 border-t border-cream-200">
          {/* English Translation */}
          {entry.english_translation ? (
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
                <Languages className="w-3.5 h-3.5" />
                <span>English Translation</span>
              </div>
              <p className="font-serif text-ink-900 leading-relaxed italic">{entry.english_translation}</p>
            </div>
          ) : (
            <button
              onClick={handleTranslate}
              disabled={aiLoading !== null}
              className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              {aiLoading === 'translating' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Languages className="w-3.5 h-3.5" />
              )}
              <span>Add English Translation</span>
            </button>
          )}

          {/* Polished Entry */}
          {entry.polished_entry ? (
            <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-800 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Polished Journal Passage</span>
              </div>
              <p className="font-serif text-ink-900 leading-relaxed">{entry.polished_entry}</p>
            </div>
          ) : (
            <button
              onClick={handlePolish}
              disabled={aiLoading !== null}
              className="inline-flex items-center space-x-1.5 text-xs text-purple-700 hover:text-purple-800 font-semibold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              {aiLoading === 'polishing' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Add Polished Passage</span>
            </button>
          )}

          {/* Summary */}
          {entry.summary ? (
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Reflection Summary</span>
              </div>
              <p className="text-sm text-ink-800 leading-relaxed">{entry.summary}</p>
            </div>
          ) : (
            <button
              onClick={handleSummarize}
              disabled={aiLoading !== null}
              className="inline-flex items-center space-x-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              {aiLoading === 'summarizing' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>Generate Summary</span>
            </button>
          )}
        </div>

        {/* Original Model Transcript Reference (Strictly Preserved) */}
        <div className="pt-4 border-t border-cream-200 text-xs text-ink-400">
          <strong className="block text-ink-600 font-medium">Original Whisper Model Output:</strong>
          <p className="mt-0.5 italic font-mono">{entry.original_transcript}</p>
        </div>
      </article>
    </div>
  );
};
