import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Play, Pause, Upload, RotateCcw, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { transcriptionService } from '../services/transcriptionService';

export const RecordPage: React.FC = () => {
  const {
    isRecording,
    isPaused,
    recordingDuration,
    audioBlob,
    audioUrl,
    volumeLevel,
    error: micError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadedPreviewUrl(URL.createObjectURL(file));
      setTranscribeError(null);
    }
  };

  const handleSubmitAudio = async () => {
    const targetAudio = activeTab === 'record' ? audioBlob : uploadedFile;
    if (!targetAudio) {
      setTranscribeError('Please record voice or upload an audio file first.');
      return;
    }

    setIsTranscribing(true);
    setTranscribeError(null);

    try {
      const filename = activeTab === 'record' ? 'recording.wav' : (uploadedFile?.name || 'audio.wav');
      const response = await transcriptionService.transcribeAudio(targetAudio, filename);

      // Navigate to transcript editor with state
      navigate('/editor', {
        state: {
          transcriptionData: response,
          audioBlobUrl: activeTab === 'record' ? audioUrl : uploadedPreviewUrl,
        },
      });
    } catch (err: any) {
      console.error('Transcription error:', err);
      setTranscribeError(
        err.response?.data?.detail || 'Transcription failed. Please verify that the Whisper model service is running.'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-ink-900">Record Your Thoughts</h1>
        <p className="text-sm text-ink-500 font-serif italic mt-1">
          Speak in natural Manglish. The model will transcribe your words into Romanized text.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-cream-200/80 p-1 rounded-2xl flex space-x-1 border border-cream-300">
          <button
            onClick={() => {
              setActiveTab('record');
              setTranscribeError(null);
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'record'
                ? 'bg-white text-lavender-700 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Microphone</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('upload');
              setTranscribeError(null);
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-lavender-700 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio</span>
          </button>
        </div>
      </div>

      {/* Errors */}
      {(micError || transcribeError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Note:</strong>
            <span>{micError || transcribeError}</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-cream-300 shadow-soft text-center">
        {activeTab === 'record' ? (
          <div className="space-y-6">
            {/* Visualizer / Waveform */}
            <div className="py-4">
              <AudioVisualizer isRecording={isRecording && !isPaused} volumeLevel={volumeLevel} />
              <div className="text-3xl font-mono font-medium text-ink-800 mt-4 tracking-wider">
                {formatTimer(recordingDuration)}
              </div>
              <div className="text-xs text-ink-500 mt-1">
                {isRecording
                  ? isPaused
                    ? 'Recording Paused'
                    : 'Listening to your voice...'
                  : audioBlob
                  ? 'Recording Complete'
                  : 'Ready when you are'}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-lavender-600 hover:bg-lavender-700 text-white flex items-center justify-center shadow-soft hover:shadow-soft-lg hover:scale-105 transition-all group"
                  title="Start Recording"
                >
                  <Mic className="w-8 h-8 text-white group-hover:animate-pulse" />
                </button>
              )}

              {isRecording && (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeRecording}
                      className="w-14 h-14 rounded-full bg-lavender-100 hover:bg-lavender-200 text-lavender-800 flex items-center justify-center transition-all"
                      title="Resume"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="w-14 h-14 rounded-full bg-cream-200 hover:bg-cream-300 text-ink-800 flex items-center justify-center transition-all"
                      title="Pause"
                    >
                      <Pause className="w-6 h-6" />
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-soft hover:shadow-soft-lg hover:scale-105 transition-all"
                    title="Stop Recording"
                  >
                    <Square className="w-7 h-7 fill-current" />
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <button
                  onClick={resetRecording}
                  className="w-12 h-12 rounded-full bg-cream-200 hover:bg-cream-300 text-ink-700 flex items-center justify-center transition-all"
                  title="Record Again"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Audio Preview */}
            {audioUrl && !isRecording && (
              <div className="pt-4 border-t border-cream-200">
                <span className="text-xs text-ink-500 block mb-2 font-medium">Listen to your preview</span>
                <audio controls src={audioUrl} className="w-full max-w-md mx-auto" />
              </div>
            )}
          </div>
        ) : (
          /* File Upload View */
          <div className="space-y-6 py-6">
            <input
              type="file"
              ref={fileInputRef}
              accept=".wav,.mp3,.m4a,.webm,.ogg,.flac"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-lavender-300 hover:border-lavender-500 bg-lavender-50/40 hover:bg-lavender-50/70 rounded-3xl p-8 cursor-pointer transition-colors max-w-md mx-auto"
            >
              <div className="w-14 h-14 rounded-2xl bg-lavender-100 text-lavender-700 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-ink-900 mb-1">
                {uploadedFile ? uploadedFile.name : 'Select or drop your audio file'}
              </h4>
              <p className="text-xs text-ink-500">
                Supports WAV, MP3, M4A, WebM (up to 25MB)
              </p>
            </div>

            {uploadedPreviewUrl && (
              <div className="pt-2">
                <span className="text-xs text-ink-500 block mb-2 font-medium">Audio Preview</span>
                <audio controls src={uploadedPreviewUrl} className="w-full max-w-md mx-auto" />
              </div>
            )}
          </div>
        )}

        {/* Submit to Whisper button */}
        {(audioBlob || uploadedFile) && !isRecording && (
          <div className="mt-8 pt-6 border-t border-cream-200">
            <button
              onClick={handleSubmitAudio}
              disabled={isTranscribing}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-lavender-600 hover:bg-lavender-700 disabled:opacity-50 text-white font-semibold shadow-soft hover:shadow-soft-lg transition-all"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Transcribing with Whisper...</span>
                </>
              ) : (
                <>
                  <span>Transcribe into Romanized Manglish</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
