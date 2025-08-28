import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getAdoptionApplications,
  updateAdoptionStatus,
} from "../../services/adoptionService";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    petType: "",
    dateRange: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Fetch applications when filters or pagination changes
  useEffect(() => {
    fetchApplications();
  }, [filters, pagination.page, pagination.limit]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters for API call
      const apiFilters = {
        search: search,
        status: filters.status,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add date range filter if selected
      if (filters.dateRange) {
        // The backend handles date filtering differently,
        // so we don't include it in the API call
        // but we'll filter the results client-side
      }

      const response = await getAdoptionApplications(apiFilters);

      // Apply client-side date filtering if needed
      let filteredApplications = response.applications;
      if (filters.dateRange) {
        const now = new Date();
        const filterDate = new Date();

        if (filters.dateRange === "today") {
          filterDate.setHours(0, 0, 0, 0);
        } else if (filters.dateRange === "week") {
          filterDate.setDate(now.getDate() - 7);
        } else if (filters.dateRange === "month") {
          filterDate.setMonth(now.getMonth() - 1);
        }

        filteredApplications = filteredApplications.filter((app) => {
          const appDate = new Date(app.createdAt);
          return appDate >= filterDate;
        });
      }

      // Apply pet type filtering if needed (assuming pet data is populated)
      if (filters.petType && filters.petType !== "") {
        filteredApplications = filteredApplications.filter(
          (app) => app.pet && app.pet.type === filters.petType
        );
      }

      setApplications(filteredApplications);
      setPagination({
        ...pagination,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page
    fetchApplications();
  };

  const handleStatusChange = (applicationId, newStatus) => {
    setSelectedApplication(applicationId);
    setSelectedAction(newStatus.toLowerCase()); // Backend uses lowercase statuses
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      setLoading(true);

      // Call the API to update the application status
      await updateAdoptionStatus(selectedApplication, {
        status: selectedAction,
        adminNotes: `Status changed to ${selectedAction} on ${new Date().toISOString()}`,
      });

      // Refresh the applications list
      fetchApplications();

      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update application status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Adoption Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage adoption applications from potential pet parents
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            />
          </div>

          {/* Filter Dropdowns */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={filters.petType}
              onChange={(e) => handleFilterChange("petType", e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Pet Types</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
        </form>

        {/* Active Filters */}
        {(filters.status || filters.petType || filters.dateRange) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.status && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                Status:{" "}
                {filters.status.charAt(0).toUpperCase() +
                  filters.status.slice(1)}
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "")}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.petType && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                Pet Type: {filters.petType}
                <button
                  type="button"
                  onClick={() => handleFilterChange("petType", "")}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateRange && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                {filters.dateRange === "today"
                  ? "Today"
                  : filters.dateRange === "week"
                  ? "Past Week"
                  : "Past Month"}
                <button
                  type="button"
                  onClick={() => handleFilterChange("dateRange", "")}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
                >
                  ×
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                setFilters({ status: "", petType: "", dateRange: "" })
              }
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 m-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Applications Table */}
      {!loading && (
        <div className="flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Applicant
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Pet
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date
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
                <tbody className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {`${application.firstName} ${application.lastName}`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium text-gray-900">
                            {application.pet ? application.pet.name : "Unknown"}
                          </span>
                          <span className="text-gray-500">
                            {application.pet
                              ? ` • ${application.pet.type}`
                              : ""}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>
                          <div className="text-gray-900">
                            {application.email}
                          </div>
                          <div className="text-gray-500">
                            {application.phone}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          {application.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    application._id,
                                    "Approved"
                                  )
                                }
                                className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-full hover:bg-green-50"
                                title="Approve"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    application._id,
                                    "Rejected"
                                  )
                                }
                                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {/* View details button for all applications */}
                          <Link
                            to={`/admin/applications/${application._id}`}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                            title="View Details"
                          >
                            <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {applications.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">
                    No applications found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1),
                })
              }
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                pagination.page === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.min(pagination.totalPages, pagination.page + 1),
                })
              }
              disabled={pagination.page === pagination.totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                pagination.page === pagination.totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.max(1, pagination.page - 1),
                    })
                  }
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.page === 1
                      ? "cursor-not-allowed"
                      : "hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers - could be more sophisticated with ellipsis for many pages */}
                {[...Array(pagination.totalPages).keys()].map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setPagination({ ...pagination, page: i + 1 })
                    }
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      pagination.page === i + 1
                        ? "z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.min(
                        pagination.totalPages,
                        pagination.page + 1
                      ),
                    })
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.page === pagination.totalPages
                      ? "cursor-not-allowed"
                      : "hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleIcon
                      className="h-6 w-6 text-yellow-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Confirm Application{" "}
                      {selectedAction.charAt(0).toUpperCase() +
                        selectedAction.slice(1)}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to {selectedAction} this adoption
                        application? This action will update the pet's status
                        and notify the applicant.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                      selectedAction === "approved"
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-red-600 hover:bg-red-500"
                    }`}
                    onClick={confirmStatusChange}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setShowConfirmModal(false)}
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
