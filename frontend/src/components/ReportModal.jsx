import { useState } from "react";
import { useDispatch } from "react-redux";
import { createReport } from "../features/users/userSlice";
import Button from "./Button";
import Modal from "./Modal";

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await dispatch(createReport({
        targetType,
        targetId,
        reason: reason.trim(),
        description: description.trim()
      }));
      onClose();
      setReason("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create report:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportReasons = [
    "Inappropriate behavior",
    "Spam or harassment",
    "Fake profile",
    "Skill misrepresentation",
    "No-show on swap",
    "Poor quality service",
    "Other"
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetType}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            You are reporting: <strong>{targetName}</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for report *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">Select a reason</option>
            {reportReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional details (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about the issue..."
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !reason.trim()}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportModal;