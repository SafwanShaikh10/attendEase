/**
 * Generates an authenticated URL for viewing files (letters/proofs)
 * including a JWT token in the query string for visual elements like iframes/imgs.
 * @param {string} path - The relative path stored in the DB (e.g. /uploads/letters/...)
 * @returns {string} - The full authenticated URL
 */
export const getFileUrl = (path) => {
  if (!path) return '';
  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  // Ensure we don't double the '/api' if it's already there or handle as suggested
  // The plan said: `${VITE_API_URL}/api${path}?token=${token}`
  // Since path in DB is currently '/uploads/letters/...', this results in '/api/uploads/letters/...'
  return `${baseUrl}/api${path}?token=${token}`;
};
