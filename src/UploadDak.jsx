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
  const [letter, setLetter] = useState('');
  const [letterDate, setLetterDate] = useState('');
  const [lab, setLab] = useState('');
  const [lang, setLang] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    const fetchHeads = async () => {
      try {
        const res = await api.get('/users/heads');
        const options = res.data.map((head) => ({
          value: head._id,
          label: `${head.name} (${head.email})`,
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

    if (!receivedBy) return setMsg('Please select a Head user.');
    if (!id) return setMsg('Please enter an ID.');
    if (!subject) return setMsg('Please enter Subject.');
    if (!letter) return setMsg('Please enter Letter Number.');
    if (!letterDate) return setMsg('Please enter Letter Date.');
    if (!lab) return setMsg('Please enter Lab.');
    if (!lang) return setMsg('Please select Language.');
    if (!region) return setMsg('Please select Region.');
    if (files.length === 0) return setMsg('Please select at least one PDF.');

    const formData = new FormData();
    formData.append('receivedBy', receivedBy);
    formData.append('source', source);
    formData.append('mail_id', id);
    formData.append('subject', subject);
    formData.append('letterNumber', letter);
    formData.append('letterDate', letterDate);
    formData.append('lab', lab);
    formData.append('lang', lang);
    formData.append('region', region);
    files.forEach((file) => formData.append('files', file));

    try {
      const res = await api.post('/dak/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg(res.data.message);
      setId(Date.now());
      setFiles([]);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Dak</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">ID</label>
            <input
              type="text"
              value={id}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Letter Number</label>
            <input
              type="text"
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Enter Letter Number"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Letter Date</label>
            <input
              type="date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Lab</label>
            <input
              type="text"
              value={lab}
              onChange={(e) => setLab(e.target.value)}
              placeholder="Enter Lab"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Letter Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select --</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select --</option>
              <option value="A">(क)</option>
              <option value="B">(ख)</option>
              <option value="C">(ग)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Select Head User</label>
          <Select
            options={heads}
            onChange={(selected) => setReceivedBy(selected?.value)}
            placeholder="Search Head by Name or Email..."
            className="text-sm"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="mail">Mail</option>
            <option value="scanned_pdf">Scanned PDF</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Upload PDF(s)</label>
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFiles}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {msg && (
          <p className="text-sm mt-2 text-red-600 font-semibold">{msg}</p>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
        >
          Upload Dak
        </button>
      </form>
    </div>
  );
}
