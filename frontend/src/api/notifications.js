import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications`, getAuthHeader());
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.patch(`${API_URL}/notifications/read/${id}`, {}, getAuthHeader());
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, getAuthHeader());
  return response.data;
};
