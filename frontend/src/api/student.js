import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getStudentDashboard = async () => {
  const response = await axios.get(`${API_URL}/requests/me`, getAuthHeader());
  return response.data; // { requests: [], balances: [] }
};

export const cancelRequest = async (id) => {
  const response = await axios.patch(`${API_URL}/requests/${id}/cancel`, {}, getAuthHeader());
  return response.data;
};

export const getRequestDetails = async (id) => {
  const response = await axios.get(`${API_URL}/requests/${id}`, getAuthHeader());
  return response.data;
};

export const uploadProof = async (file) => {
  const formData = new FormData();
  formData.append('proof', file);
  const response = await axios.post(`${API_URL}/requests/upload-proof`, formData, {
    headers: { 
      ...getAuthHeader().headers,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data; // { fileUrl }
};

export const submitLeaveRequest = async (data) => {
  const response = await axios.post(`${API_URL}/requests/submit`, data, getAuthHeader());
  return response.data;
};
