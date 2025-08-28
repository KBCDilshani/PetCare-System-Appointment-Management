import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { generateDonationReceipt } from "../../utils/pdfGenerator";
import {
  getAllDonations,
  getDonationsSummary,
  updateDonation,
  getDateFilterParams,
  getAmountFilterParams,
} from "../../services/donationService";

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalAmount: 0,
    byPurpose: [],
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    purpose: "",
    dateRange: "",
    amountRange: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    totalAmount: 0,
  });

  // Fetch donations when filters or pagination changes
  useEffect(() => {
    fetchDonations();
  }, [filters, pagination.page, pagination.limit]);

  // Fetch summary data on component mount
  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert frontend filters to API parameters
      const dateParams = getDateFilterParams(filters.dateRange);
      const amountParams = getAmountFilterParams(filters.amountRange);

      // Prepare filters for API call
      const apiFilters = {
        search: search,
        purpose: filters.purpose,
        page: pagination.page,
        limit: pagination.limit,
        ...dateParams,
        ...amountParams,
      };

      const response = await getAllDonations(apiFilters);

      setDonations(response.donations);
      setPagination({
        ...pagination,
        total: response.total,
        totalPages: response.totalPages,
        totalAmount: response.totalAmount,
      });
    } catch (err) {
      console.error("Error fetching donations:", err);
      setError("Failed to load donations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getDonationsSummary();
      setSummary(response);
    } catch (err) {
      console.error("Error fetching summary data:", err);
      // Don't set an error state here as it's not critical to the main functionality
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page
    fetchDonations();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const handleDownloadReceipt = async (donation) => {
    try {
      // Mark receipt as generated in database if it hasn't been already
      if (!donation.receiptGenerated) {
        await updateDonation(donation._id, { receiptGenerated: true });
      }

      // Generate receipt PDF
      generateDonationReceipt(donation);
    } catch (err) {
      console.error("Error generating receipt:", err);
      alert("Failed to generate receipt. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Donations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage donations from supporters
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Total Donations
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {summary.totalCount}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              LKR{" "}
              {summary.totalAmount ? summary.totalAmount.toLocaleString() : 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Most Popular Purpose
            </h3>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {summary.byPurpose && summary.byPurpose.length > 0
                ? summary.byPurpose[0]._id
                : "N/A"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">This Month</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {summary.monthlyData && summary.monthlyData.length > 0
                ? `LKR ${summary.monthlyData[
                    summary.monthlyData.length - 1
                  ].amount.toLocaleString()}`
                : "LKR 0"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search donations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="relative">
            <select
              value={filters.purpose}
              onChange={(e) => handleFilterChange("purpose", e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Purposes</option>
              <option value="Food & Supplies">Food & Supplies</option>
              <option value="Medical Care">Medical Care</option>
              <option value="Shelter Maintenance">Shelter Maintenance</option>
              <option value="General Support">General Support</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
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
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filters.amountRange}
              onChange={(e) =>
                handleFilterChange("amountRange", e.target.value)
              }
              className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            >
              <option value="">All Amounts</option>
              <option value="0-1000">Up to LKR 1,000</option>
              <option value="1001-5000">LKR 1,001 - 5,000</option>
              <option value="5001+">LKR 5,001+</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </form>

        {/* Active Filters */}
        {(filters.purpose || filters.dateRange || filters.amountRange) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.purpose && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                Purpose: {filters.purpose}
                <button
                  type="button"
                  onClick={() => handleFilterChange("purpose", "")}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
                >
                  ×
                </button>
              </span>
            )}

            {filters.dateRange && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                Date:{" "}
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

            {filters.amountRange && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                Amount:{" "}
                {filters.amountRange === "0-1000"
                  ? "Up to LKR 1,000"
                  : filters.amountRange === "1001-5000"
                  ? "LKR 1,001 - 5,000"
                  : "LKR 5,001+"}
                <button
                  type="button"
                  onClick={() => handleFilterChange("amountRange", "")}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
                >
                  ×
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() =>
                setFilters({ purpose: "", dateRange: "", amountRange: "" })
              }
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">
            Total Donations:{" "}
            <span className="text-gray-900">
              LKR {pagination.totalAmount.toLocaleString()}
            </span>
            <span className="mx-2">•</span>
            <span className="text-gray-900">
              {pagination.total} donation{pagination.total !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
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

      {/* Donations Table */}
      {!loading && (
        <div className="flow-root">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Donor
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Purpose
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
                    Receipt
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {donations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {donation.donor}
                        </div>
                        <div className="text-gray-500">{donation.email}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        LKR {donation.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {donation.purpose}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {format(new Date(donation.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {donation.receiptNumber}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleDownloadReceipt(donation)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Download Receipt"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {donations.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  No donations found matching your criteria.
                </p>
              </div>
            )}
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

                {/* Page numbers - limit to 5 page buttons */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                  (_, i) => {
                    // Calculate which page numbers to show
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      // Show all pages if 5 or fewer
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      // If current page is near the start
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      // If current page is near the end
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      // If current page is in the middle
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          setPagination({ ...pagination, page: pageNum })
                        }
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pagination.page === pageNum
                            ? "z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

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
    </div>
  );
}
