import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "./api";
import Select from "react-select";

const ManageWAP = () => {
  const [waps, setWaps] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state for new WAP
  const [userId, setUserId] = useState("");
  const [newWapTask, setNewWapTask] = useState("");

  // Modal visibility state for create modal
  const [modalOpen, setModalOpen] = useState(false);

  // Edit modal state
  const [editingWap, setEditingWap] = useState(null);
  const [editUserId, setEditUserId] = useState("");
  const [editTask, setEditTask] = useState("");

  // Fetch users for select dropdown
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

  // Handle creating new WAP
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

      // Refresh WAPs list
      fetchWaps();

      // Reset form & close modal
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

  // Open edit modal and populate fields
  const openEditModal = (wap) => {
    setEditingWap(wap);
    setEditUserId(wap.user?._id || "");
    setEditTask(wap.task);
  };

  // Handle edit submit
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
      setEditingWap(null); // Close edit modal
    } catch (error) {
      console.error("Error updating WAP:", error);
      toast.error(error.data?.error || "Failed to update WAP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage WAPs</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Create WAP
        </button>
      </div>

      {/* WAPs Data Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">User</th>
            <th className="border border-gray-300 p-2 text-left">WAP Task</th>
            <th className="border border-gray-300 p-2 text-left">Status</th>
            <th className="border border-gray-300 p-2 text-left">Action</th>
            <th className="border border-gray-300 p-2 text-left">
              Date Created
            </th>
          </tr>
        </thead>
        <tbody>
          {waps.length === 0 && (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No WAPs found.
              </td>
            </tr>
          )}
          {waps.map((wap) => (
            <tr key={wap._id}>
              <td className="border border-gray-300 p-2">
                {wap.user?.name || "Unknown"}
              </td>
              <td
                className="border border-gray-300 p-2 truncate max-w-xs"
                title={wap.task}
              >
                {wap.task}
              </td>
              <td className="border border-gray-300 p-2">
                {wap.status ? "Completed" : "Pending"}
              </td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => openEditModal(wap)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              </td>
              <td className="border border-gray-300 p-2">
                {new Date(wap.createdAt).toLocaleDateString("en-gb")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New WAP</h3>
            <form onSubmit={handleSubmit}>
              <label className="block mb-1 font-medium">Select User:</label>
              <Select
                options={userOptions}
                onChange={(selected) => setUserId(selected?.value)}
                placeholder="Search Member by name..."
                className="mb-4"
                value={userOptions.find((opt) => opt.value === userId) || null}
              />

              <label className="block mb-1 font-medium">
                Work Allocation Plan:
              </label>
              <textarea
                value={newWapTask}
                onChange={(e) => setNewWapTask(e.target.value)}
                className="border p-3 rounded w-full mb-4"
                rows={4}
                placeholder="Enter your Work Allocation Plan here..."
              ></textarea>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setUserId("");
                    setNewWapTask("");
                  }}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
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
            <h3 className="text-xl font-semibold mb-4">Edit WAP</h3>
            <form onSubmit={handleEditSubmit}>
              <label className="block mb-1 font-medium">Select User:</label>
              <Select
                options={userOptions}
                onChange={(selected) => setEditUserId(selected?.value)}
                placeholder="Search Member by name..."
                className="mb-4"
                value={
                  userOptions.find((opt) => opt.value === editUserId) || null
                }
              />

              <label className="block mb-1 font-medium">
                Work Allocation Plan:
              </label>
              <textarea
                value={editTask}
                onChange={(e) => setEditTask(e.target.value)}
                className="border p-3 rounded w-full mb-4"
                rows={4}
                placeholder="Enter your Work Allocation Plan here..."
              ></textarea>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingWap(null)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
