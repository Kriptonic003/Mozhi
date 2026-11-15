import api from './api';
import { TranslateResponse, PolishResponse, SummarizeResponse } from '../types';

export const aiService = {
  async translate(manglishText: string): Promise<TranslateResponse> {
    const res = await api.post<TranslateResponse>('/ai/translate', { manglish_text: manglishText });
    return res.data;
  },

  async polish(manglishText: string, tone = 'reflective'): Promise<PolishResponse> {
    const res = await api.post<PolishResponse>('/ai/polish', {
      manglish_text: manglishText,
      tone,
    });
    return res.data;
  },

  async summarize(text: string): Promise<SummarizeResponse> {
    const res = await api.post<SummarizeResponse>('/ai/summarize', { text });
    return res.data;
  },
};
