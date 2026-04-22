import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getPendingRequests = async (role) => {
  let endpoint = '/requests/pending';
  if (role === 'YEAR_COORD') endpoint = '/requests/year-coord/pending';
  if (role === 'CHAIRPERSON') endpoint = '/chairperson/pending';
  
  const response = await axios.get(`${API_URL}${endpoint}`, getAuthHeader());
  return response.data;
};

export const processRequest = async (role, id, action, data = {}) => {
  let endpoint = '';
  
  if (role === 'CLASS_COORD') {
    endpoint = `/requests/${id}/${action}`; // approve, reject
  } else if (role === 'YEAR_COORD') {
    endpoint = `/requests/${id}/year-coord/${action === 'resubmit' ? 'request-resubmission' : action}`;
  } else if (role === 'CHAIRPERSON') {
    endpoint = `/chairperson/${action === 'resubmit' ? 'request-resubmission' : action}/${id}`;
  }

  const response = await axios.post(`${API_URL}${endpoint}`, data, getAuthHeader());
  return response.data;
};

export const getCoordinatorStats = async () => {
  const response = await axios.get(`${API_URL}/requests/coordinator/stats`, getAuthHeader());
  return response.data;
};

export const downloadCoordinatorExcel = async () => {
  const response = await axios.get(`${API_URL}/requests/coordinator/excel`, {
    ...getAuthHeader(),
    responseType: 'blob'
  });
  
  // Create a blob URL and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Extract filename from Content-Disposition if present
  let filename = 'Approved_Records.xlsx';
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) { 
      filename = matches[1].replace(/['"]/g, '');
    }
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
export const getYearReports = async () => {
  const response = await axios.get(`${API_URL}/requests/year-coord/reports`, getAuthHeader());
  return response.data;
};
