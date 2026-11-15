import api from './api';
import { JournalEntry, JournalListResponse } from '../types';

export const journalService = {
  async getJournals(page = 1, limit = 20, search?: string): Promise<JournalListResponse> {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    const res = await api.get<JournalListResponse>('/journals', { params });
    return res.data;
  },

  async getJournalById(id: number): Promise<JournalEntry> {
    const res = await api.get<JournalEntry>(`/journals/${id}`);
    return res.data;
  },

  async createJournal(data: {
    title: string;
    audio_path?: string | null;
    original_transcript: string;
    edited_transcript: string;
    english_translation?: string | null;
    polished_entry?: string | null;
    summary?: string | null;
  }): Promise<JournalEntry> {
    const res = await api.post<JournalEntry>('/journals', data);
    return res.data;
  },

  async updateJournal(
    id: number,
    data: Partial<{
      title: string;
      edited_transcript: string;
      english_translation: string | null;
      polished_entry: string | null;
      summary: string | null;
    }>
  ): Promise<JournalEntry> {
    const res = await api.put<JournalEntry>(`/journals/${id}`, data);
    return res.data;
  },

  async deleteJournal(id: number): Promise<void> {
    await api.delete(`/journals/${id}`);
  },
};
