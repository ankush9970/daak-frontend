import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "./api";
import DataTable from "react-data-table-component";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Select from "react-select"; // Ensure this import

const UserWAP = () => {
  const [waps, setWaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  // Edit modal state
  const [editingWap, setEditingWap] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editSubmitDate, setEditSubmitDate] = useState("");

  const [userId, setUserId] = useState(""); // userId for selected user
  const [newWapTask, setNewWapTask] = useState(""); // WAP task for new work
  const [userOptions, setUserOptions] = useState([]); // List of users for select
  const [submitDate, setSubmitDate] = useState("");
  const [assignDate, setAssignDate] = useState("");

  // Fetch user WAPs
  const fetchWaps = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/waps/user`);
      setWaps(res.data);
    } catch (error) {
      console.error("Error fetching WAPs:", error);
      toast.error(error.data?.error || "Failed to fetch WAPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaps(); // Fetch WAPs
  }, []);

  const openEditModal = (wap) => {
    setEditingWap(wap);
    setEditTask(wap.task);
    setEditSubmitDate(wap.submitDate || "");
  };

  // Create WAP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assignDate || !submitDate) {
      toast.error("Please select both date.");
      return;
    }
    if (newWapTask.trim() === "") {
      toast.error("Please enter a WAP message.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/waps/createWapUser", {
        task: newWapTask,
        assignDate: assignDate,
        submitDate: submitDate,
      });
      toast.success("WAP sent successfully!");
      fetchWaps();
      setUserId("");
      setNewWapTask("");
      setModalOpen(false);
    } catch (error) {
      console.error("Error sending WAP:", error);
      toast.error(error.data?.error || "Failed to send WAP");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editSubmitDate.trim()) {
      toast.error("Please enter a Submit Date.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/waps/editWapUser`, {
        wapId: editingWap._id,
        submitDate: editSubmitDate,
      });
      toast.success("Date updated successfully!");
      fetchWaps();
      setEditingWap(null);
    } catch (error) {
      console.error("Error updating WAP:", error);
      toast.error(error.data?.error || "Failed to update WAP");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "User",
      selector: (row) => row.user?.name || "Unknown",
      sortable: true,
      wrap: true,
    },
    {
      name: "Task",
      selector: (row) => row.task,
      sortable: true,
      wrap: true,
      grow: 2,
      cell: (row) => (
        <div className="truncate max-w-[250px]" title={row.task}>
          {row.task}
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => (row.status ? "Completed" : "Pending"),
      sortable: true,
    },
    {
      name: "Days",
      selector: (row) => (row.requiredDays ? row.requiredDays : "N/A"),
      sortable: true,
      center: true,
    },
    {
      name: "Date Assigned",
      selector: (row) => new Date(row.createdAt).toLocaleDateString("en-gb"),
      sortable: true,
      center: true,
    },
    {
      name: "Date Submitted",
      selector: (row) =>
        row.submitDate
          ? new Date(row.submitDate).toLocaleDateString("en-gb")
          : "Not Filled Yet",
      sortable: true,
      center: true,
    },
    {
      name: "Action",
      button: true,
      cell: (row) => (
        <button
          onClick={() => openEditModal(row)}
          disabled={row.submitDate ? true : false}
          className={`px-4 py-2 rounded-md text-white transition ${
            row.submitDate
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {row.submitDate ? "Edited" : "Edit"}
        </button>
      ),
    },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Work Assigned", 14, 20);
    const rows = waps.map((wap, index) => [
      index + 1,
      wap.user?.name || "Unknown",
      wap.task,
      wap.status ? "Completed" : "Pending",
      new Date(wap.createdAt).toLocaleDateString("en-gb"),
      wap.submitDate
        ? new Date(wap.submitDate).toLocaleDateString("en-gb")
        : "Not Filled Yet",
      wap.requiredDays ? wap.requiredDays : "N/A",
    ]);
    autoTable(doc, {
      head: [
        [
          "#",
          "User",
          "WAP Task",
          "Status",
          "Date Assigned",
          "Date Submitted",
          "Days",
        ],
      ],
      body: rows,
    });
    doc.save(`wap_${Date.now()}.pdf`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">
          Work Assigned
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Add Work
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={waps}
          progressPending={loading}
          pagination
          highlightOnHover
          responsive
          dense
          customStyles={{
            headCells: {
              style: {
                fontWeight: "600",
                fontSize: "14px",
                backgroundColor: "#f9fafb",
                padding: "10px",
                whiteSpace: "nowrap",
              },
            },
            cells: {
              style: {
                padding: "10px",
                fontSize: "14px",
                wordBreak: "break-word",
              },
            },
          }}
        />
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Create New WAP
            </h3>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 font-medium text-gray-700">
                Start Date:
              </label>
              <input
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                className="border p-2 rounded-md w-full"
              />

              <label className="block mb-2 font-medium text-gray-700">
                Submit Date:
              </label>
              <input
                type="date"
                value={submitDate}
                onChange={(e) => setSubmitDate(e.target.value)}
                className="border p-2 rounded-md w-full"
              />

              <label className="block mb-2 font-medium text-gray-700">
                Work Allocation Plan:
              </label>
              <textarea
                value={newWapTask}
                onChange={(e) => setNewWapTask(e.target.value)}
                className="border p-3 rounded-md w-full mb-4"
                rows={4}
                placeholder="Enter your Work Allocation Plan here..."
              ></textarea>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setUserId("");
                    setNewWapTask("");
                  }}
                  className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-md transition duration-300"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingWap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit WAP
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Submit Date:
                </label>
                <input
                  type="date"
                  value={editSubmitDate}
                  onChange={(e) => setEditSubmitDate(e.target.value)}
                  className="border p-2 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Work Allocation Plan:
                </label>
                <textarea
                  disabled
                  value={editTask}
                  className="border p-2 rounded-md w-full bg-gray-100"
                  rows={3}
                  readOnly
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingWap(null)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWAP;
