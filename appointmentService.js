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

// Create appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/appointments", appointmentData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get all appointments (admin only)
// Get all appointments (admin only)
export const getAppointments = async (filters = {}) => {
  try {
    const { search, status, petId, date, page, limit, serviceType } = filters;

    // Build query string
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (petId) params.append("petId", petId);
    if (date) params.append("date", date);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (serviceType) params.append("serviceType", serviceType);

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get user's appointments
export const getUserAppointments = async () => {
  try {
    const response = await api.get("/appointments/user");
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get appointment by ID
export const getAppointmentById = async (id) => {
  try {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update appointment status (admin only)
export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete appointment
export const deleteAppointment = async (id) => {
  try {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get booked appointment slots
export const getBookedSlots = async (date) => {
  try {
    const url = date
      ? `/appointments/booked-slots?date=${date}`
      : "/appointments/booked-slots";
    const response = await api.get(url);
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
  createAppointment,
  getAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getBookedSlots,
};
