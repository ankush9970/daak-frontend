import React, { useEffect, useState } from 'react';
import api from './api';

export default function DakTracking({ dakId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/dak/${dakId}/tracking`);
        setLogs(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [dakId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {logs.map(log => (
        <div key={log._id} className="p-2 border-b">
          <p className="font-bold">{log.action} by {log.actor.name}</p>
          <p className="text-sm">{log.details}</p>
          <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
