import React, { useState } from 'react';
import api from './api';

export default function ForwardDak() {
  const [dakId, setDakId] = useState('');
  const [userId, setUserId] = useState('');
  const [advice, setAdvice] = useState('');
  const [msg, setMsg] = useState('');

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
        <input type="text" placeholder="Dak ID" value={dakId} onChange={(e) => setDakId(e.target.value)} className="border p-1 mr-2" />
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="border p-1 mr-2" />
        <input type="text" placeholder="Advice" value={advice} onChange={(e) => setAdvice(e.target.value)} className="border p-1 mr-2" />
        <button className="px-4 py-1 bg-green-600 text-white rounded" type="submit">Forward</button>
      </form>
    </div>
  );
}
