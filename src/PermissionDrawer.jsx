// PermissionDrawer.jsx
import React, { useEffect, useState } from 'react';
import api from './api';
import toast from 'react-hot-toast';

const PermissionDrawer = ({ userId, isOpen, onClose }) => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    fetchAllPermissions();
    fetchUserPermissions();
  }, [isOpen, userId]);

  const fetchAllPermissions = async () => {
    try {
      const res = await api.get('/users/permissions');
      const filterd_all = res.data.map((d) => d.name);
      console.log(filterd_all);

      setAllPermissions(filterd_all);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const res = await api.get(`/users/${userId}/permissions`);
      setUserPermissions(res.data.permission);
    } catch (err) {
      console.error('Failed to load user permissions:', err);
    }
  };

  const handleTogglePermission = async (perm) => {
    try {
      const updatedPermissions = userPermissions.includes(perm)
        ? userPermissions.filter((p) => p !== perm)
        : [...userPermissions, perm];
      setUserPermissions(updatedPermissions);
      await api.put(`/users/${userId}/permissions`, { permissions: updatedPermissions });
      toast.success('Permissions updated');
    } catch (error) {
      toast.error('Failed to update');
      console.error(error);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg border-l z-50 transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Permissions</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
        {allPermissions.map((perm) => (
          <div key={perm}>
            <label>
              <input
                type="checkbox"
                value={perm}
                checked={Array.isArray(userPermissions) && userPermissions.includes(perm)}
                onChange={() => handleTogglePermission(perm)}
              />
              {perm}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionDrawer;
