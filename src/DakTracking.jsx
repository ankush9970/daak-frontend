import React, { useEffect, useState } from 'react';
import api from './api';

export default function DakTracking({ dakId }) {
  const [logs, setLogs] = useState([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/dak/${dakId}/tracking`);
        console.log(res.data);
        const opt = res.data;
        opt.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        setLogs(opt);
        setLoad(false);
      } catch (err) {
        console.log(err);
        setLoad(false);

      }
    };
    fetchLogs();
  }, [dakId]);

  return (
    <div className="p-4 border rounded">
      {load?<h2 className="text-m font-bold mb-2">Loading...</h2>:''}
      {logs.map((log) => (
        <div key={log._id} className="mb-2">
          <p><strong>{log.action}</strong> by {log.actor.name}</p>
          <p className="text-sm">{log.details}</p>
          <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('en-gb')}</p>
        </div>
      ))}
    </div>
  );
}
