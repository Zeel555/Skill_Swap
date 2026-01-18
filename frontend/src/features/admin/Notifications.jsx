import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendAdminNotification } from "./adminSlice";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";

const AdminNotifications = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetForm = () => {
    setMessage("");
    setUserId("");
  };

  const handleSendNotification = async () => {
    if (!message.trim()) return;

    try {
      await dispatch(
        sendAdminNotification({
          message: message.trim(),
          userId: userId.trim() || null, // ✅ clean handling
        })
      ).unwrap(); // ✅ important

      resetForm();
      setIsModalOpen(false);
      alert("✅ Notification sent successfully");
    } catch (err) {
      console.error("❌ Failed to send notification:", err);
      alert(err || "Failed to send notification");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Notifications
        </h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Send Notification
        </Button>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <p className="text-gray-600">
          Send system notifications to all users or a specific user.
          These notifications will appear in the user’s notification panel.
        </p>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          resetForm();
          setIsModalOpen(false);
        }}
        title="Send Notification"
      >
        <div className="space-y-4">
          {/* User ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              User ID (optional)
            </label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Leave empty to notify all users"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Enter notification message"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={loading || !message.trim()}
            >
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
