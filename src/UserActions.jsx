// src/UserActions.jsx

import React, { useEffect, useState } from 'react';
import api from './api';
import Select from 'react-select';
import DakTracking from './DakTracking';

export default function UserActions() {
  const [dakId, setDakId] = useState('');
  const [action, setAction] = useState('');
  const [advice, setAdvice] = useState('');
  const [msg, setMsg] = useState('');
  const [reports, setReports] = useState([]);
  const [daks, setDaks] = useState('');

  useEffect(() => {
    const fetchDaak = async () => {
      setMsg('');
      try {
        const res = await api.get('dak/user-reports')
        const opt = res.data.map((dak) => ({
          value: dak._id,
          label: dak.subject
        }));
        setDaks(opt);
      } catch (err) {
        console.log(err);
        setMsg('Error');
      }
    }


    fetchDaak();

  }, []);

  const markAction = async () => {
    setMsg('');
    try {
      if (!dakId) {
        setMsg('Dak ID is required');
        return;
      }
      await api.post('/dak/mark-action', { dakId, action });
      setMsg('Action marked successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Action failed');
    }
  };

  const requestAdvice = async () => {
    setMsg('');
    try {
      if (!dakId) {
        setMsg('Dak ID is required');
        return;
      }
      await api.post('/dak/request-advice', { dakId, query: advice });
      setMsg('Advice request sent!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Advice request failed');
    }
  };

  const downloadDak = async () => {
    setMsg('');
    try {
      if (!dakId) {
        setMsg('Dak ID is required');
        return;
      }
      const res = await api.get(`/dak/download/${dakId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dak_${dakId}.pdf`);
      document.body.appendChild(link);
      link.click();
      setMsg('Download started.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Download failed');
    }
  };

  const getReports = async () => {
    setMsg('');
    try {
      const res = await api.get('/dak/user-reports?type=received');
      setReports(res.data);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Reports load failed');
    }
  };

  return (
    <div className="mb-4 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">User Actions</h2>
      {msg && <p className="mb-2">{msg}</p>}

      <div className="mb-2">
        <Select
          options={daks}
          onChange={(selected) => setDakId(selected?.value)}
          placeholder="Search Daak by subject..."
          className="mb-4"
        />

        <input
          type="text"
          placeholder="Action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border p-1 mr-2"
        />
        <button
          onClick={markAction}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Mark Action
        </button>
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Advice Query"
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          className="border p-1 mr-2"
        />
        <button
          onClick={requestAdvice}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Request Advice
        </button>
      </div>

      <div className="mb-2">
        <button
          onClick={downloadDak}
          className="px-3 py-1 bg-purple-600 text-white rounded mr-2"
        >
          Download Dak
        </button>
        <button
          onClick={getReports}
          className="px-3 py-1 bg-gray-800 text-white rounded"
        >
          Load My Reports
        </button>
      </div>

      {reports.length > 0 && (
        <table className="min-w-full text-left border mt-4">
          <thead>
            <tr>
              <th className="border px-2 py-1">Daak ID</th>
              <th className="border px-2 py-1">Daak Subject</th>
              <th className="border px-2 py-1">Uploaded By</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Track</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((dak) => (
              <tr key={dak._id}>
                <td className="border px-2 py-1">{dak.mail_id}</td>
                <td className="border px-2 py-1">{dak.subject}</td>
                <td className="border px-2 py-1">{dak.uploadedBy?.name}</td>
                <td className="border px-2 py-1">{dak.status}</td>
                <td className="border px-2 py-1"><DakTracking dakId={dak.s_id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
