import React from 'react';
import { useAuth } from './AuthContext';
import UploadDak from './UploadDak';
import ForwardDak from './ForwardDak';
import DakReports from './DakReports';
import SendReminder from './SendReminder';
import UserActions from './UserActions';

export default function Dashboard() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const { name, role, permissions } = user;

  const hasPermission = (p) => role === 'admin' || role === 'Admin' || permissions.includes('ALL') || permissions.includes(p);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Welcome {name} ({role})</h1>
        <button className="px-4 py-2 mb-6 bg-red-500 text-white rounded" onClick={logout}>Logout</button>

        {hasPermission('UPLOAD') && <UploadDak />}
        {hasPermission('FORWARD') && <ForwardDak />}
        {hasPermission('REPORT') && <DakReports />}
        {hasPermission('REMINDER') && <SendReminder />}
        {(hasPermission('READ') || hasPermission('ACTION') || hasPermission('REQUEST_ADVICE')) && (
          <UserActions />
        )}
      </div>
    </div>
  );
}
