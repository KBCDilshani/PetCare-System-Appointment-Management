import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContect";
import {
  getPetById,
  updateUserPet,
  uploadUserPetImage,
} from "../services/petService";

export default function EditPet() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    type: "Dog",
    breed: "",
    gender: "Male",
    age: "",
    description: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      if (!id || !user) return;

      try {
        setIsLoadingPet(true);
        const response = await getPetById(id);
        const pet = response.pet;

        // Check if pet belongs to the current user
        if (
          pet.owner !== user._id &&
          pet.owner.toString &&
          pet.owner.toString() !== user._id
        ) {
          setError("You don't have permission to edit this pet");
          return;
        }

        // Set form data
        setFormData({
          name: pet.name || "",
          type: pet.type || "Dog",
          breed: pet.breed || "",
          gender: pet.gender || "Male",
          age: pet.age || "",
          description: pet.description || "",
          imageUrl: pet.imageUrl || "",
        });

        // Set image preview if there's an image
        if (pet.imageUrl) {
          setImagePreview(pet.imageUrl);
        }
      } catch (err) {
        console.error("Error fetching pet:", err);
        setError(
          err.message || "Failed to load pet information. Please try again."
        );
      } finally {
        setIsLoadingPet(false);
      }
    };

    fetchPet();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.type ||
        !formData.gender ||
        !formData.age
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Upload image if selected
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        try {
          const uploadResponse = await uploadUserPetImage(imageFile);
          if (uploadResponse && uploadResponse.imageUrl) {
            finalImageUrl = uploadResponse.imageUrl;
          } else {
            throw new Error("Image upload failed");
          }
        } catch (uploadErr) {
          console.error("Image upload error:", uploadErr);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // Update pet with final data
      await updateUserPet(id, {
        ...formData,
        imageUrl: finalImageUrl,
      });

      // Show success message and redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/mypets");
      }, 2000);
    } catch (err) {
      console.error("Error updating pet:", err);
      setError(err.message || "Failed to update pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center text-yellow-500 mb-4">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-medium">Authentication Required</h2>
        </div>
        <p className="text-gray-600 text-center mb-4">
          You need to be logged in to edit your pet.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate(`/login?redirect=/edit-pet/${id}`)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingPet) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto page-transition">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Edit Pet Information
        </h1>
        <p className="text-lg text-gray-600">Update your pet's details</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Name */}
            <div className="col-span-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pet Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Pet Type */}
            <div className="col-span-1">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pet Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Breed */}
            <div className="col-span-1">
              <label
                htmlFor="breed"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Breed
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Gender */}
            <div className="col-span-1">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Age */}
            <div className="col-span-1">
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Age (years) *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="30"
                value={formData.age}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Share some details about your pet..."
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Image
              </label>
              <div className="flex items-center space-x-6">
                <div
                  className={`flex justify-center items-center w-40 h-40 bg-gray-100 rounded-lg overflow-hidden ${
                    !imagePreview
                      ? "border-2 border-dashed border-gray-300"
                      : ""
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Pet preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="imageUpload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Change Image
                    <input
                      id="imageUpload"
                      name="imageUpload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/mypets")}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`
              px-6 py-2 text-sm font-medium text-white rounded-lg
              transition-all duration-300 transform
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700 hover:scale-105"
              }
            `}
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center transform animate-bounce-slow">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Pet Updated!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your pet's information has been updated successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
