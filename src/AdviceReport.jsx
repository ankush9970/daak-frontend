import React, { useEffect, useState } from 'react';
import api from './api';
import toast from 'react-hot-toast';
import DataTable from 'react-data-table-component';

const AdviceReport = () => {
    const [advicelist, setAdvicelist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [headResponse, setHeadResponse] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);


    const fetchAdvice = async () => {
        setLoading(true);
        try {
            const res = await api.get('/dak/list-advice');

            const opt = res.data.filter(d => d.userAdviceRequest.some(val => val.status !== 'NA'))
                .map((val, ind) => {
                    return val.userAdviceRequest.map((req, i) => ({
                        _id: val._id,
                        subject: val.subject,
                        letterNumber: val.letterNumber,
                        message: req.message,
                        status: req.status,
                        createdAt: req.createdAt,
                        headResponse: req.headResponse,
                        updatedAt: req.updatedAt,
                    }));
                }).flat();
            console.log(opt);


            setAdvicelist(opt);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load Daks');
        } finally {
            setLoading(false);
        }
    };





    useEffect(() => {
        fetchAdvice();
    }, []);

    const [viewModal, setViewModal] = useState({ open: false, title: '', content: '' });
    const [replyModal, setReplyModal] = useState({ open: false, message: '', id: '' });

    const openViewModal = (title, content) => {
        setViewModal({ open: true, title, content });
    };

    const openReplyModal = (message, id) => {
        setReplyModal({ open: true, message, id });
    };

    const closeViewModal = () => {
        setViewModal({ open: false, title: '', content: '' });
    };

    const closeReplyModal = () => {
        setReplyModal({ open: false, title: '', content: '' });
    };

    const columns = [
        {
            name: 'Query',
            selector: (row) => row.message,
            sortable: true,
            cell: (row) => (
                <div className="max-w-[180px] truncate" title={row.message}>
                    {row.message}
                    {row.message && row.message.length > 20 && (
                        <button
                            onClick={() => openViewModal("Full Query", row.message)}
                            className="text-blue-600 ml-2 underline text-xs"
                        >
                            View Full
                        </button>
                    )}
                </div>
            ),
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true
        },
        {
            name: 'Subject',
            selector: (row) => row.subject,
            sortable: true,
            cell: (row) => (
                <div className="max-w-[180px] truncate" title={row.subject}>
                    {row.subject}
                </div>
            ),
        },
        {
            name: 'Response',
            cell: (row) => (
                <div className="max-w-[180px] truncate" title={row.headResponse}>
                    <p className={row.headResponse ? '' : 'text-red-600'}>
                        {row.headResponse || 'Waiting'}
                    </p>
                    {row.headResponse && row.headResponse.length > 50 && (
                        <button
                            onClick={() => openViewModal("Full Response", row.headResponse)}
                            className="text-blue-600 ml-2 underline text-xs"
                        >
                            View Full
                        </button>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Date',
            selector: (row) => new Date(row.createdAt).toLocaleDateString('en-gb'),
            sortable: true,
        },
        {
            name: 'Action',
            cell: (row, i) => (
                <button
                    onClick={() => openReplyModal(row.message, row._id)}
                    disabled={row.status === 'completed'}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
                >
                    {row.status !== 'completed' ? 'Send Reply' : 'Replied'}
                </button>
            ),
        },
    ];

    const handleSubmit = async (e, dakId) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post(`/dak/response-advice`, { dakId, headResponse });
            res.data.message ? toast.success(res.data.message) : toast.error(res.data.error);
        } catch (error) {
            console.log(error);
            toast.error('Failed to sent');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">

            <h2 className="text-2xl font-bold mb-4">Manage Advice</h2>
            <div className="overflow-x-auto border rounded shadow bg-white">
                {loading ? <tr>
                    <td colSpan="5" className="text-center py-4">Loading...</td>
                </tr> : (
                    <DataTable
                        columns={columns}
                        data={advicelist}
                        pagination
                        highlightOnHover
                        striped
                        dense
                        persistTableHead
                        responsive
                    />
                )}
            </div>
            {viewModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-xl w-full relative">
                        <h3 className="text-lg font-bold mb-2">{viewModal.title}</h3>
                        <button
                            onClick={closeViewModal}
                            className="absolute top-2 right-2 text-gray-700 hover:text-red-600"
                        >
                            ✕
                        </button>
                        <div className="max-h-[300px] overflow-auto whitespace-pre-wrap text-sm text-gray-800">
                            {viewModal.content}
                        </div>
                    </div>
                </div>
            )}

            {replyModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Send Reply to User Query</h2>
                        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium">User Query</label>
                                <p className="w-full px-3 py-2 bg-grey-600 border rounded focus:outline-none" >
                                    {replyModal.message}
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
                                    onClick={() => closeReplyModal()}
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
            )}

        </div>
    );
};

export default AdviceReport;
