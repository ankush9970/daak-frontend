import React, { useState } from 'react';
import api from './api';
import toast from 'react-hot-toast';

export default function SendAdviceModal({ onClose, onUserAdded, loadedData }) {
  const [dakId, setDakId] = useState('');
  const [headResponse, setHeadResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     try {
  //       // const res = await api.get('/users/role');
  //       setRoles(loadedRoles); // Assuming API returns array of roles
  //     } catch (err) {
  //       console.error('Error fetching roles:', err);
  //     }
  //   };
  //   fetchRoles();
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log(loadedData);
    setDakId(loadedData._id);
    try {
      const res = await api.post(`/dak/response-advice`, { dakId, headResponse });
      res.data.message?toast.success(res.data.message):toast.error(res.data.error);
    } catch (error) {
      console.log(error);
      toast.error('Failed to sent');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Send Reply to User Query</h2>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium">User Query</label>
            <p className="w-full px-3 py-2 bg-grey-600 border rounded focus:outline-none" >
              {loadedData[0].message}
              </p>
          </div>
          <div>
            <label className="block text-sm font-medium">Reply</label>
            <textarea
              value={headResponse}
              onChange={(e) => setHeadResponse(e.target.value)}
              className="border p-3 rounded w-full mb-4"
              rows={4}
              placeholder="Enter your reminder message here..."
            ></textarea>
          </div>


          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Sent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
