// ProfileEditModal.jsx
import React, { useState } from 'react';
import api from './api';
import toast from 'react-hot-toast';

export default function ProfileEditModal({ user, onClose, onUpdated }) {
  const [name, setName] = useState(user.name);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.put('/users/me', { name });
      onUpdated({ name });
      onClose();
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("failed to update");

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
              className="w-full border px-3 py-2 rounded bg-gray-200"
              value={user.email}
              readOnly
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
