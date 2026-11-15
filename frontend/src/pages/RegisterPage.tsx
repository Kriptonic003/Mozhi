import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (Array.isArray(err.response?.data?.detail)) {
        const msg = err.response.data.detail
          .map((item: any) => `${item.loc?.[item.loc.length - 1] || 'Field'}: ${item.msg}`)
          .join(', ');
        setError(msg);
      } else if (typeof err.response?.data?.detail === 'string') {
        setError(err.response.data.detail);
      } else {
        setError('Registration failed. Please check your details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-center text-ink-900 mb-2">Create Your Diary</h2>
      <p className="text-center text-sm text-ink-500 mb-6 font-serif italic">
        Begin your Manglish voice journaling journey
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Username</label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. peeter"
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3 px-4 bg-lavender-600 hover:bg-lavender-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-soft flex items-center justify-center space-x-2 transition-all"
        >
          <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-ink-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-lavender-700 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
