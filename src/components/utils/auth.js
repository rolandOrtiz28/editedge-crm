// src/lib/auth.js
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

export const checkAuth = async () => {
  try {
    const url = `${API_BASE_URL}/api/auth/me`;
    console.log("checkAuth fetching:", url);
    const response = await fetch(url, {
      credentials: "include", // Include cookies for session
    });
    console.log("checkAuth response status:", response.status);
    console.log("checkAuth response URL:", response.url); // Log the final URL
    if (response.ok) {
      const data = await response.json();
      console.log("checkAuth response data:", data);
      return { isAuthenticated: true, user: data.user };
    }
    if (response.status === 401) {
      console.log("checkAuth: Unauthorized - session not found");
      return { isAuthenticated: false, user: null };
    }
    console.log("checkAuth: Unexpected status, returning unauthenticated");
    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error("Auth check failed:", error);
    return { isAuthenticated: false, user: null };
  }
};

export const login = async (email, password) => {
  try {
    const url = `${API_BASE_URL}/api/auth/login`;
    console.log("login fetching:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    console.log("login response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }
    const data = await response.json();
    console.log("login response data:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};