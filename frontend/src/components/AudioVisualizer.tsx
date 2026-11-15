import React from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  volumeLevel: number; // 0 to 100
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, volumeLevel }) => {
  // Generate 24 animated wave bars
  const bars = Array.from({ length: 24 });

  return (
    <div className="flex items-center justify-center space-x-1.5 h-16 w-full max-w-sm mx-auto px-4">
      {bars.map((_, index) => {
        // Height factor varies with bar position and dynamic volume
        const centerFactor = 1 - Math.abs(index - 12) / 12;
        const dynamicHeight = isRecording
          ? Math.max(8, Math.min(60, volumeLevel * 0.8 * centerFactor + Math.random() * 12))
          : 6;

        return (
          <div
            key={index}
            className={`w-1.5 rounded-full transition-all duration-75 ${
              isRecording ? 'bg-gradient-to-t from-lavender-500 to-lavender-400' : 'bg-cream-300'
            }`}
            style={{
              height: `${dynamicHeight}px`,
            }}
          />
        );
      })}
    </div>
  );
};
