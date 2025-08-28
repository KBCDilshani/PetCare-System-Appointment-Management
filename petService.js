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

// Get all pets with optional filters
export const getPets = async (filters = {}) => {
  try {
    const { search, type, status, ageRange, includeUserPets } = filters;

    // Build query string
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (type) params.append("type", type);
    if (status) params.append("status", status);
    if (ageRange) params.append("ageRange", ageRange);
    if (includeUserPets) params.append("includeUserPets", includeUserPets);

    const response = await api.get(`/pets?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get pet by ID
export const getPetById = async (id) => {
  try {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get user's registered pets
export const getUserPets = async () => {
  try {
    const response = await api.get("/pets/mypets");
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Register a new pet (for users)
export const registerUserPet = async (petData) => {
  try {
    const response = await api.post("/pets/register", petData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update user's pet
export const updateUserPet = async (id, petData) => {
  try {
    const response = await api.put(`/pets/mypets/${id}`, petData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete user's pet
export const deleteUserPet = async (id) => {
  try {
    const response = await api.delete(`/pets/mypets/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Create new pet (admin only)
export const createPet = async (petData) => {
  try {
    const response = await api.post("/pets", petData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update existing pet (admin only)
export const updatePet = async (id, petData) => {
  try {
    const response = await api.put(`/pets/${id}`, petData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete pet (admin only)
export const deletePet = async (id) => {
  try {
    const response = await api.delete(`/pets/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get pet statistics for admin dashboard
export const getPetStats = async () => {
  try {
    const response = await api.get("/pets/stats");
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Upload pet image (admin only)
export const uploadPetImage = async (imageFile) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append("image", imageFile);

    // Use different headers for multipart form data
    const response = await axios.post(
      `${API_URL}/api/upload/pet-image`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw handleError(error);
  }
};

// Upload user pet image (for regular users)
export const uploadUserPetImage = async (imageFile) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append("image", imageFile);

    // Use different headers for multipart form data
    const response = await axios.post(
      `${API_URL}/api/upload/user-pet-image`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Helper to ensure image URL includes full backend path if it's a relative URL
// Enhanced version of ensureFullImageUrl in petService.js
export const ensureFullImageUrl = (imageUrl) => {
  // Handle empty URLs
  if (!imageUrl) return "/images/pet-placeholder.jpg";

  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Get the API_URL from env or default
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  
  // Avoid double slashes when combining
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const imgPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${imgPath}`;
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
  getPets,
  getPetById,
  getUserPets,
  registerUserPet,
  updateUserPet,
  deleteUserPet,
  createPet,
  updatePet,
  deletePet,
  getPetStats,
  uploadPetImage,
  uploadUserPetImage,
  ensureFullImageUrl,
};
