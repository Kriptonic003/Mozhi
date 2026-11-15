import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Sparkles, BookHeart, Languages, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lavender-600 to-lavender-400 flex items-center justify-center text-white shadow-soft">
            <Sparkles className="w-5 h-5 text-cream-50" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-ink-900">MOZHI</span>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-lavender-600 hover:bg-lavender-700 text-white font-medium text-sm shadow-soft transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-ink-700 hover:text-ink-900 px-3 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-lavender-600 hover:bg-lavender-700 text-white font-medium text-sm shadow-soft transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-lavender-100/80 border border-lavender-300 text-lavender-800 text-xs font-semibold mb-8">
          <Mic className="w-3.5 h-3.5 text-lavender-600" />
          <span>AI-Powered Manglish Speech Recognition</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-ink-900 tracking-tight leading-tight">
          Your voice. Your words. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender-700 via-lavender-600 to-lavender-500 italic">
            Your story.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink-600 max-w-2xl mx-auto font-serif leading-relaxed">
          Record your daily reflections in natural Manglish. Our fine-tuned Whisper model converts your code-switched thoughts into Romanized text, preserving every emotion.
        </p>

        {/* Spoken Manglish Example Card */}
        <div className="mt-10 max-w-xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-cream-300 shadow-soft text-left">
          <div className="flex items-center space-x-2 text-xs font-semibold text-lavender-700 uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Example Voice Note</span>
          </div>
          <p className="font-serif text-lg text-ink-900 italic leading-relaxed">
            "Njan innu college-il poyi, pinne friends-ine kandu. Exam easy aayirunno atho tough aano ennu ariyilla, pakshe we had a great time!"
          </p>
          <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-xs text-ink-500">
            <span>Spoken: Malayalam + English</span>
            <span className="font-medium text-lavender-700">Output: Romanized Manglish</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/record' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold shadow-soft hover:shadow-soft-lg transition-all"
          >
            <Mic className="w-5 h-5" />
            <span>Start Voice Journaling</span>
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-cream-50 text-ink-800 font-semibold border border-cream-300 shadow-soft transition-all"
          >
            <span>Explore Your Reflections</span>
          </Link>
        </div>

        {/* Key Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/60 p-6 rounded-2xl border border-cream-300">
            <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-700 mb-4">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink-900 mb-2">Fine-Tuned Whisper</h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              Trained on code-switched Malayalam-English speech to transcribe Romanized Manglish accurately.
            </p>
          </div>

          <div className="bg-white/60 p-6 rounded-2xl border border-cream-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink-900 mb-2">English Translation</h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              Optionally translate your Manglish reflections into clear English while always keeping your original voice.
            </p>
          </div>

          <div className="bg-white/60 p-6 rounded-2xl border border-cream-300">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 mb-4">
              <BookHeart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-ink-900 mb-2">Polished Diaries</h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              Turn casual voice memos into heartfelt, evocative personal journal passages with intelligent AI refinement.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-cream-300/60 text-center text-xs text-ink-500">
        <p>MOZHI — AI Manglish Voice Journaling. Built for natural speech and authentic thoughts.</p>
      </footer>
    </div>
  );
};
