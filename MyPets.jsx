import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContect";
import {
  getUserPets,
  deleteUserPet,
  ensureFullImageUrl,
} from "../services/petService";

export default function MyPets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch pets when component mounts
  useEffect(() => {
    const fetchPets = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await getUserPets();

        // Process the pets to ensure image URLs are complete
        const processedPets = response.pets.map((pet) => ({
          ...pet,
          imageUrl: pet.imageUrl ? ensureFullImageUrl(pet.imageUrl) : "",
        }));

        setPets(processedPets);
      } catch (err) {
        setError(err.message || "Failed to load your pets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, [user]);

  const handleDelete = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;

    try {
      setIsLoading(true);
      await deleteUserPet(petToDelete._id);

      setPets(pets.filter((p) => p._id !== petToDelete._id));
      setShowDeleteModal(false);
      setPetToDelete(null);

      setSuccessMessage("Pet deleted successfully");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center text-yellow-500 mb-4">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-medium">Authentication Required</h2>
        </div>
        <p className="text-gray-600 text-center mb-4">
          You need to be logged in to view your pets.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/login?redirect=/mypets")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && pets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto page-transition">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My Pets</h1>
        <p className="text-lg text-gray-600">Manage your registered pets</p>
        <Link
          to="/register-pet"
          className="inline-flex items-center justify-center px-6 py-3 mt-8 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105 gap-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Register New Pet
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {pets.length > 0 ? (
        <div className="space-y-6">
          {pets.map((pet, index) => (
            <div
              key={pet._id}
              className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slide-up 0.5s ease forwards",
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-xl bg-primary-100 flex items-center justify-center transform transition-all duration-300 hover:rotate-12 overflow-hidden">
                      {pet.imageUrl ? (
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="h-16 w-16 object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary-700">
                          {pet.name[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {pet.name}
                      </h3>
                      <p className="text-gray-500">
                        {pet.breed ? `${pet.type} · ${pet.breed}` : pet.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-pet/${pet._id}`}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-100"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(pet)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center text-gray-500">
                    <span className="font-medium mr-2">Age:</span>
                    <span>
                      {pet.age} {pet.age === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span className="font-medium mr-2">Gender:</span>
                    <span>{pet.gender}</span>
                  </div>
                </div>

                {pet.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-500">Description:</span>
                      <p className="mt-1 text-gray-700">{pet.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100 transform transition-all duration-500 hover:shadow-2xl">
          <div className="mx-auto w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <PlusCircleIcon className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Pets Registered
          </h3>
          <p className="text-gray-500 mb-8">
            You haven't registered any pets yet.
          </p>
          <Link
            to="/register-pet"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105 gap-2"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Register Your First Pet
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Delete Pet
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this pet? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isLoading}
                    className={`inline-flex w-full justify-center rounded-md ${
                      isLoading ? "bg-gray-400" : "bg-red-600 hover:bg-red-500"
                    } px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-colors duration-200`}
                  >
                    {isLoading ? "Processing..." : "Delete Pet"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isLoading}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  );
}
