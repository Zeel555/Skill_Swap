import { Navigate, Route, Routes } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import UserDashboard from "../pages/UserDashboard";
import SearchPage from "../pages/SearchPage";
import MatchesPage from "../pages/MatchesPage";
import ChatListPage from "../pages/ChatListPage";
import AdminDashboardPage from "../pages/AdminDashboard";
import Profile from "../features/users/Profile";
import EditProfile from "../features/users/EditProfile";
import SwapList from "../features/swaps/SwapList";
import CreateSwap from "../features/swaps/CreateSwap";
import SwapDetails from "../features/swaps/SwapDetails";
import ChatWindow from "../features/chat/ChatWindow";
import NotificationList from "../features/notifications/NotificationList";
import UsersTable from "../features/admin/UsersTable";
import SwapsTable from "../features/admin/SwapsTable";
import Reports from "../features/admin/Reports";
import AdminNotifications from "../features/admin/Notifications";
import History from "../features/admin/History";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AdminRoute from "./AdminRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* User Routes */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/swaps" element={<SwapList />} />
        <Route path="/swaps/create" element={<CreateSwap />} />
        <Route path="/swaps/:id" element={<SwapDetails />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:userId" element={<ChatWindow />} />
        <Route path="/notifications" element={<NotificationList />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UsersTable />} />
        <Route path="/admin/swaps" element={<SwapsTable />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/history" element={<History />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
