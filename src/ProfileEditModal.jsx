// ProfileEditModal.jsx
import React, { useState } from 'react';
import api from './api';

export default function ProfileEditModal({ user, onClose, onUpdated }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.put('/users/me', { name, email });
      onUpdated({ name, email });
      onClose();
    } catch (err) {
      console.error(err);
      setMsg('Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {msg && <p className="text-sm text-red-600">{msg}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
