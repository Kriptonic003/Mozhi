import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mic, BookOpen, Clock, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BookOpen },
    { name: 'Record', path: '/record', icon: Mic },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-cream-300/60 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lavender-600 to-lavender-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-cream-50" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-ink-900">MOZHI</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-lavender-600 bg-lavender-50 px-2 py-0.5 rounded-full border border-lavender-200">
              Manglish AI
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-lavender-100/70 text-lavender-700 font-semibold'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-cream-200/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-lavender-600' : 'text-ink-500'}`} />
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            );
          })}

          <div className="h-5 w-px bg-cream-300 mx-2" />

          {/* User profile & Logout */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-ink-600 hidden lg:inline">
              Hi, <strong className="font-medium text-ink-900">{user?.username}</strong>
            </span>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
