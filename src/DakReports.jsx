import React, { useState } from 'react';
import api from './api';
import DakTracking from './DakTracking';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaSpinner } from 'react-icons/fa';

export default function DakReports() {
  const [type, setType] = useState('received');
  const [reports, setReports] = useState([]);
  const [trackingDakId, setTrackingDakId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (reportType) => {
    setLoading(true);
    try {
      const res = await api.get(`/dak/report?type=${reportType}`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReports(sorted);
      setType(reportType);
      toast.success('Reports loaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Dak Reports', 14, 20);
    const rows = reports.map((dak, index) => [
      index + 1,
      dak.mail_id,
      dak.subject,
      dak.letterNumber || '',
      dak.lab || '',
      dak.source || '',
      new Date(dak.createdAt).toLocaleDateString(),
    ]);
    autoTable(doc, {
      head: [['Sno', 'Dak ID', 'Subject', 'Letter Number', 'Lab', 'Source', 'Date']],
      body: rows,
    });
    doc.save('dak-reports.pdf');
  };

  const downloadAllPDFs = async (dakId) => {
    try {
      const res = await api.get(`/dak/download-all/${dakId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dak_${dakId}_all_pdfs.zip`);
      document.body.appendChild(link);
      link.click();
      toast.success('Download started');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  const columns = [
    {
      name: 'Sno',
      cell: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'Dak ID',
      selector: (row) => row.mail_id,
      sortable: true,
    },
    {
      name: 'Subject',
      selector: (row) => row.subject,
      sortable: true,
    },
    {
      name: 'Letter Number',
      selector: (row) => row.letterNumber || '',
      sortable: true,
    },
    {
      name: 'Lab',
      selector: (row) => row.lab || '',
      sortable: true,
    },
    {
      name: 'Source',
      selector: (row) => row.source || '',
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Track',
      cell: (row) => (
        <button
          onClick={() => setTrackingDakId(row._id)}
          className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
        >
          Track
        </button>
      ),
    },
    {
      name: 'Download',
      cell: (row) => (
        <button
          onClick={() => downloadAllPDFs(row._id)}
          className="px-2 py-1 bg-purple-600 text-white rounded text-xs"
        >
          Download
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Dak Reports</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => fetchReports('received')}
          disabled={loading}
          className={`px-4 py-1 rounded ${type === 'received' ? 'bg-blue-700' : 'bg-blue-600'} text-white`}
        >
          {loading && type === 'received' ? (
            <FaSpinner className="animate-spin inline mr-2" />
          ) : null}
          Received
        </button>

        <button
          onClick={() => fetchReports('sent')}
          disabled={loading}
          className={`px-4 py-1 rounded ${type === 'sent' ? 'bg-green-700' : 'bg-green-600'} text-white`}
        >
          {loading && type === 'sent' ? (
            <FaSpinner className="animate-spin inline mr-2" />
          ) : null}
          Sent
        </button>

        {reports.length > 0 && (
          <button
            onClick={exportPDF}
            className="px-4 py-1 bg-gray-800 text-white rounded"
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
