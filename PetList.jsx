import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  HeartIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { getPets } from "../services/petService";
import { ensureFullImageUrl } from "../services/petService";

export default function PetList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    gender: "",
    ageRange: "",
  });

  // Fetch pets on component mount and when filters change
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);

        // Create filter params for API
        const filterParams = {
          search,
          type: filters.type,
          status: "Available", // Only show available pets
          ageRange: filters.ageRange,
        };

        const response = await getPets(filterParams);

        // Ensure all image URLs are complete
        const petsWithFullImageUrls = response.pets.map((pet) => ({
          ...pet,
          imageUrl: ensureFullImageUrl(pet.imageUrl),
        }));

        setPets(petsWithFullImageUrls);
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

  // Function to filter pets by gender - we need this since the backend doesn't support gender filtering
  const filteredPets = pets.filter((pet) => {
    return !filters.gender || pet.gender === filters.gender;
  });

  // Function to handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/150?text=No+Image";
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Companion
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our available pets and find your new best friend. Each of our
          pets is special and ready to find their forever home.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              value={filters.gender}
              onChange={(e) =>
                setFilters({ ...filters, gender: e.target.value })
              }
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
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

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Pets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
              >
                <div className="relative h-64">
                  {pet.imageUrl ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <PhotoIcon className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                    <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {pet.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                        {pet.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {pet.breed || "Mixed"}
                      </span>{" "}
                      • {pet.age} years • {pet.gender}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {pet.description || "No description available."}
                    </p>
                  </div>

                  <Link
                    to={`/pet/${pet._id}`}
                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Meet {pet.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredPets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                No pets found matching your criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
