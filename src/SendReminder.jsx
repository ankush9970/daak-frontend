// src/SendReminder.jsx

import React, { useState } from 'react';
import api from './api';

export default function SendReminder() {
  const [dakId, setDakId] = useState('');
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');

  const handleReminder = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      await api.post('/dak/reminder', { dakId, message });
      setMsg('Reminder sent successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Reminder failed');
    }
  };

  return (
    <div className="mb-4 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">Send Reminder</h2>
      {msg && <p className="mb-2">{msg}</p>}

      <form onSubmit={handleReminder}>
        <input
          type="text"
          placeholder="Dak ID"
          value={dakId}
          onChange={(e) => setDakId(e.target.value)}
          className="border p-1 mr-2"
        />
        <input
          type="text"
          placeholder="Reminder Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-1 mr-2"
        />
        <button
          className="px-4 py-1 bg-yellow-600 text-white rounded"
          type="submit"
        >
          Send Reminder
        </button>
      </form>
    </div>
  );
}
