// ChangePasswordModal.jsx
import React, { useState } from 'react';
import api from './api';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({ onClose }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.put('/users/change-password', { oldPassword: oldPass, newPassword: newPass });
      toast.success('Password updated successfully!');
      setOldPass('');
      setNewPass('');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update password');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Old Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">New Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>

          {msg && <p className="text-sm text-green-600">{msg}</p>}

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
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
