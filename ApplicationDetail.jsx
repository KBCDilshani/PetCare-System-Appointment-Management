import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getAdoptionApplicationById,
  updateAdoptionStatus,
} from "../../services/adoptionService";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdoptionApplicationById(id);
      setApplication(response.application);

      // Pre-populate admin notes if they exist
      if (response.application.adminNotes) {
        setAdminNotes(response.application.adminNotes);
      }
    } catch (err) {
      console.error("Error fetching application details:", err);
      setError("Failed to load application details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setSelectedAction(newStatus.toLowerCase());
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      setLoading(true);

      // Call the API to update the application status
      await updateAdoptionStatus(id, {
        status: selectedAction,
        adminNotes: adminNotes,
      });

      // Refresh the application details
      fetchApplicationDetails();

      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update application status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 ring-green-600/20";
      case "rejected":
        return "bg-red-100 text-red-800 ring-red-600/20";
      case "pending":
        return "bg-yellow-100 text-yellow-800 ring-yellow-600/20";
      default:
        return "bg-gray-100 text-gray-800 ring-gray-600/20";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-8 pb-16">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto pt-8 pb-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/admin/applications")}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  // Application not found
  if (!application) {
    return (
      <div className="max-w-4xl mx-auto pt-8 pb-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Application Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The application you're looking for could not be found.
        </p>
        <button
          onClick={() => navigate("/admin/applications")}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-16">
      {/* Back navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/applications")}
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to all applications
        </button>
      </div>

      {/* Application header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-5 sm:px-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Application from {application.firstName} {application.lastName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Submitted on {formatDate(application.createdAt)}
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status.charAt(0).toUpperCase() +
                  application.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons for pending applications */}
        {application.status === "pending" && (
          <div className="px-6 py-4 sm:px-8 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleStatusChange("approved")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Approve Application
              </button>
              <button
                onClick={() => handleStatusChange("rejected")}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Reject Application
              </button>
            </div>
          </div>
        )}

        {/* Pet details */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pet Information
          </h2>

          <div className="flex items-start">
            {application.pet?.imageUrl && (
              <img
                src={application.pet.imageUrl}
                alt={application.pet.name}
                className="h-24 w-24 object-cover rounded-lg mr-4"
              />
            )}

            <div>
              <h3 className="text-xl font-medium text-gray-900">
                {application.pet?.name || "Unknown Pet"}
              </h3>
              <div className="mt-1 text-sm text-gray-500">
                <p>
                  {application.pet?.breed || "Unknown Breed"} •{" "}
                  {application.pet?.age || "?"} years old •{" "}
                  {application.pet?.gender || "?"}
                </p>
                <p className="mt-1">
                  Current Status:{" "}
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                      application.pet?.status || "Unknown"
                    )}`}
                  >
                    {application.pet?.status || "Unknown"}
                  </span>
                </p>
              </div>

              {application.pet && (
                <Link
                  to={`/pet/${application.pet._id}`}
                  className="inline-block mt-2 text-sm text-primary-600 hover:text-primary-800"
                >
                  View Pet Profile →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Applicant details */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Applicant Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Contact Information
              </h3>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{application.email}</span>
                </li>
                <li className="flex items-start">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{application.phone}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p>{application.address.street}</p>
                    <p>
                      {application.address.city}, {application.address.state}{" "}
                      {application.address.zipCode}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Living situation */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Living Situation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Housing Type
              </h3>
              <p className="mt-1 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="capitalize">{application.housingType}</span>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Has Yard</h3>
              <p className="mt-1 flex items-center">
                <HomeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="capitalize">{application.hasYard}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Pet experience */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pet Experience
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Has Other Pets
              </h3>
              <p className="mt-1 capitalize">{application.otherPets}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Previous Pet Experience
              </h3>
              <p className="mt-1 text-gray-700">{application.experience}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Reason for Adoption
              </h3>
              <p className="mt-1 text-gray-700">{application.reason}</p>
            </div>
          </div>
        </div>

        {/* Admin notes */}
        <div className="px-6 py-5 sm:px-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Admin Notes
          </h2>

          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows="4"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Add notes about this application..."
          ></textarea>

          <div className="mt-4 flex justify-end">
            <button
              onClick={async () => {
                try {
                  await updateAdoptionStatus(id, {
                    status: application.status,
                    adminNotes: adminNotes,
                  });
                  // Show success message
                  alert("Notes saved successfully");
                } catch (err) {
                  console.error("Error saving notes:", err);
                  setError("Failed to save notes. Please try again.");
                }
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>

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
                        application?
                        {selectedAction === "approved"
                          ? " This will mark the pet as Adopted."
                          : " This will make the pet Available again."}
                      </p>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Admin Notes
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows="3"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Add notes about this decision..."
                        ></textarea>
                      </div>
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
