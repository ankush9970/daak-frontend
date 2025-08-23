import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "./api";
import Select from "react-select";
import DataTable from "react-data-table-component";

const ManageWAP = () => {
  const [waps, setWaps] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [userId, setUserId] = useState("");
  const [newWapTask, setNewWapTask] = useState("");

  // Modal visibility
  const [modalOpen, setModalOpen] = useState(false);

  // Edit modal state
  const [editingWap, setEditingWap] = useState(null);
  const [editUserId, setEditUserId] = useState("");
  const [editTask, setEditTask] = useState("");

  // Fetch users for dropdown
  const fetchMember = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      const filtered = res.data.filter(
        (d) =>
          d.role.name !== "head" &&
          d.role.name !== "director" &&
          d.role.name !== "admin"
      );

      const options = filtered.map((u) => ({
        value: u._id,
        label: `${u.name} (${u.email})`,
      }));

      setUserOptions(options);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error(error.data?.error || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all waps
  const fetchWaps = async () => {
    setLoading(true);
    try {
      const res = await api.get("/waps");
      setWaps(res.data);
    } catch (error) {
      console.error("Error fetching WAPs:", error);
      toast.error(error.data?.error || "Failed to fetch WAPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
    fetchWaps();
  }, []);

  // Create WAP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Please select a user.");
      return;
    }
    if (newWapTask.trim() === "") {
      toast.error("Please enter a WAP message.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/waps/create", {
        userId,
        task: newWapTask,
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

  // Open edit modal
  const openEditModal = (wap) => {
    setEditingWap(wap);
    setEditUserId(wap.user?._id || "");
    setEditTask(wap.task);
  };

  // Update WAP
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editUserId) {
      toast.error("Please select a user.");
      return;
    }
    if (editTask.trim() === "") {
      toast.error("Please enter a WAP message.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/waps/${editingWap._id}`, {
        userId: editUserId,
        task: editTask,
      });
      toast.success("WAP updated successfully!");
      fetchWaps();
      setEditingWap(null);
    } catch (error) {
      console.error("Error updating WAP:", error);
      toast.error(error.data?.error || "Failed to update WAP");
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const columns = [
    {
      name: "User",
      selector: (row) => row.user?.name || "Unknown",
      sortable: true,
    },
    {
      name: "Task",
      selector: (row) => row.task,
      sortable: true,
      cell: (row) => (
        <div className="truncate max-w-xs" title={row.task}>
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
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => openEditModal(row)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Edit
        </button>
      ),
    },
    {
      name: "Date Created",
      selector: (row) => new Date(row.createdAt).toLocaleDateString("en-gb"),
      sortable: true,
    },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 xl:p-12 border rounded-lg bg-gray-50 shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Work Allocation
      </h2>

      {/* Create Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-md transition duration-300"
        >
          Create WAP
        </button>
      </div>

      {/* DataTable */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={waps}
          pagination
          progressPending={loading}
          noDataComponent="No WAPs found."
          highlightOnHover
          pointerOnHover
          responsive
          dense
          customStyles={{
            table: {
              style: {
                minWidth: "100%",
              },
            },
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
                padding: "8px 10px",
                fontSize: "14px",
                whiteSpace: "normal",
                wordBreak: "break-word",
              },
            },
            rows: {
              style: {
                minHeight: "45px",
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
                Select User:
              </label>
              <Select
                options={userOptions}
                onChange={(selected) => setUserId(selected?.value)}
                placeholder="Search Member by name..."
                className="mb-4"
                value={userOptions.find((opt) => opt.value === userId) || null}
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
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Edit WAP
            </h3>
            <form onSubmit={handleEditSubmit}>
              <label className="block mb-2 font-medium text-gray-700">
                Select User:
              </label>
              <Select
                options={userOptions}
                onChange={(selected) => setEditUserId(selected?.value)}
                placeholder="Search Member by name..."
                className="mb-4"
                value={
                  userOptions.find((opt) => opt.value === editUserId) || null
                }
              />

              <label className="block mb-2 font-medium text-gray-700">
                Work Allocation Plan:
              </label>
              <textarea
                value={editTask}
                onChange={(e) => setEditTask(e.target.value)}
                className="border p-3 rounded-md w-full mb-4"
                rows={4}
                placeholder="Enter your Work Allocation Plan here..."
              ></textarea>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingWap(null)}
                  className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition duration-300"
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

export default ManageWAP;
