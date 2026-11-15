import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col selection:bg-lavender-200 selection:text-lavender-800">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-cream-300/40 text-center text-xs text-ink-500">
        MOZHI — Your voice. Your words. Your story.
      </footer>
    </div>
  );
};
