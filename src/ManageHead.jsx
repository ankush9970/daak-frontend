import React, { useEffect, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";
import AddUserModal from "./AddUserModal";
import toast from "react-hot-toast";
import PermissionDrawer from "./PermissionDrawer";
import { hasPermission } from "./utils/Permission";

const ManageHead = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/heads");
      //   const filtered = res.data.filter(
      //     (d) =>
      //       d.role.name !== "head" &&
      //       d.role.name !== "director" &&
      //       d.role.name !== "admin"
      //   );
      //   console.log(
      //     filtered.sort((a, b) => a.group.name.localeCompare(b.group.name))
      //   );
      //   console.log(res.data);

      setUsers(
        res.data.sort((a, b) => a.group.name.localeCompare(b.group.name))
      );
    } catch (err) {
      console.error("Failed to fetch head:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/users/group");
      localStorage.getItem("role") !== "admin"
        ? setGroups(res.data.filter((d) => d.shortName !== "sa"))
        : setGroups(res.data);
      // setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("/users/role");

      if (localStorage.getItem("role") === "admin") {
        setRoles(res.data);
      } else {
        setRoles(
          res.data.filter((d) => d.name !== "admin" && d.name !== "director")
        );
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      setUpdatingUserId(userId);
      await api.post(`/assign-role`, { userId: userId, roleId: newRoleId });
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const resetPassword = async (userId) => {
    try {
      const res = await api.put(`/users/reset-password`, { userId: userId });
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
      toast.error("failed to reset password");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
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
        <h1 className="text-2xl font-bold">Manage Head</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Group Head
        </button>
      </div>
      {/* <h2 className="text-2xl font-bold mb-4">Manage Users & Roles</h2> */}
      <div className="overflow-x-auto border rounded shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Group</th>
              <th className="px-4 py-2 border">Change Role</th>
              <th className="px-4 py-2 border">Permissions</th>
              {hasPermission("reset-password") && (
                <th className="px-4 py-2 border">Reset Password</th>
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
              users.map((u) => {
                const currentRole = roles.find(
                  (r) => r._id === u.role?._id || r._id === u.role
                );
                return (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{u.name}</td>
                    <td className="px-4 py-2 border">{u.email}</td>
                    <td className="px-4 py-2 border capitalize">
                      {u.group?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        className="border px-2 py-1 rounded capitalize"
                        value={u.role?._id || u.role || ""}
                        onChange={(e) =>
                          handleRoleChange(u._id, e.target.value)
                        }
                        disabled={updatingUserId === u._id}
                      >
                        <option value="">Select</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                        onClick={() => {
                          setSelectedUserId(u._id);
                          setDrawerOpen(true);
                        }}
                      >
                        Manage
                      </button>
                    </td>
                    {hasPermission("reset-password") && (
                      <td className="px-4 py-2 border capitalize">
                        <button
                          onClick={(e) => resetPassword(u._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          Reset Password
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
        <AddUserModal
          onClose={() => setShowModal(false)}
          onUserAdded={fetchUsers}
          loadedRoles={roles}
          loadedGroups={groups}
        />
      )}
      <PermissionDrawer
        userId={selectedUserId}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default ManageHead;
