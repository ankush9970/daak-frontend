import React, { useEffect, useState } from "react";
import api from "./api";
import DakTracking from "./DakTracking";
import ForwardDak from "./ForwardDak";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSpinner } from "react-icons/fa";
import { hasPermission } from "./utils/Permission";

export default function DakReports() {
  const [type, setType] = useState("received");
  const [reports, setReports] = useState([]);
  const [trackingDakId, setTrackingDakId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [forwardDakId, setForwardDakId] = useState(null);
  const [forwardId, setForwardId] = useState(null);
  const [returnId, setReturnId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [viewFiles, setViewFiles] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);

  const base = "https://dakmanagement.onrender.com";

  useEffect(() => {
    fetchReports("received");
  }, []);

  const fetchReports = async (reportType) => {
    setLoading(true);
    setType(reportType);

    try {
      const res = await api.get(`/dak/report?type=${reportType}`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const finalData = sorted.map((val, ind) => ({ ...val, sno: ind + 1 }));
      setReports(finalData);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Dak Reports", 14, 20);
    const rows = filteredReports.map((dak, index) => [
      index + 1,
      dak.mail_id,
      dak.subject,
      dak.letterNumber || "",
      dak.lab || "",
      dak.source || "",
      new Date(dak.createdAt).toLocaleDateString("en-gb"),
    ]);
    autoTable(doc, {
      head: [
        ["Sno", "Dak ID", "Subject", "Letter Number", "Lab", "Source", "Date"],
      ],
      body: rows,
    });
    doc.save("dak-reports.pdf");
  };

  const downloadAllPDFs = async (dakId) => {
    try {
      const res = await api.get(`/dak/download/${dakId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `dak_${dakId}_all_pdfs.zip`);
      document.body.appendChild(link);
      link.click();
      toast.success("Download started");
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed");
    }
  };

  const returnHead = async (e) => {
    e.preventDefault();
    if (!returnReason) return toast.error("Reason is required.");
    setLoading(true);
    try {
      const res = await api.put(`/dak/dak-return/${returnId}`, {
        returnReason,
      });
      res.data.message
        ? toast.success(res.data.message)
        : toast.error(res.data.error);
      fetchReports("received");
    } catch (err) {
      toast.error("Failed to return");
    } finally {
      setLoading(false);
      setReturnId(null);
    }
  };

  const handleViewFiles = async (dakId) => {
    try {
      const res = await api.get(`/dak/view/${dakId}`);
      setViewFiles(res.data.files);
      setViewOpen(true);
    } catch (err) {
      toast.error("Failed to load PDFs");
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.mail_id?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.letterNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.source?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: "Dak ID",
      selector: (row) => row.mail_id,
      sortable: true,
      wrap: true,
    },
    {
      name: "Subject",
      selector: (row) => row.subject,
      sortable: true,
      wrap: true,
    },
    {
      name: "Letter Number",
      selector: (row) => row.letterNumber || "",
      sortable: true,
    },
    { name: "Lab", selector: (row) => row.lab || "", sortable: true },
    { name: "Source", selector: (row) => row.source || "", sortable: true },
    { name: "Status", selector: (row) => row.status || "", sortable: true },

    ...(hasPermission("FORWARD")
      ? [
          {
            name: "Forward",
            cell: (row) => (
              <button
                onClick={() => {
                  setForwardDakId(row);
                  setForwardId(row._id);
                }}
                className="mb-1 px-3 py-1 bg-green-700 text-white rounded text-sm hover:bg-green-800"
                disabled={
                  !["uploaded", "returned_to_head", "sent_to_head"].includes(
                    row.status
                  )
                }
              >
                {["uploaded", "returned_to_head", "sent_to_head"].includes(
                  row.status
                )
                  ? "Select"
                  : "Forwarded"}
              </button>
            ),
          },
        ]
      : []),

    {
      name: "Sent To",
      selector: (row) => row.receivedBy?.name || "",
      sortable: true,
    },
    {
      name: "Forwarded To",
      cell: (row) => (
        <p className={row.forwardedTo?.name ? "" : "text-red-600"}>
          {row.forwardedTo?.name || "Not forwarded"}
        </p>
      ),
    },
    {
      name: "Date",
      selector: (row) => new Date(row.createdAt).toLocaleDateString("en-gb"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTrackingDakId(row._id)}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            Track
          </button>
          <button
            onClick={() => downloadAllPDFs(row._id)}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            Download
          </button>
          <button
            onClick={() => handleViewFiles(row._id)}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            View
          </button>
          {localStorage.getItem("role") === "user" && !row.isReturned && (
            <button
              onClick={() => setReturnId(row._id)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Return
            </button>
          )}
        </div>
      ),
    },
  ];

  const customStyles = {
    cells: { style: { padding: "6px" } },
    headCells: { style: { padding: "6px", fontWeight: "600" } },
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Dak Reports</h2>

      {/* Top Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => fetchReports("received")}
          disabled={loading}
          hidden={localStorage.getItem("role") === "distributor"}
          className={`px-4 py-1 rounded ${
            type === "received" ? "bg-blue-700" : "bg-blue-600"
          } text-white`}
        >
          {loading && type === "received" && (
            <FaSpinner className="animate-spin inline mr-2" />
          )}
          Received
        </button>

        <button
          onClick={() => fetchReports("sent")}
          disabled={loading}
          hidden={localStorage.getItem("role") === "user"}
          className={`px-4 py-1 rounded ${
            type === "sent" ? "bg-green-700" : "bg-green-600"
          } text-white`}
        >
          {loading && type === "sent" && (
            <FaSpinner className="animate-spin inline mr-2" />
          )}
          Sent
        </button>

        <button
          onClick={() => fetchReports("upload")}
          disabled={loading}
          hidden={["user", "head"].includes(localStorage.getItem("role"))}
          className={`px-4 py-1 rounded ${
            type === "upload" ? "bg-purple-700" : "bg-purple-600"
          } text-white`}
        >
          {loading && type === "upload" && (
            <FaSpinner className="animate-spin inline mr-2" />
          )}
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
          placeholder="Search Dak ID / Subject / Source / Letter No."
          className="flex-1 px-3 py-1 border rounded-md"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <DataTable
          columns={columns}
          data={filteredReports}
          pagination
          highlightOnHover
          dense
          persistTableHead
          responsive
          customStyles={customStyles}
          progressPending={loading}
          noDataComponent="No Dak Reports found."
        />
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

      {/* Forward Modal */}
      {forwardId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Forward Dak</h3>
              <button
                onClick={() => setForwardId(null)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <ForwardDak
              onClose={() => setForwardId(null)}
              preDak={forwardDakId}
            />
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Return Dak</h3>
            <form onSubmit={returnHead} className="space-y-4">
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="border p-3 rounded w-full"
                rows={4}
                placeholder="Enter your reason here..."
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReturnId(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Files Modal */}
      {viewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">View Dak Files</h3>
              <button
                onClick={() => setViewOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            {viewFiles.length === 0 ? (
              <p>No files found</p>
            ) : (
              viewFiles.map((file, idx) => (
                <div key={idx} className="mb-6">
                  <h4 className="font-medium mb-2">{file.originalName}</h4>
                  <iframe
                    src={base + file.url}
                    title={file.originalName}
                    width="100%"
                    height="600px"
                    className="border"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
