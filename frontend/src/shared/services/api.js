import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const readingAPI = {
  submitReading: async (data) => {
    const response = await api.post('/api/reading', data);
    return response.data;
  },

  getParticipantHistory: async (participantId) => {
    const response = await api.get(`/api/participant/${participantId}/history`);
    return response.data;
  }
};

export default api;