import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSwaps, deleteSwap } from "./adminSlice";
import Loader from "../../components/Loader";

const SwapsTable = () => {
  const dispatch = useDispatch();
  const { swaps, loading } = useSelector((state) => state.admin);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getAllSwaps(statusFilter || undefined));
  }, [dispatch, statusFilter]);

  const handleDelete = async (swapId) => {
    if (window.confirm("Are you sure you want to delete this swap?")) {
      await dispatch(deleteSwap(swapId));
      dispatch(getAllSwaps(statusFilter || undefined));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Swap Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-gray-300 px-4 py-2"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Sender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Receiver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {swaps.map((swap) => (
              <tr key={swap._id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {swap.sender?.name || "Unknown"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {swap.receiver?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>
                    <p className="text-xs">
                      {swap.skillOffered} ↔ {swap.skillRequested}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      swap.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : swap.status === "accepted"
                        ? "bg-blue-100 text-blue-800"
                        : swap.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {swap.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(swap.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => handleDelete(swap._id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SwapsTable;

