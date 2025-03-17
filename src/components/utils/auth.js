// src/lib/auth.js
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://crmapi.editedgemultimedia.com';

export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include', // Include cookies for session
    });
    if (response.ok) {
      const data = await response.json();
      return { isAuthenticated: true, user: data.user };
    }
    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { isAuthenticated: false, user: null };
  }
};