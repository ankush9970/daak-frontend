import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from './api';

export default function SendReminder() {
  const [dakId, setDakId] = useState('');
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');
  const [dakOptions, setDakOptions] = useState([]);

  useEffect(() => {
    const fetchDaks = async () => {
      try {
        const res = await api.get('/dak/list');
        const options = res.data.map((dak) => ({
          value: dak._id,
          label: dak.subject,
        }));
        setDakOptions(options);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDaks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!dakId || !message) {
      setMsg('Please select a Dak and enter your message.');
      return;
    }

    try {
      const res = await api.post('/dak/reminder', {
        dakId,
        message,
      });
      setMsg(res.data.message);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || 'Error sending reminder.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h2 className="text-xl mb-4">Send Reminder</h2>

      <label className="block mb-1 font-semibold">Select Dak:</label>
      <Select
        options={dakOptions}
        onChange={(selected) => setDakId(selected?.value)}
        placeholder="Search Dak by subject..."
        className="mb-4"
      />

      <label className="block mb-1 font-semibold">Custom Message:</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 mb-4 w-full"
        placeholder="Enter your reminder message"
      ></textarea>

      <button
        type="submit"
        className="bg-yellow-600 text-white px-4 py-2 rounded"
      >
        Send Reminder
      </button>

      {msg && <p className="mt-2">{msg}</p>}
    </form>
  );
      }