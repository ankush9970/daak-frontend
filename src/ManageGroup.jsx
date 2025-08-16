import React, { useEffect, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { hasPermission } from "./utils/Permission";
import { FaSpinner } from "react-icons/fa";

const ManageGroup = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [shortName, setShortName] = useState("");
  const [groupId, setGroupId] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);

    try {
      const res = await api.get("/users/group");
      localStorage.getItem("role") !== "admin"
        ? setGroups(
            res.data.filter(
              (d) => d.shortName.toLowerCase() !== "sa".toLowerCase()
            )
          )
        : setGroups(res.data);
      // setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const editGroup = async (e) => {
    e.preventDefault();
    if (!fullName) return toast.error("Name is required");
    if (!shortName) return toast.error("ShortName is required");
    setLoading(true);

    try {
      if (groupId) {
        const res = await api.put(`/users/group`, {
          groupId,
          name: fullName,
          shortName,
        });
        toast.success(res.data.message);
        setLoading(false);
        setShowModal(false);
        setGroupId(null);
        setFullName("");
        setShortName("");
      } else {
        const res = await api.post(`/users/group`, {
          name: fullName,
          shortName,
        });
        toast.success(res.data.message);
        setLoading(false);
        setShowModal(false);
        setGroupId(null);
        setFullName("");
        setShortName("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      fetchGroups();
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (
    user?.role?.toLowerCase() !== "admin" &&
    user?.role?.toLowerCase() !== "director"
  ) {
    return <p className="text-red-600 font-semibold">Access Denied</p>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Group</h1>
        <button
          onClick={() => {
            setShowModal(true);
            setGroupId(null);
            setFullName("");
            setShortName("");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Group
        </button>
      </div>
      <div className="overflow-x-auto border rounded shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Short Name</th>
              {hasPermission("MANAGE_GROUP") && (
                <th className="px-4 py-2 border">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : (
              groups.map((u) => {
                return (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{u.name}</td>
                    <td className="px-4 py-2 border">{u.shortName}</td>

                    {hasPermission("MANAGE_GROUP") && (
                      <td className="px-4 py-2 border capitalize">
                        <button
                          onClick={() => {
                            setGroupId(u._id);
                            setFullName(u.name);
                            setShortName(u.shortName);
                            setShowModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {groupId ? "Edit" : "Add"} Group
            </h2>
            <form onSubmit={editGroup} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Short Name
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    setShowModal(false);
                    setGroupId(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin inline mr-2" />
                  ) : null}
                  {groupId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroup;
