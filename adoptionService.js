import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Create axios instance with credentials
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Submit adoption application
export const submitAdoptionApplication = async (applicationData) => {
  try {
    const response = await api.post("/adoptions", applicationData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get all adoption applications (admin only)
export const getAdoptionApplications = async (filters = {}) => {
  try {
    const { search, status, petId, page, limit } = filters;

    // Build query string
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (petId) params.append("petId", petId);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/adoptions?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get adoption application by ID (admin only)
export const getAdoptionApplicationById = async (id) => {
  try {
    const response = await api.get(`/adoptions/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update adoption application status (admin only)
export const updateAdoptionStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/adoptions/${id}`, statusData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get user's adoption applications
export const getUserApplications = async () => {
  try {
    const response = await api.get("/adoptions/user");
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete adoption application (admin only)
export const deleteAdoptionApplication = async (id) => {
  try {
    const response = await api.delete(`/adoptions/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Handle API errors
const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    if (error.response.data && error.response.data.message) {
      return new Error(error.response.data.message);
    } else if (error.response.data && error.response.data.errors) {
      // Validation errors
      const errorMessages = error.response.data.errors
        .map((e) => e.message)
        .join(", ");
      return new Error(errorMessages);
    }
    return new Error(`Server error: ${error.response.status}`);
  } else if (error.request) {
    // No response from server
    return new Error(
      "No response from server. Please check your internet connection."
    );
  } else {
    // Other errors
    return error;
  }
};

export default {
  submitAdoptionApplication,
  getAdoptionApplications,
  getAdoptionApplicationById,
  updateAdoptionStatus,
  getUserApplications,
  deleteAdoptionApplication,
};
