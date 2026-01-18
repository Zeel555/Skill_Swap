import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminHistory } from "./adminSlice";
import Loader from "../../components/Loader";

const History = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminHistory());
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Admin History</h1>

      {/* Swaps History */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">All Swaps</h2>
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.swaps?.map((swap) => (
                <tr key={swap._id}>
                  <td className="px-6 py-4 text-sm">{swap.sender?.name || "Unknown"}</td>
                  <td className="px-6 py-4 text-sm">{swap.receiver?.name || "Unknown"}</td>
                  <td className="px-6 py-4 text-sm">
                    {swap.skillOffered} ↔ {swap.skillRequested}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`rounded px-2 py-1 text-xs ${
                      swap.status === "completed" ? "bg-green-100 text-green-800" :
                      swap.status === "accepted" ? "bg-blue-100 text-blue-800" :
                      swap.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {swap.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(swap.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports History */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">All Reports</h2>
        <div className="space-y-4">
          {history.reports?.map((report) => (
            <div key={report._id} className="rounded-lg border bg-white p-4 shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Type: {report.targetType}</p>
                  <p className="text-sm text-gray-600">{report.reason}</p>
                  <p className="text-xs text-gray-500">
                    By: {report.reportedBy?.name} | {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`rounded px-2 py-1 text-xs ${
                  report.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;

