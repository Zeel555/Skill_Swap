import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserDashboard, getProfile } from "../features/users/userSlice";
import { getMySwaps } from "../features/swaps/swapSlice";
import { getNotifications } from "../features/notifications/notificationSlice";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import Loader from "../components/Loader";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { profile, dashboard, loading } = useSelector((state) => state.user);
  const { swaps } = useSelector((state) => state.swap);
  const { notifications } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(getProfile());
    dispatch(getUserDashboard());
    dispatch(getMySwaps());
    dispatch(getNotifications());
  }, [dispatch]);

  if (loading && !dashboard) {
    return <Loader />;
  }

  const recentSwaps = swaps.slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);

  const profileCompletion = profile
    ? calculateProfileCompletion(profile, dashboard?.completedSwaps || 0)
    : { percentage: 0, missingSteps: [] };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Profile Summary */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Profile Completion
          </h3>
          <div className="mb-2">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${profileCompletion.percentage}%` }}
              ></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {profileCompletion.percentage}%
          </p>
          {profileCompletion.missingSteps.length > 0 && (
            <div className="mt-2 space-y-1">
              {profileCompletion.missingSteps.slice(0, 2).map((step, idx) => (
                <p key={idx} className="text-xs text-gray-600">
                  {step.text}
                </p>
              ))}
            </div>
          )}
          <Link
            to="/profile/edit"
            className="mt-2 block text-sm text-blue-600 hover:underline"
          >
            Complete Profile →
          </Link>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Skills Offered
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {profile?.skillsOffered?.length || 0}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {profile?.skillsOffered?.join(", ") || "No skills yet"}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Skills Wanted
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {profile?.skillsWanted?.length || 0}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {profile?.skillsWanted?.join(", ") || "No skills yet"}
          </p>
        </div>
      </div>

      {/* Stats */}
      {dashboard && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Total Swaps</p>
            <p className="text-2xl font-bold text-gray-800">
              {dashboard.totalSwaps || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {dashboard.completedSwaps || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {dashboard.pendingSwaps || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Avg Rating</p>
            <p className="text-2xl font-bold text-blue-600">
              {dashboard.avgRating?.toFixed(1) || "N/A"}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Swaps */}
        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Recent Swaps</h2>
            <Link
              to="/swaps"
              className="text-sm text-blue-600 hover:underline"
            >
              View All →
            </Link>
          </div>
          {recentSwaps.length === 0 ? (
            <p className="text-gray-500">No swaps yet</p>
          ) : (
            <div className="space-y-3">
              {recentSwaps.map((swap) => (
                <div
                  key={swap._id}
                  className="rounded border p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {swap.sender?._id === profile?._id
                          ? swap.receiver?.name
                          : swap.sender?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {swap.skillOffered} ↔ {swap.skillRequested}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        swap.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : swap.status === "accepted"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {swap.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
            <Link
              to="/notifications"
              className="text-sm text-blue-600 hover:underline"
            >
              View All →
            </Link>
          </div>
          {recentNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded border p-3 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="text-sm text-gray-800">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
