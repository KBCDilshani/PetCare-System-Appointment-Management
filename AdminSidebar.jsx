import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContect";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  HeartIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: HomeIcon,
    description: "Overview and key metrics",
  },
  {
    name: "Manage Pets",
    href: "/admin/pets",
    icon: UsersIcon,
    description: "Add and manage pet listings",
  },
  {
    name: "Applications",
    href: "/admin/applications",
    icon: DocumentTextIcon,
    description: "Review adoption applications",
  },
  {
    name: "Appointments",
    href: "/admin/appointments",
    icon: CalendarIcon,
    description: "Manage veterinary appointments",
  },
  {
    name: "Donations",
    href: "/admin/donations",
    icon: HeartIcon,
    description: "Track and manage donations",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: ChartBarIcon,
    description: "View insights and reports",
  },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent setSidebarOpen={setSidebarOpen} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72">
        <SidebarContent setSidebarOpen={setSidebarOpen} />
      </div>
    </>
  );
}

function SidebarContent({ setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2 px-2 py-4">
          <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            Pet Adoption
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group relative flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6
                  transition-all duration-150 ease-in-out hover:bg-gray-50
                  ${isActive ? "bg-primary-50" : ""}
                `}
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <div
                  className={`
                  flex h-10 w-10 flex-none items-center justify-center rounded-lg
                  transition-colors duration-150 ease-in-out
                  ${
                    isActive
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-primary-600"
                  }
                `}
                >
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex-auto">
                  <span
                    className={`
                    font-medium
                    ${isActive ? "text-primary-600" : "text-gray-900"}
                  `}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`
                    block text-xs
                    ${isActive ? "text-primary-500" : "text-gray-500"}
                  `}
                  >
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute inset-y-0 right-0 w-1 bg-primary-600 rounded-l-lg" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile and Actions */}
        <div className="mt-auto space-y-4 pt-6 border-t border-gray-200">
          {/* User Profile */}
          <div className="group p-3 rounded-xl hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.firstName}'s profile`}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {user?.firstName?.charAt(0) || "A"}
                  </div>
                )}
                <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
              </div>
              <div className="flex-1 truncate">
                <div className="flex items-center gap-1">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName || "Admin"}
                  </div>
                  <span className="inline-block h-4 w-4 rounded-full bg-primary-100">
                    <span className="block h-2 w-2 translate-x-1 translate-y-1 rounded-full bg-primary-600" />
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || "admin@example.com"}
                </div>
              </div>
            </div>
          </div>

          {/* Settings and Logout */}
          <div className="space-y-1 px-3">
            <Link
              to="/admin/settings"
              className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
            >
              <CogIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
              Sign out
            </button>
          </div>

          {/* Pro Badge */}
          <div className="mx-3 rounded-xl bg-gradient-to-r from-primary-600/90 to-primary-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Admin Pro</div>
                <div className="text-xs text-primary-100">
                  All features enabled
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-800/30 text-white">
                <span className="text-xs font-medium">PRO</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
