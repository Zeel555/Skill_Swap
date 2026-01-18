import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Protects USER routes only.
// - If not authenticated → /login
// - If role === "admin"     → /admin/dashboard (admins must never see user UI)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
