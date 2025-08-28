import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContect";
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminHeader({ setSidebarOpen }) {
  const [notifications] = useState(3); // Example notification count
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Default avatar if user doesn't have an image
  const avatarUrl =
    user?.avatarUrl ||
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  return (
    <header className="sticky top-0 z-40 flex h-16 bg-white shadow-sm">
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className="flex flex-1 justify-between px-4 sm:px-6">
        <div className="flex flex-1">
          {/* Breadcrumbs or search could go here */}
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification bell */}
          <button
            type="button"
            className="relative rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <img
                className="h-8 w-8 rounded-lg object-cover"
                src={avatarUrl}
                alt={`${user?.firstName || "Admin"}'s profile`}
              />
              <span className="hidden md:block font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
                onBlur={() => setProfileMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/admin/settings"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Cog6ToothIcon className="h-4 w-4 text-gray-400" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setProfileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 flex items-center gap-2"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 text-gray-400" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
