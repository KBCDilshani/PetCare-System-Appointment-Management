import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContect";
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import PetList from "./pages/PetList";
import PetDetail from "./pages/PetDetail";
import ApplyForAdoption from "./pages/ApplyForAdoption";
import DonationPage from "./pages/DonationPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Pet Management Pages (New)
import RegisterPet from "./pages/RegisterPet";
import MyPets from "./pages/MyPets";
import EditPet from "./pages/EditPet";

// Appointment Pages
import AppointmentBooking from "./pages/AppointmentBooking";
import AppointmentEdit from "./pages/AppointmentEdit";
import AppointmentList from "./pages/AppointmentList";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import ManagePets from "./pages/admin/ManagePets";
import Applications from "./pages/admin/Applications";
import Donations from "./pages/admin/Donations";
import AdminAppointments from "./pages/admin/AdminAppointments";
import PetForm from "./pages/PetForm";
import ApplicationDetail from "./pages/admin/ApplicationDetail";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public area */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="pets" element={<PetList />} />
          <Route path="pet/:id" element={<PetDetail />} />
          <Route path="adopt" element={<ApplyForAdoption />} />
          <Route path="donate" element={<DonationPage />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />

          {/* Pet Management Routes */}
          <Route path="register-pet" element={<RegisterPet />} />
          <Route path="mypets" element={<MyPets />} />
          <Route path="edit-pet/:id" element={<EditPet />} />

          {/* User Appointment Routes */}
          <Route path="appointments">
            <Route index element={<AppointmentList />} />
            <Route path="book" element={<AppointmentBooking />} />
            <Route path="edit/:id" element={<AppointmentEdit />} />
          </Route>

          {/* Catch all for not found pages */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin area (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pets" element={<ManagePets />} />
          <Route path="applications" element={<Applications />} />
          <Route path="donations" element={<Donations />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="pet/:id?" element={<PetForm />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
