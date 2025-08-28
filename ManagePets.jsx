import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getPets, deletePet } from "../../services/petService";
import { useAuth } from "../../context/AuthContect";
import PetImage from '../../components/PetImage';

export default function ManagePets() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState({});

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    ageRange: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated() || !isAdmin())) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, navigate, isLoading]);

  // Fetch pets on component mount and when filters change
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const filterParams = {
          search,
          ...filters,
        };
        const { pets } = await getPets(filterParams);

        // Process pet data and fix image URL issues
        const processedPets = pets.map((pet) => {
          // Check for malformed URLs (containing "undefined")
          let validImageUrl = pet.imageUrl;
          if (!validImageUrl || validImageUrl.includes("undefined")) {
            validImageUrl = ""; // Clear invalid URLs
          }
          
          return {
            ...pet,
            imageUrl: validImageUrl,
          };
        });

        setPets(processedPets);
        setError("");
      } catch (err) {
        console.error("Error fetching pets:", err);
        setError("Failed to load pets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [search, filters]);

  const handleDelete = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePet(petToDelete._id);
      setPets(pets.filter((p) => p._id !== petToDelete._id));
      setShowDeleteModal(false);
      setPetToDelete(null);
    } catch (err) {
      console.error("Error deleting pet:", err);
      setError("Failed to delete pet. Please try again.");
    }
  };

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

  // Function to handle image error
  const handleImageError = (petId) => {
    setImageError(prev => ({ ...prev, [petId]: true }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Pets
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track all pets in the adoption system
            </p>
          </div>
          <Link
            to="/admin/pet"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all gap-2"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add New Pet
          </Link>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Types</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Bird">Birds</option>
              <option value="Other">Others</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Adopted">Adopted</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filters.ageRange}
              onChange={(e) =>
                setFilters({ ...filters, ageRange: e.target.value })
              }
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Ages</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6+">6+ years</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Pet
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Details
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pets.map((pet) => (
                    <tr key={pet._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            {pet.imageUrl && !imageError[pet._id] ? (
                              <PetImage 
  src={pet.imageUrl} 
  alt={pet.name} 
  className="..."
/>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <PhotoIcon className="h-8 w-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h2 className="font-medium text-gray-900">
                              {pet.name}
                            </h2>
                            <p className="text-gray-500">{pet.breed}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{pet.type}</p>
                          <p className="text-gray-500">
                            {pet.age} years • {pet.gender}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${getStatusColor(
                            pet.status
                          )}`}
                        >
                          {pet.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => navigate(`/admin/pet/${pet._id}`)}
                            className="text-primary-600 hover:text-primary-900 transition-colors p-1 rounded-full hover:bg-primary-50"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(pet)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && pets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  No pets found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Delete Pet
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {petToDelete?.name}?
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}