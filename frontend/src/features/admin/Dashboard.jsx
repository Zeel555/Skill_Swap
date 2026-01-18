import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminDashboard } from "./adminSlice";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminDashboard());
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {dashboard && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* User Statistics */}
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-800">
              {dashboard.users?.total || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-green-600">
              {dashboard.users?.active || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Blocked Users</p>
            <p className="text-3xl font-bold text-red-600">
              {dashboard.users?.blocked || 0}
            </p>
          </div>

          {/* Swap Statistics */}
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Total Swaps</p>
            <p className="text-3xl font-bold text-gray-800">
              {dashboard.swaps?.total || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Pending Swaps</p>
            <p className="text-3xl font-bold text-yellow-600">
              {dashboard.swaps?.pending || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Accepted Swaps</p>
            <p className="text-3xl font-bold text-blue-600">
              {dashboard.swaps?.accepted || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Completed Swaps</p>
            <p className="text-3xl font-bold text-green-600">
              {dashboard.swaps?.completed || 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Rejected Swaps</p>
            <p className="text-3xl font-bold text-red-600">
              {dashboard.swaps?.rejected || 0}
            </p>
          </div>

          {/* Additional Stats */}
          <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Total Skills Offered</p>
            <p className="text-3xl font-bold text-purple-600">
              {dashboard.skills?.totalOffered || 0}
            </p>
          </div>
          {/* <div className="rounded-lg border bg-white p-6 shadow">
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-3xl font-bold text-indigo-600">
              {dashboard.ratings?.average ? dashboard.ratings.average.toFixed(1) : "0.0"}
            </p>
          </div> */}
        </div>
      )}

      {/* Quick Actions */}
      {/* <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Admin Features</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a href="/admin/users" className="rounded-lg border bg-white p-4 text-left shadow hover:bg-gray-50">
            <h3 className="font-semibold text-gray-800">Manage Users</h3>
            <p className="text-sm text-gray-600">Promote, block, or delete users</p>
          </a>
          <a href="/admin/reports" className="rounded-lg border bg-white p-4 text-left shadow hover:bg-gray-50">
            <h3 className="font-semibold text-gray-800">Review Reports</h3>
            <p className="text-sm text-gray-600">Handle user reports and take actions</p>
          </a>
          <a href="/admin/swaps" className="rounded-lg border bg-white p-4 text-left shadow hover:bg-gray-50">
            <h3 className="font-semibold text-gray-800">Monitor Swaps</h3>
            <p className="text-sm text-gray-600">View and manage all skill swaps</p>
          </a>
          <a href="/admin/notifications" className="rounded-lg border bg-white p-4 text-left shadow hover:bg-gray-50">
            <h3 className="font-semibold text-gray-800">Send Notifications</h3>
            <p className="text-sm text-gray-600">Send notifications to users</p>
          </a>
          <a href="/admin/history" className="rounded-lg border bg-white p-4 text-left shadow hover:bg-gray-50">
            <h3 className="font-semibold text-gray-800">View History</h3>
            <p className="text-sm text-gray-600">See all swaps and reports history</p>
          </a>
        </div>
      </div> */}
    </div>
  );
};

export default AdminDashboard;

