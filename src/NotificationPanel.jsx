import React, { useEffect, useState } from "react";
import api from "./api";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my-notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}, []);

const markNotificationsSeen = async () => {
  try {
    await api.put('/notifications/mark-seen');
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, seen: true }))
    );
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="p-4 bg-white shadow rounded w-full max-w-md">
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n._id} className="border-b py-2">
              <p>{n.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleString('en-gb')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
