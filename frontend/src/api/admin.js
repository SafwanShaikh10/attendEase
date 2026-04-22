import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getAdminReports = async () => {
  const [overview, stale, usage, rates] = await Promise.all([
    axios.get(`${API_URL}/admin/reports/overview`, getAuthHeader()),
    axios.get(`${API_URL}/admin/reports/pending-stale`, getAuthHeader()),
    axios.get(`${API_URL}/admin/reports/high-usage`, getAuthHeader()),
    axios.get(`${API_URL}/admin/reports/approval-rates`, getAuthHeader())
  ]);
  
  return {
    overview: overview.data,
    stale: stale.data,
    usage: usage.data,
    rates: rates.data
  };
};

export const getSubstitutes = async () => {
  const response = await axios.get(`${API_URL}/admin/substitutes`, getAuthHeader());
  return response.data;
};

export const createSubstitute = async (data) => {
  const response = await axios.post(`${API_URL}/admin/substitutes`, data, getAuthHeader());
  return response.data;
};

export const deactivateSubstitute = async (id) => {
  const response = await axios.patch(`${API_URL}/admin/substitutes/${id}/deactivate`, {}, getAuthHeader());
  return response.data;
};

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/admin/users`, getAuthHeader());
  return response.data;
};
