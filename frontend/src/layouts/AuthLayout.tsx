import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-lavender-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lavender-600 to-lavender-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-cream-50" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight text-ink-900">MOZHI</span>
        </Link>
        <p className="mt-2 text-sm text-ink-600 font-serif italic">
          Your voice. Your words. Your story.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-md py-8 px-6 shadow-soft sm:rounded-3xl sm:px-10 border border-cream-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
