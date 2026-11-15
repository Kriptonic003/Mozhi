import React, { useEffect, useState } from 'react';
import { User, Cpu, Shield, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealthStatus(res.data);
      } catch (err) {
        console.error('Failed to get health status', err);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink-900">Settings & About</h1>
        <p className="text-xs text-ink-500 font-serif italic mt-0.5">
          Profile information, machine learning runtime, and system status
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white/90 rounded-3xl p-6 border border-cream-300 shadow-soft">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-lavender-100 text-lavender-700 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink-900">User Profile</h2>
            <p className="text-xs text-ink-500">Your account details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
          <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-200">
            <span className="text-xs text-ink-500 block">Username</span>
            <span className="font-medium text-ink-900">{user?.username}</span>
          </div>
          <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-200">
            <span className="text-xs text-ink-500 block">Email Address</span>
            <span className="font-medium text-ink-900">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Model & ML Architecture Card */}
      <div className="bg-white/90 rounded-3xl p-6 border border-cream-300 shadow-soft">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink-900">Speech Recognition Engine</h2>
            <p className="text-xs text-ink-500">Fine-tuned Whisper Small architecture</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-ink-700">
          <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-cream-200">
            <span className="font-medium">Model Architecture:</span>
            <span className="font-mono text-lavender-800">openai/whisper-small (Multilingual)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-cream-200">
            <span className="font-medium">Target Script / Orthography:</span>
            <span className="font-semibold text-emerald-800">Romanized Manglish (Latin)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-cream-200">
            <span className="font-medium">Sampling Rate:</span>
            <span className="font-mono">16,000 Hz Mono</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-cream-200">
            <span className="font-medium">Inference Device:</span>
            <span className="uppercase font-semibold">{healthStatus?.device || 'CPU'}</span>
          </div>
        </div>
      </div>

      {/* Privacy & Ethics */}
      <div className="bg-white/90 rounded-3xl p-6 border border-cream-300 shadow-soft">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink-900">Privacy & Data Isolation</h2>
            <p className="text-xs text-ink-500">Your journal data belongs to you alone</p>
          </div>
        </div>

        <p className="text-xs text-ink-600 leading-relaxed">
          In strict compliance with research ethics, personal journal voice recordings and transcripts recorded in this app are stored in your private database and are <strong>never</strong> used for model retraining without explicit, informed consent.
        </p>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-ink-400 py-2 flex items-center justify-center space-x-1">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
        <span>for Manglish speakers</span>
      </div>
    </div>
  );
};
