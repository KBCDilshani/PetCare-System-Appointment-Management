import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/outline";
import {
  getPetById,
  createPet,
  updatePet,
  uploadPetImage,
} from "../services/petService";
import { useAuth } from "../context/AuthContect";

export default function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const isEditing = Boolean(id);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Dog",
    breed: "",
    gender: "Male",
    age: "",
    description: "",
    imageUrl: "",
    status: "Available",
  });

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated() || !isAdmin())) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, navigate, isLoading]);

  // Load pet data when editing
  useEffect(() => {
    const fetchPet = async () => {
      if (isEditing) {
        try {
          const { pet } = await getPetById(id);
          setFormData({
            name: pet.name,
            type: pet.type,
            breed: pet.breed || "",
            gender: pet.gender,
            age: pet.age,
            description: pet.description || "",
            imageUrl: pet.imageUrl || "",
            status: pet.status,
          });
          setImagePreview(pet.imageUrl || "");
        } catch (err) {
          setError("Failed to load pet data. Please try again.");
          console.error("Error fetching pet:", err);
        }
      }
    };

    fetchPet();
  }, [id, isEditing]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

// Modify the handleSubmit function in PetForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (parseFloat(formData.age) <= 0) {
    setError("Pet age must be greater than zero.");
    return;
  }
  
  setIsSubmitting(true);
  setError("");
  
  try {
    // If a new image is selected, upload it first
    let imageUrl = formData.imageUrl;
    if (selectedFile) {
      try {
        const uploadResult = await uploadPetImage(selectedFile);
        console.log("Upload response:", uploadResult);
        
        // Check for either filePath OR imageUrl property
        const uploadedPath = uploadResult?.filePath || uploadResult?.imageUrl;
        
        if (uploadedPath) {
          // Make sure path doesn't start with a slash if BACKEND_URL already ends with one
          const formattedPath = uploadedPath.startsWith('/') 
            ? uploadedPath 
            : `/${uploadedPath}`;
          imageUrl = import.meta.env.VITE_BACKEND_URL + formattedPath;
          
          console.log("Constructed image URL:", imageUrl);
        } else {
          console.error("Image upload succeeded but returned invalid path:", uploadResult);
          setError("Image upload failed. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        setError("Image upload failed: " + (uploadError.message || "Unknown error"));
        setIsSubmitting(false);
        return;
      }
    }
    
    const petData = {
      ...formData,
      imageUrl,
    };
    
    if (isEditing) {
      await updatePet(id, petData);
    } else {
      await createPet(petData);
    }
    
    navigate("/admin/pets");
  } catch (err) {
    setError(err.message || "Failed to save pet. Please try again.");
    console.error("Error saving pet:", err);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {isEditing ? "Edit Pet Details" : "Add New Pet"}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEditing
            ? "Update the pet's information in our database"
            : "Add a new pet to the adoption listing"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 space-y-8">
          {/* Pet Image */}
          <div className="relative">
            <input
              type="file"
              id="pet-image"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <label htmlFor="pet-image" className="block cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-gray-900/0 rounded-lg pointer-events-none" />
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Pet preview"
                    className="h-64 w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                    onError={() => setImagePreview("")}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm">Click to change image</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-16 transition-colors hover:border-gray-400">
                  <div className="text-center">
                    <PhotoIcon
                      className="mx-auto h-16 w-16 text-gray-400"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      Click to upload a photo
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                Pet Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                placeholder="Enter pet's name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                placeholder="Enter breed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                Age (years)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.age}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value > 0) {  // Only update if value is positive
                    setFormData({ ...formData, age: e.target.value });
                  } else if (e.target.value === "") {  // Allow empty string for UX
                    setFormData({ ...formData, age: "" });
                  }
                }}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                placeholder="Enter age"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
              >
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Adopted">Adopted</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="4"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all"
                placeholder="Describe the pet's personality, habits, and any special needs..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/pets")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
              ? "Update Pet"
              : "Add Pet"}
          </button>
        </div>
      </form>
    </div>
  );
}
