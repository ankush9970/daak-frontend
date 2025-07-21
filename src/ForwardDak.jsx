import React, { useState, useEffect } from 'react';
import api from './api';

export default function ForwardDak() {
  const [dakId, setDakId] = useState('');
  const [userId, setUserId] = useState('');
  const [advice, setAdvice] = useState('');
  const [msg, setMsg] = useState('');
  const [daks, setDaks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load available Daks for Head
    const fetchDaks = async () => {
      try {
        const res = await api.get('/dak/list');
        setDaks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    // Load Users to forward to
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDaks();
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!dakId || !userId) {
      setMsg('Please select a Dak and User.');
      return;
    }

    try {
      const res = await api.post('/dak/forward', {
        dakId,
        userId,
        advice,
      });
      setMsg(res.data.message);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || 'Error forwarding Dak.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h2 className="text-xl mb-4">Forward Dak to User</h2>

      <label className="block mb-1 font-semibold">Select Dak:</label>
      <select
        value={dakId}
        onChange={(e) => setDakId(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">-- Select Dak --</option>
        {daks.map((dak) => (
          <option key={dak._id} value={dak._id}>
            {dak.filename}
          </option>
        ))}
      </select>

      <label className="block mb-1 font-semibold">Select User:</label>
      <select
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">-- Select User --</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>

      <label className="block mb-1 font-semibold">Advice (optional):</label>
      <textarea
        value={advice}
        onChange={(e) => setAdvice(e.target.value)}
        className="border p-2 mb-4 w-full"
        placeholder="Enter advice for user"
      ></textarea>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Forward Dak
      </button>

      {msg && <p className="mt-2">{msg}</p>}
    </form>
  );
}
