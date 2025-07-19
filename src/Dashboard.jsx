import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const { name, role } = user;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {name} ({role})
        </h1>

        <button
          className="mb-6 px-4 py-2 bg-red-500 text-white rounded"
          onClick={logout}
        >
          Logout
        </button>

        {role === 'admin' && (
          <>
            <Panel title="Admin Panel" desc="Manage everything (ALL permissions)" />
            <Panel title="Head Panel" desc="Receive, forward, advise, report" />
            <Panel title="Distributor Panel" desc="Upload, send reminders" />
            <Panel title="User Panel" desc="Read, action, request advice, report" />
          </>
        )}

        {role === 'head' && (
          <Panel title="Head Panel" desc="Receive, forward, advise, report" />
        )}

        {role === 'distributor' && (
          <Panel title="Distributor Panel" desc="Upload, send reminders" />
        )}

        {role === 'user' && (
          <Panel title="User Panel" desc="Read, action, request advice, report" />
        )}
      </div>
    </div>
  );
}

const Panel = ({ title, desc }) => (
  <div className="mb-4 p-4 border rounded bg-gray-50">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p>{desc}</p>
  </div>
);
