import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import { getAllReports, resolveReport } from "./adminSlice";

const Reports = () => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.admin);
  const [filters, setFilters] = useState({ status: "all", targetType: "all" });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveAction, setResolveAction] = useState("");

  useEffect(() => {
    loadReports();
  }, [dispatch, filters]);

  const loadReports = () => {
    const queryFilters = {};
    if (filters.status !== "all") queryFilters.status = filters.status;
    dispatch(getAllReports(queryFilters));
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleResolveClick = (report) => {
    setSelectedReport(report);
    setShowResolveModal(true);
  };

  const handleResolveConfirm = async () => {
    if (!resolveAction) return;

    await dispatch(resolveReport({ reportId: selectedReport._id, action: resolveAction }));
    setShowResolveModal(false);
    setSelectedReport(null);
    setResolveAction("");
    loadReports();
  };

  const getTargetSummary = (report) => {
    if (report.targetType === "user") {
      return report.targetUser?.name || "Unknown User";
    } else if (report.targetType === "swap") {
      return report.targetSwap ? `${report.targetSwap.sender?.name} → ${report.targetSwap.receiver?.name}` : "(Deleted)";
    }
    return "Unknown";
  };

  const filteredReports = reports.filter(report => {
    if (filters.targetType !== "all" && report.targetType !== filters.targetType) return false;
    return true;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Reports Management</h1>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="mt-1 rounded border border-gray-300 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Target Type</label>
          <select
            value={filters.targetType}
            onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
            className="mt-1 rounded border border-gray-300 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="swap">Swap</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Reported By</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Target Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Target Summary</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Created Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report._id} className={report.status === "pending" ? "bg-yellow-50" : ""}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {report._id.slice(-8)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {report.reportedBy?.name}<br />
                  <span className="text-xs text-gray-400">{report.reportedBy?.email}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 capitalize">
                  {report.targetType}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {getTargetSummary(report)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {report.reason}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${
                    report.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleViewDetails(report)}
                      variant="secondary"
                      size="sm"
                    >
                      View
                    </Button>
                    {report.status === "pending" && (
                      <Button
                        onClick={() => handleResolveClick(report)}
                        variant="primary"
                        size="sm"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReports.length === 0 && (
        <div className="mt-8 rounded-lg border bg-white p-8 text-center shadow">
          <p className="text-gray-600">No reports found</p>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Reporter</h4>
              <p>{selectedReport.reportedBy?.name} ({selectedReport.reportedBy?.email})</p>
            </div>
            <div>
              <h4 className="font-semibold">Target</h4>
              <p>Type: {selectedReport.targetType}</p>
              <p>Summary: {getTargetSummary(selectedReport)}</p>
            </div>
            <div>
              <h4 className="font-semibold">Reason</h4>
              <p>{selectedReport.reason}</p>
            </div>
            <div>
              <h4 className="font-semibold">Status</h4>
              <p>{selectedReport.status}</p>
            </div>
            <div>
              <h4 className="font-semibold">Created</h4>
              <p>{new Date(selectedReport.createdAt).toLocaleString()}</p>
            </div>
            {selectedReport.status === "resolved" && (
              <div>
                <h4 className="font-semibold">Resolved</h4>
                <p>Action: {selectedReport.actionTaken}</p>
                <p>By: {selectedReport.resolvedBy?.name}</p>
                <p>At: {new Date(selectedReport.resolvedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Report"
      >
        {selectedReport && (
          <div className="space-y-4">
            <p>Choose an action for this report:</p>
            <div className="space-y-2">
              {selectedReport.targetType === "user" && (
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="block-user"
                    checked={resolveAction === "block-user"}
                    onChange={(e) => setResolveAction(e.target.value)}
                    className="mr-2"
                  />
                  Block User
                </label>
              )}
              {selectedReport.targetType === "swap" && (
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="delete-swap"
                    checked={resolveAction === "delete-swap"}
                    onChange={(e) => setResolveAction(e.target.value)}
                    className="mr-2"
                  />
                  Delete Swap
                </label>
              )}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="action"
                  value="none"
                  checked={resolveAction === "none"}
                  onChange={(e) => setResolveAction(e.target.value)}
                  className="mr-2"
                />
                No Action
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowResolveModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResolveConfirm}
                variant="primary"
                disabled={!resolveAction}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;

