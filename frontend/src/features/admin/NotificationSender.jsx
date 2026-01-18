import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendAdminNotification } from "./adminSlice";

const NotificationSender = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.admin);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    const data = sendToAll ? { message } : { message, userId };
    
    try {
      await dispatch(sendAdminNotification(data)).unwrap();
      setSuccess(true);
      setMessage("");
      setUserId("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert(error || "Failed to send notification");
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Send Notification
      </h2>

      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-800">
          Notification sent successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Send to:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={sendToAll}
                onChange={() => setSendToAll(true)}
                className="mr-2"
              />
              All Users
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!sendToAll}
                onChange={() => setSendToAll(false)}
                className="mr-2"
              />
              Specific User
            </label>
          </div>
        </div>

        {!sendToAll && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              User ID:
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Enter user ID"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2"
            placeholder="Enter notification message"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </form>
    </div>
  );
};

export default NotificationSender;

