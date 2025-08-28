import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Create axios instance with credentials
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Login user
export const login = async (email, password, remember = false) => {
  try {
    const response = await api.post("/users/login", {
      email,
      password,
      rememberMe: remember,
    });

    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Logout user
export const logout = async () => {
  try {
    await api.get("/users/logout");
    localStorage.removeItem("user");
    return { success: true };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// Get initial redirect path based on user role
export const getInitialRedirectPath = () => {
  const user = getCurrentUser();
  if (!user) return "/login";
  return user.role === "admin" ? "/admin" : "/";
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};

// Check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === "admin";
};

// Handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    if (error.response.data && error.response.data.message) {
      return new Error(error.response.data.message);
    } else if (error.response.data && error.response.data.errors) {
      // Validation errors
      const messages = error.response.data.errors
        .map((e) => e.message || e.field)
        .join(", ");
      return new Error(messages);
    }
    return new Error(`Server error: ${error.response.status}`);
  } else if (error.request) {
    // The request was made but no response was received
    return new Error(
      "No response from server. Please check your internet connection."
    );
  } else {
    // Something else went wrong
    return error;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
};
