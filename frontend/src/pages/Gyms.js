import React, { useEffect, useState } from 'react';
import API from '../api';

const Gyms = () => {
    const [gyms, setGyms] = useState([]);
    const [form, setForm] = useState({ gym_name: '', address: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const fetchGyms = async () => {
        try {
            const { data } = await API.get('/gyms');
            setGyms(data.gyms);
        } catch (error) {
            console.error("Error fetching gyms", error);
        }
    };

    useEffect(() => {
        fetchGyms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/gyms', form);
            setForm({ gym_name: '', address: '', phone: '' });
            fetchGyms();
        } catch (error) {
            alert("Error adding gym");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await API.delete(`/gyms/${id}`);
                fetchGyms();
            } catch (error) {
                alert("Error deleting gym");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Manage Gyms</h1>
                <p className="mt-2 text-sm text-slate-600">Add and manage gym locations.</p>
            </div>

            {/* Add Gym Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-900">Add New Gym</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gym Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Downtown Fitness"
                                value={form.gym_name}
                                onChange={(e) => setForm({ ...form, gym_name: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input
                                type="text"
                                placeholder="123 Main St"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                required
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Gym'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Gym List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {gyms.map((gym) => (
                                <tr key={gym.gym_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{gym.gym_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{gym.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{gym.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(gym.gym_id)}
                                            className="text-rose-600 hover:text-rose-900 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {gyms.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">No gyms found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Gyms;
