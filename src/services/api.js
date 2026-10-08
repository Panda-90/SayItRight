import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const analyzeMessage = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/api/analyze`, data);
  return response.data;
};
