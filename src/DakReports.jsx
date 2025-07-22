
import React, { useState } from 'react';
import api from './api';

export default function DakReports() {
  const [type, setType] = useState('sent');
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState('');

  const fetchReports = async () => {
    setMsg('');
    try {
      const res = await api.get(`/dak/report?type=${type}`);
      setReports(res.data);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to load reports');
    }
  };

  return (
    <div className="mb-4 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">Dak Reports</h2>

      <div className="flex items-center mb-4">
        <select
          className="border px-2 py-1 mr-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="sent">Sent</option>
          <option value="received">Received</option>
        </select>

        <button
          className="px-4 py-1 bg-blue-600 text-white rounded"
          onClick={fetchReports}
        >
          Fetch Reports
        </button>
      </div>

      {msg && <p className="text-red-600">{msg}</p>}

      {reports.length > 0 && (
        <table className="min-w-full text-left border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Dak ID</th>
              <th className="border px-2 py-1">Subject</th>
              <th className="border px-2 py-1">Uploaded By</th>
              <th className="border px-2 py-1">Forwarded To</th>
              <th className="border px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((dak) => (
              <tr key={dak._id}>
                <td className="border px-2 py-1">{dak.mail_id}</td>
                <td className="border px-2 py-1">{dak.subject}</td>
                <td className="border px-2 py-1">{dak.uploadedBy?.name}</td>
                <td className={dak.forwardedTo?.name?"border px-2 py-1":"border px-2 py-1 text-red-700"}>{dak.forwardedTo?.name?dak.forwardedTo?.name:'Not Forwardeds to anyone'}</td>
                <td className="border px-2 py-1">{dak.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
