import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { submitAdoptionApplication } from "../services/adoptionService";
import { getPetById } from "../services/petService";
import { jsPDF } from "jspdf"; // You'll need to install this package

export default function ApplyForAdoption() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pet, setPet] = useState(null);
  const [formStage, setFormStage] = useState("preview");
  const [formData, setFormData] = useState({
    petId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    housingType: "",
    hasYard: "",
    otherPets: "",
    experience: "",
    reason: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pet details when component mounts
  useEffect(() => {
    // Check if pet ID was passed through navigation state
    const petIdFromState = location.state?.petId;

    if (!petIdFromState) {
      // If no pet ID, redirect to pet list
      navigate("/pets");
      return;
    }

    // Fetch pet details
    const fetchPetDetails = async () => {
      try {
        const response = await getPetById(petIdFromState);
        setPet(response.pet);

        // Pre-fill petId in form data
        setFormData((prevData) => ({
          ...prevData,
          petId: petIdFromState,
        }));
      } catch (err) {
        console.error("Error fetching pet details:", err);
        setError("Unable to load pet details");
        navigate("/pets");
      }
    };

    fetchPetDetails();
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to generate and download application report
  const generateReport = () => {
    const doc = new jsPDF();

    // Add logo and header
    doc.setFontSize(20);
    doc.setTextColor(39, 174, 96); // green color for header
    doc.text("PetCare Adoption Application", 105, 20, { align: "center" });

    // Add pet information
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Application for: ${pet.name}`, 20, 40);
    doc.setFontSize(12);
    doc.text(
      `Pet Details: ${pet.breed} • ${pet.age} years old • ${pet.gender}`,
      20,
      48
    );

    // Add date
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 56);

    // Add line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, 190, 60);

    // Personal Information Section
    doc.setFontSize(14);
    doc.setTextColor(39, 174, 96);
    doc.text("Personal Information", 20, 70);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${formData.firstName} ${formData.lastName}`, 20, 80);
    doc.text(`Email: ${formData.email}`, 20, 88);
    doc.text(`Phone: ${formData.phone}`, 20, 96);

    // Address Section
    doc.setFontSize(14);
    doc.setTextColor(39, 174, 96);
    doc.text("Address", 20, 110);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${formData.address}`, 20, 120);
    doc.text(
      `${formData.city}, ${formData.state} ${formData.zipCode}`,
      20,
      128
    );

    // Living Situation Section
    doc.setFontSize(14);
    doc.setTextColor(39, 174, 96);
    doc.text("Living Situation", 20, 142);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Housing Type: ${formData.housingType}`, 20, 152);
    doc.text(`Has Yard: ${formData.hasYard}`, 20, 160);

    // Pet Experience Section
    doc.setFontSize(14);
    doc.setTextColor(39, 174, 96);
    doc.text("Pet Experience", 20, 174);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Other Pets: ${formData.otherPets}`, 20, 184);

    // Wrap text for longer sections
    const splitExperience = doc.splitTextToSize(
      `Experience: ${formData.experience}`,
      170
    );
    doc.text(splitExperience, 20, 192);

    const splitReason = doc.splitTextToSize(
      `Reason for Adoption: ${formData.reason}`,
      170
    );
    doc.text(splitReason, 20, 210);

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for applying to adopt from PetCare!", 105, 280, {
      align: "center",
    });
    doc.text(
      "A team member will contact you shortly to discuss next steps.",
      105,
      285,
      { align: "center" }
    );

    // Save the PDF
    doc.save(
      `PetCare_Adoption_Application_${pet.name}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate and download the report first
      generateReport();

      // Then submit the application
      const response = await submitAdoptionApplication(formData);

      // If successful, show submitted state
      setSubmitted(true);
    } catch (err) {
      // Handle any errors from the submission
      setError(
        err.message || "Failed to submit application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Preview stage action - now also downloads report before continuing to form
  const handlePreviewAction = () => {
    // If there's enough data in the form already, generate a preliminary report
    if (pet) {
      generateReport();
    }
    setFormStage("form");
  };

  // If no pet is loaded, show loading
  if (!pet) {
    return (
      <div className="max-w-3xl mx-auto pt-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 inline-block"></div>
        <p className="mt-4 text-gray-600">Loading adoption details...</p>
      </div>
    );
  }

  // Submitted confirmation view
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="rounded-2xl bg-white p-12 shadow-2xl border border-gray-100">
          <div className="mx-auto w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-8">
            <CheckCircleIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your interest in adopting {pet.name}. We'll review
            your application and contact you soon.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Return to Home
            </button>
            <button
              onClick={generateReport}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Download Application Copy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Preview Stage
  if (formStage === "preview") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Adopt {pet.name}
          </h1>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete the application to give {pet.name} a loving home
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Pet Preview Section */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <img
                src={pet.imageUrl || "/placeholder-pet.png"}
                alt={pet.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {pet.name}
                </h2>
                <p className="text-gray-600">
                  {pet.breed} • {pet.age} years old • {pet.gender}
                </p>
              </div>
            </div>
          </div>

          {/* Start Application Button */}
          <div className="p-6 text-center">
            <button
              onClick={handlePreviewAction}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>Submit Adoption Application for {pet.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <p className="mt-4 text-sm text-gray-500">
              By proceeding, you agree to our adoption process and home visit
              requirements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Full Form Stage
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Adopt {pet.name}
        </h1>
        <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Complete the application to give {pet.name} a loving home
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {Object.keys(error).length > 0 && (
            <ul>
              {Object.keys(error).map((key) => (
                <li key={key}>{error[key]}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 lg:p-12 space-y-10">
          {/* Hidden Pet ID Input */}
          <input type="hidden" name="petId" value={formData.petId} readOnly />

          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary-600">
                  1
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Personal Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  placeholder="Enter your last name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary-600">
                  2
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Address</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Living Situation Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary-600">
                  3
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Living Situation
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Housing Type
                </label>
                <select
                  name="housingType"
                  required
                  value={formData.housingType}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors"
                >
                  <option value="">Select housing type</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Do you have a yard?
  </label>
  <div className="flex items-center space-x-6 mt-2">
    <div className="flex items-center">
      <input
        id="yard-yes"
        name="hasYard"
        type="radio"
        value="yes"
        checked={formData.hasYard === "yes"}
        onChange={handleChange}
        required
        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
      />
      <label htmlFor="yard-yes" className="ml-2 block text-sm text-gray-700">
        Yes
      </label>
    </div>
    <div className="flex items-center">
      <input
        id="yard-no"
        name="hasYard"
        type="radio"
        value="no"
        checked={formData.hasYard === "no"}
        onChange={handleChange}
        required
        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
      />
      <label htmlFor="yard-no" className="ml-2 block text-sm text-gray-700">
        No
      </label>
    </div>
  </div>
</div>
            </div>
          </div>

          {/* Pet Experience Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary-600">
                  4
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Pet Experience
              </h2>
            </div>
            <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Do you have other pets?
  </label>
  <div className="flex items-center space-x-6 mt-2">
    <div className="flex items-center">
      <input
        id="other-pets-yes"
        name="otherPets"
        type="radio"
        value="yes"
        checked={formData.otherPets === "yes"}
        onChange={handleChange}
        required
        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
      />
      <label htmlFor="other-pets-yes" className="ml-2 block text-sm text-gray-700">
        Yes
      </label>
    </div>
    <div className="flex items-center">
      <input
        id="other-pets-no"
        name="otherPets"
        type="radio"
        value="no"
        checked={formData.otherPets === "no"}
        onChange={handleChange}
        required
        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
      />
      <label htmlFor="other-pets-no" className="ml-2 block text-sm text-gray-700">
        No
      </label>
    </div>
  </div>
</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-8 lg:px-12 py-6 bg-gray-50 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-8 py-4 text-lg font-medium text-white rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
              loading
                ? "bg-primary-400 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            }`}
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                <span>{`Submit Adoption Application for ${pet.name}`}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </button>
          <p className="mt-4 text-sm text-center text-gray-500">
            By submitting this form, you agree to our adoption process and home
            visit requirements. A copy of your application will be automatically
            downloaded.
          </p>
        </div>
      </form>
    </div>
  );
}
