/**
 * Audio encoding and resampling utility using the Web Audio API.
 * Converts browser-recorded audio (WebM/Opus) into standard 16 kHz, 16-bit mono PCM WAV.
 * This eliminates any server-side FFmpeg dependency.
 */

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Extract mono channel data
  let channelData: Float32Array;
  if (buffer.numberOfChannels === 1) {
    channelData = buffer.getChannelData(0);
  } else {
    // Downmix multi-channel to mono
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    channelData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      channelData[i] = (left[i] + right[i]) / 2;
    }
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = channelData.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF identifier
  writeString(0, 'RIFF');
  // file length minus RIFF identifier and length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Write PCM 16-bit samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export async function convertBlobTo16kHzWav(rawBlob: Blob): Promise<Blob> {
  const arrayBuffer = await rawBlob.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Resample to 16,000 Hz mono using OfflineAudioContext
  const targetSampleRate = 16000;
  const numSamples = Math.ceil(decodedBuffer.duration * targetSampleRate);
  const offlineCtx = new OfflineAudioContext(1, Math.max(1, numSamples), targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();

  if (audioContext.state !== 'closed') {
    audioContext.close().catch(() => {});
  }

  return audioBufferToWav(renderedBuffer);
}
