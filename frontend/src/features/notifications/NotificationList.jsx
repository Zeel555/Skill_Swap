import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, markNotificationRead } from "./notificationSlice";
import Loader from "../../components/Loader";

const NotificationList = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(
    (state) => state.notification
  );

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkRead = async (id) => {
    await dispatch(markNotificationRead(id));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow">
          <p className="text-gray-600">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`rounded-lg border p-4 shadow ${
                !notification.isRead ? "bg-blue-50" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkRead(notification._id)}
                    className="ml-4 rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;

