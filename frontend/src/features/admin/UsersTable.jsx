import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { blockUser, deleteUser, getAllUsers } from "./adminSlice";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersTable = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    type: null, 
    userId: null, 
    data: null 
  });

  useEffect(() => {
    dispatch(getAllUsers({ page, limit: 10 }));
  }, [dispatch, page]);

  const handleBlockToggle = (userId, isBlocked) => {
    setConfirmModal({
      isOpen: true,
      type: "block",
      userId,
      data: { isBlocked: !isBlocked }
    });
  };

  const confirmBlockToggle = async () => {
    const { userId, data } = confirmModal;
    await dispatch(blockUser({ userId, isBlocked: data.isBlocked }));
    setConfirmModal({ isOpen: false, type: null, userId: null, data: null });
    dispatch(getAllUsers({ page, limit: 10 }));
  };

  const handleDeleteUser = (userId) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      userId,
      data: null
    });
  };

  const confirmDeleteUser = async () => {
    const { userId } = confirmModal;
    await dispatch(deleteUser(userId));
    setConfirmModal({ isOpen: false, type: null, userId: null, data: null });
    dispatch(getAllUsers({ page, limit: 10 }));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">User Management</h1>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className={user.isBlocked ? "opacity-50" : ""}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 capitalize">
                  {user.role}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      user.isBlocked
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.role === "admin" ? (
                    "—"
                  ) : user.averageRating == null ? (
                    "No ratings"
                  ) : (
                    <>⭐ {user.averageRating.toFixed(1)}</>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        user.isBlocked
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {pagination.pages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          disabled={page === pagination.pages}
          className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === "block"}
        onClose={() => setConfirmModal({ isOpen: false, type: null, userId: null, data: null })}
        onConfirm={confirmBlockToggle}
        title={confirmModal.data?.isBlocked ? "Block User" : "Unblock User"}
        message={`Are you sure you want to ${confirmModal.data?.isBlocked ? "block" : "unblock"} this user?`}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === "delete"}
        onClose={() => setConfirmModal({ isOpen: false, type: null, userId: null, data: null })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone. All user data, swaps, and ratings will be removed."
      />
    </div>
  );
};

export default UsersTable;

