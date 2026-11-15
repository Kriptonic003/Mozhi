import api from './api';
import { TranscriptionResponse } from '../types';

export const transcriptionService = {
  async transcribeAudio(audioBlobOrFile: Blob | File, filename = 'recording.wav'): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlobOrFile, filename);

    const res = await api.post<TranscriptionResponse>('/transcription/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
