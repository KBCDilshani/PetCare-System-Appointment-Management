import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContect";

/**
 * PublicRoute component - redirects authenticated users away from public routes
 * like login and signup pages to their appropriate dashboard
 */
const PublicRoute = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is already authenticated, redirect to appropriate page
  if (isAuthenticated()) {
    // Get redirect path from state or default to role-based dashboard
    const from =
      location.state?.from || (user.role === "admin" ? "/admin" : "/");
    return <Navigate to={from} replace />;
  }

  // If user is not authenticated, render children (login/signup form)
  return children;
};

export default PublicRoute;
