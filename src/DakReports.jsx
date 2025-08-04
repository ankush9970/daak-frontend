import React, { useEffect, useState } from 'react';
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
  const [searchText, setSearchText] = useState('');


  useEffect(() => {
    // if (localStorage.getItem("role") === "user" ) {
    const userData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dak/report?type=received`);
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const finalData = sorted.map((val, ind) => ({
          ...val, sno: ind + 1
        }));
        setReports(finalData);
        // setType(reportType);
        toast.success('Received Reports loaded!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
      // }
    }
    userData();

  }, []);


  const fetchReports = async (reportType) => {
    setLoading(true);
    setType(reportType);

    try {
      const res = await api.get(`/dak/report?type=${reportType}`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const finalData = sorted.map((val, ind) => ({
        ...val, sno: ind + 1
      }));
      setReports(finalData);
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
    const rows = filteredReports.map((dak, index) => [
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
    doc.save('dak-reports.pdf');
  };

  const downloadAllPDFs = async (dakId) => {
    try {
      const res = await api.get(`/dak/download/${dakId}`, {
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

  const returnHead = async (dakId) => {
    try {
      const res = await api.get(`/dak/dak-return/${dakId}`);
      res.data.message ? toast.success(res.data.message) : toast.error(res.data.error);
      fetchReports('received');
    } catch (err) {
      console.log(err);
      toast.error("Failed to return");
    }
  }

  const filteredReports = reports.filter((r) =>
    r.mail_id?.toLowerCase().includes(searchText.toLowerCase()) ||
    r.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
    r.source?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: 'Sno',
      selector: (row) => row.sno,
      sortable: true,
      wrap: true
    },
    {
      name: 'Dak ID',
      selector: (row) => row.mail_id,
      sortable: true,
      wrap: true
    },
    {
      name: 'Subject',
      selector: (row) => row.subject,
      sortable: true,
      wrap: true
    },
    {
      name: 'Letter Number',
      selector: (row) => row.letterNumber || '',
      sortable: true,
      wrap: true
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
      wrap: true
    },
    {
      name: 'Sent To',
      selector: (row) => row.receivedBy?.name ||  '',
      sortable: true,
      wrap: true
    },
    {
      name: 'Forwarded To',
      sortable: true,
      cell: (row) => (
        <p className={row.forwardedTo?.name ? '' : 'text-red-600'}>
          {row.forwardedTo?.name || 'Not forwarded to anyone'}
        </p>
      )
    },
    {
      name: 'Date',
      selector: (row) => new Date(row.createdAt).toLocaleDateString('en-gb'),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="">
          <button
            onClick={() => setTrackingDakId(row._id)}
            className="mb-1 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            Track
          </button>
          <button
            onClick={() => downloadAllPDFs(row._id)}
            className="mb-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            Download
          </button>
          {localStorage.getItem('role') === 'user' ?
            <button
              onClick={() => returnHead(row._id)}
              hidden={row.isReturned ? true : false}
              className="mb-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Return
            </button> : ''
          }
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = {
    cells: {
      style: {
        paddingLeft: '6px',
        paddingRight: '6px',
      },
    },
    headCells: {
      style: {
        paddingLeft: '6px',
        paddingRight: '6px',
      },
    },
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Dak Reports</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => fetchReports('received')}
          disabled={loading}
          hidden={localStorage.getItem("role") === "distributor" ? true : false}
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
          hidden={localStorage.getItem("role") === "user" ? true : false}
          className={`px-4 py-1 rounded ${type === 'sent' ? 'bg-green-700' : 'bg-green-600'} text-white`}
        >
          {loading && type === 'sent' ? (
            <FaSpinner className="animate-spin inline mr-2" />
          ) : null}
          Sent
        </button>

        <button
          onClick={() => fetchReports('upload')}
          disabled={loading}
          hidden={localStorage.getItem("role") === "user" || localStorage.getItem("role") === "head" ? true : false}
          className={`px-4 py-1 rounded ${type === 'upload' ? 'bg-purple-700' : 'bg-purple-600'} text-white`}
        >
          {loading && type === 'upload' ? (
            <FaSpinner className="animate-spin inline mr-2" />
          ) : null}
          Uploaded
        </button>

        {reports.length > 0 && (
          <button
            onClick={exportPDF}
            className="px-4 py-1 bg-gray-800 text-white rounded"
          >
            Export PDF
          </button>
        )}

        <input
          type="text"
          placeholder="Search Dak ID / Subject / Source"
          className="flex-1 px-3 py-1 border rounded-md"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border rounded">
        <div className="min-w-[1000px] max-h-[500px] overflow-y-auto">
          <DataTable
            columns={columns}
            data={filteredReports}
            pagination
            highlightOnHover
            dense
            persistTableHead
            responsive={false}
            customStyles={customStyles}
          />
        </div>
      </div>

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
