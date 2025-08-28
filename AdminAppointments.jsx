import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  HeartIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContect";
import { useNavigate } from "react-router-dom";
import {
  getAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";

export default function AdminAppointments() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    date: "",
    petType: "",
    serviceType: "", // New filter for service type
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Fetch appointments when component mounts or filters change
  useEffect(() => {
    const fetchAppointmentsData = async () => {
      if (!user || !isAdmin()) return;

      try {
        setIsLoading(true);

        // Create filter object for API
        const apiFilters = {
          search,
          status: filters.status,
          petType: filters.petType,
          serviceType: filters.serviceType, // Include service type filter
          page: pagination.page,
          limit: pagination.limit,
        };

        // Handle date filter
        if (filters.date === "today") {
          apiFilters.date = new Date().toISOString().split("T")[0];
        }
        // Backend handles week/month filters differently
        else if (filters.date) {
          apiFilters.dateRange = filters.date;
        }

        // Make API call
        const response = await getAppointments(apiFilters);

        setAppointments(response.appointments || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
        });

        setError("");
      } catch (err) {
        setError(
          err.message || "Failed to load appointments. Please try again."
        );
        console.error("Error fetching appointments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentsData();
  }, [user, isAdmin, search, filters, pagination.page, pagination.limit]);

  const handleStatusChange = (appointment, newStatus) => {
    setSelectedAppointment(appointment);
    setSelectedAction(newStatus);
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedAppointment || !selectedAction) return;

    try {
      setIsLoading(true);

      // Update status via API
      await updateAppointmentStatus(selectedAppointment._id, selectedAction);

      // Update local state
      setAppointments(
        appointments.map((app) =>
          app._id === selectedAppointment._id
            ? { ...app, status: selectedAction }
            : app
        )
      );

      setShowConfirmModal(false);
      showAlertMessage(
        `Appointment ${selectedAction.toLowerCase()} successfully`
      );
    } catch (err) {
      setError(
        err.message || "Failed to update appointment status. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 ring-green-600/20";
      case "Cancelled":
        return "bg-red-100 text-red-800 ring-red-600/20";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 ring-yellow-600/20";
      default:
        return "bg-gray-100 text-gray-800 ring-gray-600/20";
    }
  };

  // Helper function to get service type icon
  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "Vaccination":
        return <ShieldCheckIcon className="h-5 w-5 text-green-500" />;
      case "Grooming":
        return <ScissorsIcon className="h-5 w-5 text-purple-500" />;
      case "General Checkup":
        return <HeartIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BeakerIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Check if user is admin, if not redirect
  if (!user || !isAdmin()) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center text-yellow-500 mb-4">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-medium">Access Denied</h2>
        </div>
        <p className="text-gray-600 text-center mb-4">
          You don't have admin permissions to access this page.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Manage Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all veterinary appointments
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filters.petType}
              onChange={(e) =>
                setFilters({ ...filters, petType: e.target.value })
              }
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Pet Types</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Bird">Birds</option>
              <option value="Small Animal">Small Animals</option>
              <option value="Reptile">Reptiles</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Service Type Filter (NEW) */}
          <div className="relative">
            <select
              value={filters.serviceType}
              onChange={(e) =>
                setFilters({ ...filters, serviceType: e.target.value })
              }
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Services</option>
              <option value="General Checkup">General Checkup</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Grooming">Grooming</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flow-root">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Pet & Owner
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Date & Time
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div>
                      <div className="font-medium text-gray-900">
                        {appointment.pet?.name || "Unknown"} (
                        {appointment.pet?.type || "Pet"})
                      </div>
                      <div className="text-gray-500">
                        {appointment.user?.firstName}{" "}
                        {appointment.user?.lastName}
                        <br />
                        {appointment.user?.email}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="text-gray-900">
                      {format(new Date(appointment.date), "MMMM d, yyyy")}
                    </div>
                    <div className="text-gray-500">{appointment.time}</div>
                  </td>
                  {/* Service Type Display */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex items-center space-x-2">
                      {getServiceIcon(
                        appointment.serviceType || "General Checkup"
                      )}
                      <span className="text-gray-900">
                        {appointment.serviceType || "General Checkup"}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {appointment.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(appointment, "Confirmed")
                          }
                          className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-full hover:bg-green-50"
                          title="Confirm"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(appointment, "Cancelled")
                          }
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Cancel"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {appointments.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No appointments found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No appointments match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {appointments.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                pagination.page === 1
                  ? "text-gray-300"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                pagination.page === pagination.totalPages
                  ? "text-gray-300"
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
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    pagination.page === 1
                      ? "text-gray-300"
                      : "text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Show current page and total pages */}
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    pagination.page === pagination.totalPages
                      ? "text-gray-300"
                      : "text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
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
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Confirm Status Change
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to mark this appointment as{" "}
                        {selectedAction?.toLowerCase()}? This action cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmStatusChange}
                    disabled={isLoading}
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                      selectedAction === "Confirmed"
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-red-600 hover:bg-red-500"
                    } ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? "Processing..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isLoading}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          {alertMessage}
        </div>
      )}
    </div>
  );
}
