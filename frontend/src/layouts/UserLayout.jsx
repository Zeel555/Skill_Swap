import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { getNotifications } from "../features/notifications/notificationSlice";
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

const UserLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );

  const socket = useSocket();

  useEffect(() => {
    if (user) {
      dispatch(getNotifications());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit("join", user._id);

      socket.on("receiveNotification", (notification) => {
        dispatch({ type: "notification/addNotification", payload: notification });
      });

      return () => {
        socket.off("receiveNotification");
      };
    }
  }, [socket, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            SkillSwap
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`${
                isActive("/dashboard") ? "text-blue-600" : "text-gray-700"
              } hover:text-blue-600`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`${
                isActive("/profile") ? "text-blue-600" : "text-gray-700"
              } hover:text-blue-600`}
            >
              Profile
            </Link>
            <Link
              to="/swaps"
              className={`${
                isActive("/swaps") ? "text-blue-600" : "text-gray-700"
              } hover:text-blue-600`}
            >
              My Swaps
            </Link>
            <Link
              to="/search"
              className={`${
                isActive("/search") ? "text-blue-600" : "text-gray-700"
              } hover:text-blue-600`}
            >
              Search
            </Link>
            <Link
              to="/matches"
              className={`${
                isActive("/matches") ? "text-blue-600" : "text-gray-700"
              } hover:text-blue-600`}
            >
              Matches
            </Link>
            <Link
              to="/chat"
              className={`${
                isActive("/chat") ? "text-blue-600" : "text-gray-700"
              } hover:text-blue-600`}
            >
              Chat
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative text-gray-700 hover:text-blue-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
