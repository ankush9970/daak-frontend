import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "./api";
import Select from "react-select/base";


const ManageWAP = () => {
  const [waps, setWaps] = useState([]);
  const [user, setUser] = useState([]);
  const [newWap, setNewWap] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  const handleSubmit = async () => {
    if (newWap.trim() === "") return;
    setWaps([...waps, { id: Date.now(), name: newWap, status: "Active" }]);
    setNewWap("");
  };

  const fetchMember = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      const options = response.data.map((u) => ({
          value: u._id,
          label: `${u.name} (${u.email})`,
        }));
        setUser(options);
    } catch (error) {
      console.error("Error fetching WAPs:", error);
      toast.error(error.data?.error || "Failed to fetch WAPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage WAPs</h2>
      
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-xl"
      >

        <label className="block mb-1 font-medium">Select User:</label>
        <Select
          options={user}
          onChange={(selected) => setUserId(selected?.value)}
          placeholder="Search Member by name..."
          className="mb-4"
        />

        <label className="block mb-1 font-medium">Reminder Message:</label>
        <textarea
          value={waps}
          onChange={(e) => setWaps(e.target.value)}
          className="border p-3 rounded w-full mb-4"
          rows={4}
          placeholder="Enter your Work Allocation Plan here..."
        ></textarea>

        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded w-full"
        >
          Send Reminder
        </button>
      </form>
      <ul>
        {user.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between py-2 border-b last:border-b-0"
          >
            <span className="font-medium">{u.name}</span>
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  u.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {u.status}
              </span>
              <button
                // onClick={() => toggleStatus(wap.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                Toggle
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageWAP;
