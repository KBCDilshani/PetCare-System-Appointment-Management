import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HeartIcon,
  PhotoIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { getPetById } from "../services/petService";
import { ensureFullImageUrl } from "../services/petService";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const response = await getPetById(id);

        // Ensure image URL is complete
        const petWithFullImageUrl = {
          ...response.pet,
          imageUrl: ensureFullImageUrl(response.pet.imageUrl),
        };

        setPet(petWithFullImageUrl);
        setError("");
      } catch (err) {
        console.error("Error fetching pet details:", err);
        setError("Failed to load pet details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // In a real app, you would save this to user's favorites in the backend
  };

  // Function to handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/300?text=No+Image";
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-50 text-green-700 ring-green-600/20";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
      case "Adopted":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20";
    }
  };

  // Navigate to adoption form with pet details
  const handleApplyToAdopt = () => {
    navigate("/adopt", {
      state: {
        petId: pet._id,
        petName: pet.name,
        petImage: pet.imageUrl,
      },
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pt-12 pb-24 px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Error state or pet not found
  if (error || !pet) {
    return (
      <div className="max-w-3xl mx-auto pt-12 pb-24 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
          <p className="text-lg text-gray-600 mb-8">
            {error || "Pet not found"}
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Pets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-12 pb-24 px-4">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-8"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to all pets
      </Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="md:flex">
          {/* Pet Image */}
          <div className="md:w-1/2 relative">
            {pet.imageUrl ? (
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-full h-80 md:h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-80 md:h-full flex items-center justify-center bg-gray-100">
                <PhotoIcon className="h-24 w-24 text-gray-300" />
              </div>
            )}

            <button
              onClick={handleFavoriteToggle}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            >
              {isFavorite ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-600 hover:text-red-500 transition-colors" />
              )}
            </button>
          </div>

          {/* Pet Details */}
          <div className="md:w-1/2 p-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset ${getStatusColor(
                  pet.status
                )}`}
              >
                {pet.status}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500">Breed</h2>
                <p className="mt-1 text-lg text-gray-900">
                  {pet.breed || "Mixed"}
                </p>
              </div>

              <div className="flex space-x-8">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Age</h2>
                  <p className="mt-1 text-lg text-gray-900">{pet.age} years</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Gender</h2>
                  <p className="mt-1 text-lg text-gray-900">{pet.gender}</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Type</h2>
                  <p className="mt-1 text-lg text-gray-900">{pet.type}</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500">
                  About {pet.name}
                </h2>
                <p className="mt-1 text-gray-600">
                  {pet.description || "No description available."}
                </p>
              </div>

              {/* Adopt button only if the pet is available */}
              {pet.status === "Available" && (
                <div className="pt-4">
                  <button
                    onClick={handleApplyToAdopt}
                    className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Apply to Adopt {pet.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
