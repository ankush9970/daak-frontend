import React, { useEffect, useState } from 'react';
import api from './api';
import Select from 'react-select';
import toast from 'react-hot-toast';
import DataTable from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaSpinner } from 'react-icons/fa';

export default function UserActions() {
  const [dakId, setDakId] = useState('');
  const [action, setAction] = useState('');
  const [advice, setAdvice] = useState('');
  const [reports, setReports] = useState([]);
  const [daks, setDaks] = useState([]);
  const [trackingLogs, setTrackingLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalDakId, setModalDakId] = useState('');
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState([]);

  useEffect(() => {
    const fetchDaks = async () => {
      try {
        const res = await api.get('/dak/user-reports');
        // const sorted = ;
        const options = res.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          ).filter((d) => d.status !== 'completed').map((dak) => ({
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

  const downloadDak = async (id) => {
    if (!dakId && !id) {
      toast.error('Select a Dak first.');
      return;
    }
    const finalId = dakId || id;
    setLoadingDownload(true);
    try {
      const res = await api.get(`/dak/download/${finalId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dak_${dakId}_all_pdfs.zip`);
      document.body.appendChild(link);
      link.click();
      toast.success('Download started.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setLoadingDownload(false);
    }
  };

  const getReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get('/dak/user-reports?type=received');
      setReports(res.data);
      toast.success('Reports loaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reports load failed');
    } finally {
      setLoadingReports(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('User Dak Reports', 7, 8);
    const rows = reports.map((dak, index) => [
      index + 1,
      dak.mail_id,
      dak.subject,
      dak.letterNumber || '',
      dak.lab || '',
      dak.source || '',
      new Date(dak.createdAt).toLocaleDateString('en-gb'),
    ]);
    autoTable(doc, {
      head: [['Sno', 'Dak ID', 'Subject', 'Letter Number', 'Lab', 'Source', 'Date']],
      body: rows,
    });
    doc.save(`User_Dak_Reports_${new Date().getTime()}.pdf`);
  };

  const openTrackingModal = async (dakId) => {
    try {

      setLoadingTracks(true);
      const res = await api.get(`/dak/${dakId}/tracking`);
      const logs = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTrackingLogs(logs);
      setShowModal(true);
      setLoadingTracks(false);
      setModalDakId(dakId);
    } catch (err) {
      setShowModal(false);
      toast.error('Failed to load tracking logs');
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
      name: 'Status',
      selector: (row) => row.status || '',
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => new Date(row.createdAt).toLocaleDateString('en-gb'),
      sortable: true,
    },
    {
      name: 'Track',
      cell: (row) => (
        <button
          onClick={() => openTrackingModal(row._id)}
          key={row._id}
          disabled={loadingTracks}
          className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
        >
          {loadingTracks && <FaSpinner className="inline animate-spin mr-2" />}
          Track
        </button>
      ),
    },
    {
      name: 'Download',
      cell: (row) => (
        <button
          onClick={() => downloadDak(row._id)}
          className="px-2 py-1 bg-purple-600 text-white rounded text-xs"
        >
          Download
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
          placeholder="Search Pending Dak by subject..."
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
          {/* <button
            onClick={downloadDak}
            disabled={loadingDownload}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            {loadingDownload && <FaSpinner className="inline animate-spin mr-2" />}
            Download Dak
          </button> */}
          {/* <button
            onClick={getReports}
            disabled={loadingReports}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
          >
            {loadingReports && <FaSpinner className="inline animate-spin mr-2" />}
            Load Reports
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button> */}
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
            <h3 className="text-xl font-semibold mb-4">Dak Tracking Logs</h3>
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
