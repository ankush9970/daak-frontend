import React, { useState } from 'react';
import api from './api';
import DakTracking from './DakTracking';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {autoTable} from 'jspdf-autotable';

export default function DakReports() {
  const [type, setType] = useState('sent');
  const [reports, setReports] = useState([]);
  const [trackingDakId, setTrackingDakId] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get(`/dak/report?type=${type}`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReports(sorted);
      toast.success('Reports loaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reports');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Dak Reports', 14, 20);
    const rows = reports.map(dak => [
      dak.mail_id,
      dak.subject,
      dak.uploadedBy?.name || '',
      dak.forwardedTo?.name || '',
      dak.status,
    ]);
    autoTable(doc, {
      head: [['Mail ID', 'Subject', 'Uploaded By', 'Forwarded To', 'Status']],
      body: rows,
    });
    doc.save('dak-reports.pdf');
  };

  const columns = [
    { name: 'Mail ID', selector: row => row.mail_id, sortable: true },
    { name: 'Subject', selector: row => row.subject, sortable: true },
    { name: 'Uploaded By', selector: row => row.uploadedBy?.name, sortable: true },
    { name: 'Forwarded To', selector: row => row.forwardedTo?.name || 'Not Forwarded', sortable: true },
    { name: 'Status', selector: row => row.status, sortable: true },
    {
      name: 'Track',
      cell: row => (
        <button
          onClick={() => setTrackingDakId(row._id)}
          className="px-2 py-1 bg-indigo-600 text-white rounded"
        >
          Track
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Dak Reports</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="border px-2 py-1"
          value={type}
          onChange={e => setType(e.target.value)}
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

        {reports.length > 0 && (
          <button
            className="px-4 py-1 bg-green-600 text-white rounded"
            onClick={exportPDF}
          >
            Export PDF
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={reports}
        pagination
        highlightOnHover
        dense
        persistTableHead
      />

      {/* Tracking Modal */}
      {trackingDakId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Dak Tracking</h3>
              <button
                onClick={() => setTrackingDakId(null)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <DakTracking dakId={trackingDakId} />
          </div>
        </div>
      )}
    </div>
  );
}
