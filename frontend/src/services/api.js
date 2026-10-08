import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const analyzeMessage = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, data);
    return response.data;
  } catch (error) {
    // Only log if we are in development mode, or we can just keep it but avoid exposing sensitive data
    throw error;
  }
};
