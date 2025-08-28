import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContect";
import {
  HeartIcon,
  HomeIcon,
  UserIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CalendarIcon, // Added for appointments
} from "@heroicons/react/24/outline";

const publicNavigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Available Pets", href: "/pets", icon: HeartIcon },
  { name: "Donate", href: "/donate", icon: BuildingOfficeIcon },
];

// New item for My Pets
const myPetsNavItem = {
  name: "My Pets",
  href: "/mypets",
  icon: HeartIcon, // Using HeartIcon as a substitute for 
};

const appointmentsNavItem = {
  name: "Appointments",
  href: "/appointments",
  icon: CalendarIcon,
};

// Create a separate constant for the Adopt nav item
const adoptNavItem = { 
  name: "Adopt", 
  href: "/adopt", 
  icon: UserIcon 
};

const adminNavItem = { name: "Admin", href: "/admin", icon: Cog6ToothIcon };

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Create navigation array based on user role
  const navigation = [...publicNavigation];

  // Add my pets and appointments links for authenticated users
  if (isAuthenticated()) {
    navigation.push(adoptNavItem); // Add Adopt nav item only when logged in
    navigation.push(myPetsNavItem); // Add My Pets nav item
    navigation.push(appointmentsNavItem);
  }

  // Add admin link for admin users
  if (isAuthenticated() && isAdmin()) {
    navigation.push(adminNavItem);
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-md"
            : "bg-white shadow-sm"
        }`}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Top"
        >
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
              <img src="/public/LOGO.jpeg" alt="Office Icon" className="h-10 w-10 text-primary-600" />

                <span className="text-xl font-bold text-gray-900">
                  PawFect Care
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <div className="flex space-x-4">
                {navigation.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    location.pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg
                        transition-colors duration-150 ease-in-out gap-1.5
                        ${
                          isActive
                            ? "text-primary-600 bg-primary-50"
                            : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Auth Buttons or User Menu */}
              {isAuthenticated() ? (
                <div className="flex items-center space-x-4 pl-6 ml-6 border-l border-gray-200">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName || "User"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 pl-6 ml-6 border-l border-gray-200">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    location.pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        block rounded-lg px-3 py-2 text-base font-medium
                        ${
                          isActive
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}

                {/* Mobile Auth Menu */}
                <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                  {isAuthenticated() ? (
                    <>
                      <div className="px-3 py-2 text-base font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <UserCircleIcon className="h-5 w-5" />
                          Hello, {user?.firstName || "User"}
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/signup"
                        className="block rounded-lg px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-16" />
    </>
  );
}
