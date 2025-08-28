import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  HeartIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  ScissorsIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContect";
import {
  createAppointment,
  getBookedSlots,
} from "../services/appointmentService";
import { getUserPets, ensureFullImageUrl } from "../services/petService";

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Updated to include 5 steps instead of 4
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    petId: "",
    serviceType: "",
    date: "",
    time: "",
    notes: "",
  });
  const [userPets, setUserPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

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
        setAvailableDates(response.dates);
        setIsLoadingAvailability(false);
      } catch (err) {
        console.error("Error fetching booked slots:", err);
        setError("Failed to load appointment availability. Please try again.");
        setIsLoadingAvailability(false);
      }
    };

    fetchBookedSlots();
  }, []);

  // Fetch specific date time slots when a date is selected
  useEffect(() => {
    const fetchDateTimeSlots = async () => {
      if (!formData.date) return;

      try {
        const response = await getBookedSlots(formData.date);
        const bookedTimes = response.bookedTimes || [];

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
  }, [formData.date]);

  // Fetch user's registered pets when component mounts
  useEffect(() => {
    const fetchUserRegisteredPets = async () => {
      if (!user) return;

      try {
        setIsLoadingPets(true);
        const response = await getUserPets();

        if (response.pets.length > 0) {
          setUserPets(
            response.pets.map((pet) => ({
              id: pet._id,
              name: pet.name,
              type: pet.type,
              breed: pet.breed,
              // Ensure a full URL for the imageUrl
              imageUrl: pet.imageUrl ? ensureFullImageUrl(pet.imageUrl) : "",
            }))
          );
        } else {
          // No registered pets found
          setError(
            "You don't have any registered pets. Please register a pet first."
          );
        }
      } catch (err) {
        console.error("Error fetching registered pets:", err);
        setError("Failed to load your pets. Please try again.");
      } finally {
        setIsLoadingPets(false);
      }
    };

    fetchUserRegisteredPets();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Submitting appointment data:", formData);
      // Send appointment data to the server
      await createAppointment(formData);

      // Show success message and redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/appointments");
      }, 2000);
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return !!formData.petId;
      case 2:
        return !!formData.serviceType;
      case 3:
        return !!formData.date;
      case 4:
        return !!formData.time;
      default:
        return true;
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
          You need to be logged in to book an appointment.
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

  // Handle case where user has no registered pets
  if (!isLoadingPets && userPets.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center text-yellow-500 mb-4">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-medium">No Registered Pets</h2>
        </div>
        <p className="text-gray-600 text-center mb-4">
          You don't have any registered pets. You need to register a pet before
          booking a veterinary appointment.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register-pet"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5 inline-block mr-1" />
            Register a Pet
          </Link>
          <button
            onClick={() => navigate("/appointments")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto page-transition">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Book an Appointment
        </h1>
        <p className="text-lg text-gray-600">
          Schedule a visit with our veterinarians for your pet
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Progress Steps - Updated to 5 steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((number) => (
            <div key={number} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-10 h-10 rounded-full 
                transition-all duration-300 transform
                ${step === number ? "scale-110" : ""}
                ${
                  step >= number
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }
              `}
              >
                {number}
              </div>
              {number < 5 && (
                <div
                  className={`
                  w-16 h-1 mx-2
                  transition-all duration-500
                  ${step > number ? "bg-primary-600" : "bg-gray-200"}
                `}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs md:text-sm">
          <span className="font-medium text-gray-500">Select Pet</span>
          <span className="font-medium text-gray-500">Service Type</span>
          <span className="font-medium text-gray-500">Choose Date</span>
          <span className="font-medium text-gray-500">Pick Time</span>
          <span className="font-medium text-gray-500">Confirm</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          {/* Step 1: Pet Selection */}
          <div
            className={`transition-all duration-500 transform ${
              step === 1
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 hidden"
            }`}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Select Your Pet
            </h2>

            {isLoadingPets ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPets.map((pet) => (
                  <div
                    key={pet.id}
                    onClick={() => setFormData({ ...formData, petId: pet.id })}
                    className={`
                      p-6 rounded-xl border-2 cursor-pointer
                      transition-all duration-300 transform hover:scale-105
                      ${
                        formData.petId === pet.id
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {pet.imageUrl ? (
                          <img
                            src={pet.imageUrl}
                            alt={pet.name}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <HeartIcon className="h-6 w-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {pet.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {pet.breed ? `${pet.type} · ${pet.breed}` : pet.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/register-pet"
                className="text-primary-600 hover:text-primary-700 inline-flex items-center"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Register another pet
              </Link>
            </div>
          </div>

          {/* Step 2: Service Type Selection (NEW) */}
          <div
            className={`transition-all duration-500 transform ${
              step === 2
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 hidden"
            }`}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Select Service Type
            </h2>

            <div className="grid grid-cols-1 gap-4">
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
                    p-6 rounded-xl border-2 cursor-pointer
                    transition-all duration-300 transform hover:scale-105
                    ${
                      formData.serviceType === service.name
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-12 w-12 rounded-full ${service.bgColor} flex items-center justify-center`}
                    >
                      <service.icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Date Selection (previously Step 2) */}
          <div
            className={`transition-all duration-500 transform ${
              step === 3
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 hidden"
            }`}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Select Date
            </h2>

            {isLoadingAvailability ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableDates.slice(0, 9).map((dateInfo) => {
                  const dateObj = new Date(dateInfo.date);
                  return (
                    <div
                      key={dateInfo.date}
                      onClick={() =>
                        dateInfo.available &&
                        setFormData({
                          ...formData,
                          date: dateInfo.date,
                        })
                      }
                      className={`
                        p-4 rounded-xl border-2 cursor-pointer text-center
                        transition-all duration-300 transform hover:scale-105
                        ${
                          !dateInfo.available
                            ? "bg-gray-50 cursor-not-allowed"
                            : formData.date === dateInfo.date
                            ? "border-primary-600 bg-primary-50"
                            : "border-gray-200 hover:border-primary-300"
                        }
                      `}
                    >
                      <p className="text-sm text-gray-500">
                        {format(dateObj, "EEEE")}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(dateObj, "MMM d")}
                      </p>
                      <p className="text-xs mt-1">
                        {dateInfo.appointmentCount} / {dateInfo.totalSlots}{" "}
                        booked
                      </p>
                      {!dateInfo.available && (
                        <p className="text-xs text-red-500 mt-1">
                          Fully Booked
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 4: Time Selection (previously Step 3) */}
          <div
            className={`transition-all duration-500 transform ${
              step === 4
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 hidden"
            }`}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Select Time
            </h2>

            {!formData.date ? (
              <p className="text-center text-gray-500">
                Please select a date first
              </p>
            ) : timeSlots.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    onClick={() =>
                      slot.available &&
                      setFormData({ ...formData, time: slot.time })
                    }
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer text-center
                      transition-all duration-300 transform hover:scale-105
                      ${
                        !slot.available
                          ? "bg-gray-50 cursor-not-allowed"
                          : formData.time === slot.time
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300"
                      }
                    `}
                  >
                    <ClockIcon className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">
                      {slot.time}
                    </p>
                    {!slot.available && (
                      <p className="text-xs text-red-500 mt-1">
                        Already Booked
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 5: Confirmation (previously Step 4) */}
          <div
            className={`transition-all duration-500 transform ${
              step === 5
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 hidden"
            }`}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Confirm Your Appointment
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <HeartIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">Pet</p>
                  <p className="text-lg font-medium text-gray-900">
                    {userPets.find((p) => p.id === formData.petId)?.name}
                  </p>
                </div>
              </div>

              {/* Service Type Display */}
              <div className="flex items-center space-x-4">
                {formData.serviceType === "General Checkup" && (
                  <HeartIcon className="h-6 w-6 text-blue-600" />
                )}
                {formData.serviceType === "Vaccination" && (
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                )}
                {formData.serviceType === "Grooming" && (
                  <ScissorsIcon className="h-6 w-6 text-purple-600" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formData.serviceType}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <CalendarIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formData.date &&
                      format(new Date(formData.date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ClockIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formData.time}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
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
        </div>

        {/* Navigation Buttons */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepComplete()}
              className={`
                ml-auto px-6 py-2 text-sm font-medium text-white rounded-lg
                transition-all duration-300 transform
                ${
                  isStepComplete()
                    ? "bg-primary-600 hover:bg-primary-700 hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                }
              `}
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2 inline-block" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className={`
                ml-auto px-6 py-2 text-sm font-medium text-white rounded-lg
                transition-all duration-300 transform 
                ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700 hover:scale-105"
                }
              `}
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </button>
          )}
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
              Appointment Booked!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your {formData.serviceType.toLowerCase()} appointment has been
              scheduled successfully. We'll see you soon!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
