import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from './api';
import toast from 'react-hot-toast';

export default function SendReminder() {
  const [dakId, setDakId] = useState('');
  const [message, setMessage] = useState('');
  const [dakOptions, setDakOptions] = useState([]);

  useEffect(() => {
    const fetchDaks = async () => {
      try {
        const res = await api.get('/dak/list');
        const options = res.data.map((dak) => ({
          value: dak._id,
          label: `${dak.subject} (${dak.mail_id})`,
        }));
        setDakOptions(options);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load Daks');
      }
    };
    fetchDaks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dakId || !message.trim()) {
      toast.error('Please select a Dak and enter your message.');
      return;
    }

    try {
      const res = await api.post('/dak/reminder', {
        dakId,
        message,
      });
      toast.success(res.data.message || 'Reminder sent!');
      setMessage('');
      setDakId('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error sending reminder.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-xl">
      <h2 className="text-2xl font-semibold mb-4">Send Dak Reminder</h2>

      <label className="block mb-1 font-medium">Select Dak:</label>
      <Select
        options={dakOptions}
        value={dakOptions.find(opt => opt.value === dakId) || null}
        onChange={(selected) => setDakId(selected?.value)}
        placeholder="Search Dak by subject..."
        className="mb-4"
      />

      <label className="block mb-1 font-medium">Reminder Message:</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-3 rounded w-full mb-4"
        rows={4}
        placeholder="Enter your reminder message here..."
      ></textarea>

      <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded w-full">
        Send Reminder
        </button>
    </form>
  );
}
