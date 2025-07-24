import React, { useEffect, useState } from 'react';
import api from './api';
import Select from 'react-select';
import toast from 'react-hot-toast';
import DataTable from 'react-data-table-component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function UserActions() {
  const [dakId, setDakId] = useState('');
  const [action, setAction] = useState('');
  const [advice, setAdvice] = useState('');
  const [reports, setReports] = useState([]);
  const [daks, setDaks] = useState([]);
  const [trackingLogs, setTrackingLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalDakId, setModalDakId] = useState('');

  useEffect(() => {
    const fetchDaks = async () => {
      try {
        const res = await api.get('/dak/user-reports');
        const options = res.data.map((dak) => ({
          value: dak._id,
          label: `${dak.subject} (${dak.mail_id})`,
        }));
        setDaks(options);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load Daks');
      }
    };
    fetchDaks();
  }, []);

  const markAction = async () => {
    if (!dakId || !action.trim()) {
      toast.error('Dak and Action are required.');
      return;
    }
    try {
      await api.post('/dak/mark-action', { dakId, action });
      toast.success('Action marked successfully!');
      setAction('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const requestAdvice = async () => {
    if (!dakId || !advice.trim()) {
      toast.error('Dak and Advice Query are required.');
      return;
    }
    try {
      await api.post('/dak/request-advice', { dakId, query: advice });
      toast.success('Advice request sent!');
      setAdvice('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Advice request failed');
    }
  };

  const downloadDak = async () => {
    if (!dakId) {
      toast.error('Select a Dak first.');
      return;
    }
    try {
      const res = await api.get(`/dak/download/${dakId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dak_${dakId}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Download started.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  const getReports = async () => {
    try {
      const res = await api.get('/dak/user-reports?type=received');
      setReports(res.data);
      toast.success('Reports loaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reports load failed');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('User Dak Reports', 14, 16);
    const tableColumn = ["Daak ID", "Subject", "Uploaded By", "Status"];
    const tableRows = [];

    reports.forEach((dak) => {
      const row = [
        dak.mail_id,
        dak.subject,
        dak.uploadedBy?.name || 'N/A',
        dak.status
      ];
      tableRows.push(row);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save(`User_Dak_Reports_${new Date().getTime()}.pdf`);
  };

  const openTrackingModal = async (dakId) => {
    try {
      const res = await api.get(`/dak/${dakId}/tracking`);
      const logs = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTrackingLogs(logs);
      setModalDakId(dakId);
      setShowModal(true);
    } catch (err) {
      toast.error('Failed to load tracking logs');
    }
  };

  const columns = [
    { name: 'Daak ID', selector: row => row.mail_id, sortable: true },
    { name: 'Subject', selector: row => row.subject, sortable: true },
    { name: 'Uploaded By', selector: row => row.uploadedBy?.name || '', sortable: true },
    { name: 'Status', selector: row => row.status, sortable: true },
    {
      name: 'Track',
      cell: row => (
        <button
          onClick={() => openTrackingModal(row._id)}
          className="text-blue-600 underline"
        >
           Track
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded shadow w-full">
      <h2 className="text-2xl font-semibold mb-4">User Actions</h2>

      <div className="mb-4">
        <Select
          options={daks}
          value={daks.find(opt => opt.value === dakId) || null}
          onChange={(selected) => setDakId(selected?.value)}
          placeholder="Search Dak by subject..."
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter Action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={markAction}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
             Mark Action
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter Advice Query"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={requestAdvice}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
             Request Advice
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={downloadDak}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Download Dak
          </button>
          <button
            onClick={getReports}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
          >
             Load My Reports
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
             Export PDF
          </button>
        </div>
      </div>

      {reports.length > 0 && (
        <DataTable
          columns={columns}
          data={reports}
          pagination
          highlightOnHover
          striped
          dense
          persistTableHead
          responsive
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-full max-w-xl p-6 relative">
            <h3 className="text-xl font-semibold mb-4">📍 Dak Tracking Logs</h3>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-700 hover:text-red-600"
            >
             Close
            </button>
            <div className="max-h-96 overflow-y-auto">
              {trackingLogs.length > 0 ? trackingLogs.map(log => (
                <div key={log._id} className="mb-4 border-b pb-2">
                  <p><strong>{log.action}</strong> by {log.actor?.name}</p>
                  <p className="text-sm">{log.details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              )) : <p>No logs found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
