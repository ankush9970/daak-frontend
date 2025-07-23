import React, { useState, useEffect } from 'react';
import api from './api';
import Select from 'react-select';
import { toast } from 'react-hot-toast';

export default function ForwardDak() {
  const [dakId, setDakId] = useState('');
  const [userId, setUserId] = useState('');
  const [advice, setAdvice] = useState('');
  const [daks, setDaks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchDaks = async () => {
      try {
        const res = await api.get('/dak/list');
        const opt = res.data.map((dak) => ({
          value: dak._id,
          label: dak.subject,
          date: dak.createdAt,
        }));
        opt.sort((a, b) => new Date(b.date) - new Date(a.date));
        setDaks(opt);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load Daks.');
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/users');
        const opt = res.data.map((user) => ({
          value: user._id,
          label: `${user.name} ${user.email}`,
        }));
        setUsers(opt);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load Users.');
      }
    };

    fetchDaks();
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dakId || !userId) {
      toast.error('Please select both Dak and User.');
      return;
    }

    try {
      const res = await api.post('/dak/forward', {
        dakId,
        userId,
        advice,
      });
      toast.success(res.data.message || 'Dak forwarded successfully!');
      // Reset form
      setDakId('');
      setUserId('');
      setAdvice('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error forwarding Dak.');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Forward Dak to User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Select Dak:</label>
          <Select
            options={daks}
            onChange={(selected) => setDakId(selected?.value)}
            placeholder="Search Dak by Subject..."
            value={daks.find(d => d.value === dakId) || null}
            className="react-select-container"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Select User:</label>
          <Select
            options={users}
            onChange={(selected) => setUserId(selected?.value)}
            placeholder="Search User by Name/Email..."
            value={users.find(u => u.value === userId) || null}
            className="react-select-container"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Advice (optional):</label>
          <textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter advice for the user..."
            rows={4}
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
        >
          Forward Dak
        </button>
      </form>
    </div>
  );
}
