import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  HeartIcon,
  ScissorsIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContect";
import {
  getAppointmentById,
  updateAppointment,
  getBookedSlots,
} from "../services/appointmentService";

export default function AppointmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    petId: "",
    serviceType: "",
    date: "",
    time: "",
    notes: "",
  });
  const [userPets, setUserPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [originalAppointment, setOriginalAppointment] = useState(null);

  // Service types available
  const serviceTypes = [
    {
      id: "general",
      name: "General Checkup",
      description: "Regular health examination for your pet",
      icon: HeartIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "vaccination",
      name: "Vaccination",
      description: "Keep your pet protected with essential vaccines",
      icon: ShieldCheckIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "grooming",
      name: "Grooming",
      description: "Professional grooming and care services",
      icon: ScissorsIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // State for available dates and time slots
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [bookedSlots, setBookedSlots] = useState({});

  // Fetch booked slots data when component mounts
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        setIsLoadingAvailability(true);
        const response = await getBookedSlots();
        setBookedSlots(response.bookedSlots);

        // Mark the original appointment slot as available
        if (originalAppointment) {
          const { date, time } = originalAppointment;
          if (response.bookedSlots[date]) {
            const filteredTimes = response.bookedSlots[date].filter(
              (t) => t !== time
            );
            response.bookedSlots[date] = filteredTimes;
          }
        }

        // Set available dates
        const dates = response.dates.map((date) => ({
          ...date,
          date: new Date(date.date),
        }));
        setAvailableDates(dates);

        setIsLoadingAvailability(false);
      } catch (err) {
        console.error("Error fetching booked slots:", err);
        setError("Failed to load appointment availability. Please try again.");
        setIsLoadingAvailability(false);
      }
    };

    fetchBookedSlots();
  }, [originalAppointment]);

  // Fetch specific date time slots when a date is selected
  useEffect(() => {
    const fetchDateTimeSlots = async () => {
      if (!formData.date) return;

      try {
        const response = await getBookedSlots(formData.date);
        let bookedTimes = response.bookedTimes || [];

        // Remove the original time from booked times to make it available
        if (originalAppointment && formData.date === originalAppointment.date) {
          bookedTimes = bookedTimes.filter(
            (time) => time !== originalAppointment.time
          );
        }

        // Generate time slots based on booked times
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
          const time = `${hour.toString().padStart(2, "0")}:00`;
          const isBooked = bookedTimes.includes(time);

          slots.push({
            time,
            available: !isBooked,
            appointments: isBooked ? 1 : 0,
          });
        }

        setTimeSlots(slots);
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setError("Failed to load available time slots. Please try again.");
      }
    };

    fetchDateTimeSlots();
  }, [formData.date, originalAppointment]);

  // Fetch appointment data and user's pets when component mounts
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch appointment details
        const response = await getAppointmentById(id);
        const appointment = response.appointment;
        setOriginalAppointment(appointment);

        setFormData({
          petId: appointment.pet._id,
          serviceType: appointment.serviceType || "General Checkup", // Default for backward compatibility
          date: appointment.date,
          time: appointment.time,
          notes: appointment.notes || "",
        });

        // In a real app, fetch the user's pets from the API
        // For now, we'll use the appointment's pet
        setUserPets([
          {
            id: appointment.pet._id,
            name: appointment.pet.name,
            type: appointment.pet.type,
          },
        ]);

        setError("");
      } catch (err) {
        setError(
          err.message || "Failed to load appointment details. Please try again."
        );
        console.error("Error fetching appointment:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Update appointment via API
      await updateAppointment(id, {
        petId: formData.petId,
        serviceType: formData.serviceType,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
      });

      // Show success message and redirect
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/appointments");
      }, 2000);
    } catch (err) {
      setError(
        err.message || "Failed to update appointment. Please try again."
      );
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
          You need to be logged in to edit appointments.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Edit Appointment
        </h1>
        <p className="text-lg text-gray-600">Update your appointment details</p>
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
        <div className="p-8 space-y-6">
          {/* Pet Selection */}
          <div className="space-y-2">
            <label
              htmlFor="pet-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Pet
            </label>
            <select
              id="pet-select"
              value={formData.petId}
              onChange={(e) =>
                setFormData({ ...formData, petId: e.target.value })
              }
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Choose a pet</option>
              {userPets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.type})
                </option>
              ))}
            </select>
          </div>

          {/* Service Type Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {serviceTypes.map((service) => (
                <div
                  key={service.id}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      serviceType: service.name,
                    })
                  }
                  className={`
                    p-4 rounded-lg border cursor-pointer
                    transition-all duration-200 transform hover:scale-105
                    ${
                      formData.serviceType === service.name
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-10 w-10 rounded-full ${service.bgColor} flex items-center justify-center mr-3`}
                    >
                      <service.icon className={`h-5 w-5 ${service.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {service.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label
              htmlFor="date-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="date-select"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value, time: "" })
                }
                required
                className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Choose a date</option>
                {/* Include original date */}
                {originalAppointment && (
                  <option value={originalAppointment.date} key="original-date">
                    {format(new Date(originalAppointment.date), "MMMM d, yyyy")}{" "}
                    (Current)
                  </option>
                )}

                {isLoadingAvailability ? (
                  <option disabled>Loading available dates...</option>
                ) : (
                  availableDates.map((dateInfo) => {
                    const dateStr = format(dateInfo.date, "yyyy-MM-dd");
                    // Original date is already added above
                    if (
                      originalAppointment &&
                      dateStr === originalAppointment.date
                    ) {
                      return null;
                    }
                    return (
                      <option
                        key={dateStr}
                        value={dateStr}
                        disabled={!dateInfo.available}
                      >
                        {format(dateInfo.date, "MMMM d, yyyy")}
                        {dateInfo.available
                          ? ` (${dateInfo.appointmentCount}/${dateInfo.totalSlots} booked)`
                          : " (Fully Booked)"}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label
              htmlFor="time-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Time
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="time-select"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
                className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Choose a time</option>

                {/* Include original time when original date is selected */}
                {originalAppointment &&
                  formData.date === originalAppointment.date && (
                    <option
                      value={originalAppointment.time}
                      key="original-time"
                    >
                      {originalAppointment.time} (Current)
                    </option>
                  )}

                {!formData.date ? (
                  <option disabled>Select a date first</option>
                ) : timeSlots.length === 0 ? (
                  <option disabled>Loading available times...</option>
                ) : (
                  timeSlots.map(({ time, available }) => {
                    // Skip rendering original time as it's already added above
                    if (
                      originalAppointment &&
                      formData.date === originalAppointment.date &&
                      time === originalAppointment.time
                    ) {
                      return null;
                    }
                    return (
                      <option key={time} value={time} disabled={!available}>
                        {time}
                        {!available ? " (Already Booked)" : ""}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="4"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Any specific concerns or requests..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/appointments")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              }
            `}
          >
            {isLoading ? "Processing..." : "Update Appointment"}
          </button>
        </div>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          Appointment updated successfully!
        </div>
      )}
    </div>
  );
}
