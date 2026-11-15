import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Save,
  Languages,
  Sparkles,
  FileText,
  Volume2,
  AlertCircle,
  Loader2,
  Undo2,
} from 'lucide-react';
import { journalService } from '../services/journalService';
import { aiService } from '../services/aiService';
import { TranscriptionResponse } from '../types';

export const TranscriptEditorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    transcriptionData?: TranscriptionResponse;
    audioBlobUrl?: string;
  } | null;

  const originalTranscript = state?.transcriptionData?.original_transcript || '';
  const audioPath = state?.transcriptionData?.audio_path || null;
  const audioUrl = state?.audioBlobUrl || null;

  const [title, setTitle] = useState(
    `Reflection — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  );
  const [editedTranscript, setEditedTranscript] = useState(originalTranscript);
  const [englishTranslation, setEnglishTranslation] = useState<string | null>(null);
  const [polishedEntry, setPolishedEntry] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  // Loading states
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await aiService.translate(editedTranscript);
      setEnglishTranslation(res.english_translation);
      setStatusMessage('Translated to English successfully.');
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Translation service error.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePolish = async () => {
    setIsPolishing(true);
    try {
      const res = await aiService.polish(editedTranscript);
      setPolishedEntry(res.polished_entry);
      setStatusMessage('Created polished reflection passage.');
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Polishing service error.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await aiService.summarize(editedTranscript);
      setSummary(res.summary);
      setTopics(res.key_topics);
      setStatusMessage('Summary generated.');
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Summarization service error.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setStatusMessage('Please enter a title for your entry.');
      return;
    }

    setIsSaving(true);
    try {
      const savedEntry = await journalService.createJournal({
        title,
        audio_path: audioPath,
        original_transcript: originalTranscript,
        edited_transcript: editedTranscript,
        english_translation: englishTranslation,
        polished_entry: polishedEntry,
        summary: summary,
      });

      navigate(`/journal/${savedEntry.id}`);
    } catch (err: any) {
      console.error(err);
      if (Array.isArray(err.response?.data?.detail)) {
        setStatusMessage(err.response.data.detail.map((d: any) => d.msg).join(', '));
      } else {
        setStatusMessage(err.response?.data?.detail || 'Failed to save journal entry.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-900">Review & Refine</h1>
          <p className="text-xs text-ink-500 font-serif italic mt-0.5">
            Your spoken Manglish has been transcribed by our fine-tuned Whisper model.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-lavender-600 hover:bg-lavender-700 disabled:opacity-50 text-white font-medium text-sm shadow-soft transition-all self-start sm:self-auto"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Journal Entry</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-lavender-50 border border-lavender-200 rounded-xl text-xs text-lavender-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-lavender-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Audio Playback Bar */}
      {audioUrl && (
        <div className="bg-white/80 rounded-2xl p-4 border border-cream-300 shadow-soft flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-700 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {/* Title Input */}
      <div className="bg-white/90 rounded-2xl p-4 border border-cream-300 shadow-soft">
        <label className="block text-xs font-semibold text-ink-600 mb-1">Journal Entry Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full font-serif text-xl font-semibold text-ink-900 bg-transparent border-b border-cream-300 pb-1 focus:outline-none focus:border-lavender-600 transition-colors"
          placeholder="Untitled Reflection"
        />
      </div>

      {/* Editor & Original Comparison */}
      <div className="space-y-4">
        {/* Editable Transcript */}
        <div className="bg-white/90 rounded-3xl p-6 border border-cream-300 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-lavender-700">
              Romanized Manglish Transcript
            </span>
            {editedTranscript !== originalTranscript && (
              <button
                onClick={() => setEditedTranscript(originalTranscript)}
                className="text-xs text-ink-500 hover:text-lavender-700 flex items-center space-x-1"
                title="Reset to model output"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset to model</span>
              </button>
            )}
          </div>

          <textarea
            rows={5}
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="w-full p-4 bg-cream-50 rounded-2xl border border-cream-300 font-serif text-base text-ink-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
            placeholder="Your spoken transcript appears here..."
          />

          {/* AI Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-cream-200">
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
            >
              {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
              <span>Translate to English</span>
            </button>

            <button
              onClick={handlePolish}
              disabled={isPolishing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-colors"
            >
              {isPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Polish Reflection</span>
            </button>

            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
            >
              {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>Summarize & Tag</span>
            </button>
          </div>
        </div>

        {/* Translation Card (if generated) */}
        {englishTranslation && (
          <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-200 shadow-soft">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block mb-2">
              English Translation
            </span>
            <p className="font-serif text-ink-900 leading-relaxed italic">{englishTranslation}</p>
          </div>
        )}

        {/* Polished Entry Card (if generated) */}
        {polishedEntry && (
          <div className="bg-purple-50/60 rounded-3xl p-6 border border-purple-200 shadow-soft">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-800 block mb-2">
              Polished Journal Passage
            </span>
            <p className="font-serif text-ink-900 leading-relaxed">{polishedEntry}</p>
          </div>
        )}

        {/* Summary Card (if generated) */}
        {summary && (
          <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200 shadow-soft">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-2">
              Summary & Topics
            </span>
            <p className="text-sm text-ink-800 mb-3">{summary}</p>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topics.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Original Whisper Output (Read-only reference) */}
        <div className="bg-white/50 rounded-2xl p-4 border border-cream-200 text-xs text-ink-500">
          <span className="font-semibold block mb-1">Original Whisper Small Output (Preserved):</span>
          <span className="italic">"{originalTranscript || 'None'}"</span>
        </div>
      </div>
    </div>
  );
};
