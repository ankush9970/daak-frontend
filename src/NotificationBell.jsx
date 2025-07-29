// src/NotificationBell.jsx

import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import api from './api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load notifications on mount + every 30s
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/dak/my-notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unseen = notifications.some((n) => !n.seen);

  const toggleNotifications = async () => {
    setTimeout(async() => {
    if (!showNotifications && unseen) {
      try {
        await api.put('/dak/mark-seen');
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, seen: true }))
        );
      } catch (err) {
        console.error(err);
      }
    }  
    }, 5000);
    
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="relative">
      <button onClick={toggleNotifications} className="relative">
        <FaBell className="w-5 h-5 text-gray-700" />
        {unseen && (
          <span className="absolute -top-1 -right-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-white border shadow-lg rounded z-50">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500">No notifications</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={n.seen?"border-b px-4 py-2 text-sm hover:bg-gray-100":"border-b px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"}
                >
                  {n.message}
                  <div className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString('en-gb')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
