import React, { useState, useEffect } from 'react';
import api from './api';
import Select from 'react-select';

export default function UploadDak() {
  const [files, setFiles] = useState([]);
  const [receivedBy, setReceivedBy] = useState('');
  const [source, setSource] = useState('mail');
  const [msg, setMsg] = useState('');
  const [heads, setHeads] = useState([]);
  const [id, setId] = useState(Date.now());
  const [subject, setSubject] = useState('');

  useEffect(() => {
    const fetchHeads = async () => {
      try {
        const res = await api.get('/users/heads');

        const options = res.data.map((head) => ({
          value: head._id,
          label: head.name + ' ' + head.email,
        }));
        setHeads(options);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHeads();
  }, []);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!receivedBy) {
      setMsg('Please select a Head user.');
      return;
    }

    if (!id) {
      setMsg('Please enter a Id.');
      return;
    }

    if (!subject) {
      setMsg('Please enter Subject.');
      return;
    }

    if (files.length === 0) {
      setMsg('Please select at least one PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('receivedBy', receivedBy);
    formData.append('source', source);
    formData.append('mail_id', id);
    formData.append('subject', subject);

    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await api.post('/dak/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMsg(res.data.message);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <div className='mb-2'>
        <input
          type="name"
          id='id'
          className="border p-1 mr-2 bg-gray-200"
          value={id}
          placeholder='ID'
          required
          readOnly
        />

        <input
          type="name"
          id='subject'
          className="border p-1 mr-2"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder='Subject'
        />

        <h2 className="text-xl mb-2">Upload PDFs</h2>
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleFiles}
          className="border p-2 mb-2 block"
        />
      </div>


      <label className="block mb-1 font-semibold">Select Head User:</label>
      <Select
        options={heads}
        onChange={(selected) => setReceivedBy(selected?.value)}
        placeholder="Search Head by Name or Mail..."
        className="mb-4"
      />

      <label className="block mb-1 font-semibold">Source:</label>
      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="border p-2 mb-2 block w-full"
      >
        <option value="mail">Mail</option>
        <option value="scanned_pdf">Scanned PDF</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload PDFs
      </button>

      {msg && <p className="mt-2">{msg}</p>}
    </form>
  );
}
