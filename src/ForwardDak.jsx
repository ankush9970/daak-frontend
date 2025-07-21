import React, { useState, useEffect } from 'react';
import api from './api';

export default function ForwardDak() {
  const [dakId, setDakId] = useState('');
  const [userId, setUserId] = useState('');
  const [advice, setAdvice] = useState('');
  const [msg, setMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [daks, setDaks] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchDaks = async () => {
      try {
        const res = await api.get('/dak/list');
        setDaks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDaks();
  }, []);

  const handleForward = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      await api.post('/dak/forward', { dakId, userId, advice });
      setMsg('Dak forwarded successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Forward failed');
    }
  };

  return (
    <div className="mb-4 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">Forward Dak</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={handleForward}>
        <label className="block mb-1 font-semibold">Select Letter:</label>


        <select
          value={dakId}
          onChange={(e) => setDakId(e.target.value)}
          className="border p-2 mb-2 block w-full"
        >
          <option value="">-- Select Letter --</option>
          {daks.map((dak) => (
            <option key={dak._id} value={dak._id}>
              {dak.name} ({dak.email})
            </option>
          ))}
        </select>

        <label className="block mb-1 font-semibold">Select User:</label>

        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 mb-2 block w-full"
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>


        <input type="text" placeholder="Advice" value={advice} onChange={(e) => setAdvice(e.target.value)} className="border p-1 mr-2" />
        <button className="px-4 py-1 bg-green-600 text-white rounded" type="submit">Forward</button>
      </form>
    </div>
  );
}
