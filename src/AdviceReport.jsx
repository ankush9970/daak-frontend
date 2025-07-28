import React, { useEffect, useState } from 'react';
import api from './api';
import toast from 'react-hot-toast';

const AdviceReport = () => {
    const [advicelist, setAdvicelist] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const fetchAdvice = async () => {
            setLoading(true);
          try {
            const res = await api.get('/dak/user-reports');
            // const sorted = ;
            // const options = res.data.sort(
            //     (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            //   ).filter((d) => d.status !== 'completed').map((dak) => ({
            //   value: dak._id,
            //   label: `${dak.subject} (${dak.mail_id})`,
            // }));
            const opt = res.data.filter(d => d.userAdviceRequest.some(val => val.status !== 'NA'))
      .map((val, ind) => {
        return val.userAdviceRequest.map((req, i) => ({
          _id: val._id,
          subject: val.subject,
          letterNumber: val.letterNumber,
          message: req.message,
          status: req.status,
          createdAt: req.createdAt,
          headResponse: req.headResponse,  // Default to null if headResponse is undefined
          updatedAt: req.updatedAt,
        }));
      }).flat(); 
    
            setAdvicelist(opt);
          } catch (err) {
            console.error(err);
            toast.error('Failed to load Daks');
          }finally {
            setLoading(false);
        }
        };

    const fetchRoles = async () => {
        try {
            const res = await api.get('/users/role');
            setRoles(res.data);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            setUpdatingUserId(userId);
            await api.post(`/assign-role`, { userId: userId, roleId: newRoleId });
        } catch (err) {
            console.error('Error updating role:', err);
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
            toast.error('failed to reset password');
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchAdvice();
    }, []);



    return (
        <div className="p-4">
            
            <h2 className="text-2xl font-bold mb-4">Manage Advice</h2>
            <div className="overflow-x-auto border rounded shadow bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Email</th>
                            <th className="px-4 py-2 border">Current Role</th>
                            <th className="px-4 py-2 border">Change Role</th>
                            <th className="px-4 py-2 border">Reset Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : (
                            advicelist.map((u) => {

                                return (
                                    <tr key={u._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{u.name}</td>
                                        <td className="px-4 py-2 border">{u.email}</td>
                                        <td className="px-4 py-2 border capitalize">{u?.name || 'N/A'}</td>
                                        <td className="px-4 py-2 border">
                                            <select
                                                className="border px-2 py-1 rounded capitalize"
                                                value={u.role?._id || u.role || ''}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
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
                                        <td className="px-4 py-2 border capitalize"><button onClick={(e) => resetPassword(u._id)} className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'>Reset Password</button></td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
};

export default AdviceReport;
