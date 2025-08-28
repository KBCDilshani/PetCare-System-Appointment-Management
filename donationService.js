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

// Create a new donation
export const createDonation = async (donationData) => {
  try {
    const response = await api.post("/donations", donationData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get all donations (admin only)
export const getAllDonations = async (filters = {}) => {
  try {
    const {
      search,
      purpose,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      page,
      limit,
    } = filters;

    // Build query string
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (purpose) params.append("purpose", purpose);
    if (minAmount) params.append("minAmount", minAmount);
    if (maxAmount) params.append("maxAmount", maxAmount);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/donations?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get donation by ID (admin only)
export const getDonationById = async (id) => {
  try {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get donation summary statistics (admin only)
export const getDonationsSummary = async () => {
  try {
    const response = await api.get("/donations/summary");
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update donation (admin only)
// Update donation (admin only)
export const updateDonation = async (id, updateData) => {
  try {
    // Use PUT instead of PATCH if your server has CORS issues with PATCH
    const response = await api.put(`/donations/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};
// Get user's own donations
export const getUserDonations = async () => {
  try {
    const response = await api.get("/donations/user");
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Helper function to convert date filters from frontend to API format
export const getDateFilterParams = (dateRange) => {
  const now = new Date();
  let startDate = null;

  switch (dateRange) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      return { startDate: null, endDate: null };
  }

  return {
    startDate: startDate ? startDate.toISOString() : null,
    endDate: new Date().toISOString(),
  };
};

// Helper function to convert amount range filters from frontend to API format
export const getAmountFilterParams = (amountRange) => {
  switch (amountRange) {
    case "0-1000":
      return { minAmount: 0, maxAmount: 1000 };
    case "1001-5000":
      return { minAmount: 1001, maxAmount: 5000 };
    case "5001+":
      return { minAmount: 5001, maxAmount: null };
    default:
      return { minAmount: null, maxAmount: null };
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
  createDonation,
  getAllDonations,
  getDonationById,
  getDonationsSummary,
  updateDonation,
  getUserDonations,
  getDateFilterParams,
  getAmountFilterParams,
};
