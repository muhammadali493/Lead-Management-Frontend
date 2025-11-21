const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  leads: `${API_BASE_URL}/leads`,
  leadsExport: `${API_BASE_URL}/leads/export`,
  upload: `${API_BASE_URL}/upload`,
};

export default API_BASE_URL;