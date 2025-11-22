import React, { useEffect, useState } from 'react';
import API from '../api';

const Trainers = () => {
    const [trainers, setTrainers] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [form, setForm] = useState({ gym_id: '', name: '', phone: '', email: '', specialization: '', salary: '' });
    const [loading, setLoading] = useState(false);

    const fetchTrainers = async () => {
        try {
            const { data } = await API.get('/trainers');
            setTrainers(data.trainers);
        } catch (error) {
            console.error("Error fetching trainers", error);
        }
    };

    const fetchGyms = async () => {
        try {
            const { data } = await API.get('/gyms');
            setGyms(data.gyms);
            if (data.gyms.length > 0) setForm(f => ({ ...f, gym_id: data.gyms[0].gym_id }));
        } catch (error) {
            console.error("Error fetching gyms", error);
        }
    };

    useEffect(() => {
        fetchTrainers();
        fetchGyms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/trainers', form);
            setForm({ ...form, name: '', phone: '', email: '', specialization: '', salary: '' });
            fetchTrainers();
        } catch (error) {
            alert("Error adding trainer");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await API.delete(`/trainers/${id}`);
                fetchTrainers();
            } catch (error) {
                alert("Error deleting trainer");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Manage Trainers</h1>
                <p className="mt-2 text-sm text-slate-600">Add new trainers and manage their details.</p>
            </div>

            {/* Add Trainer Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-900">Add New Trainer</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gym</label>
                            <select
                                value={form.gym_id}
                                onChange={(e) => setForm({ ...form, gym_id: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                                required
                            >
                                <option value="">Select Gym</option>
                                {gyms.map(g => <option key={g.gym_id} value={g.gym_id}>{g.gym_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                            <input
                                type="text"
                                placeholder="e.g. Yoga, HIIT"
                                value={form.specialization}
                                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={form.salary}
                                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                    className="block w-full rounded-md border-slate-300 pl-7 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Trainer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Trainer List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gym</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {trainers.map((trainer) => (
                                <tr key={trainer.trainer_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{trainer.name}</div>
                                        <div className="text-xs text-slate-500">{trainer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{trainer.gym_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                                            {trainer.specialization || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${trainer.salary}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(trainer.trainer_id)}
                                            className="text-rose-600 hover:text-rose-900 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {trainers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">No trainers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Trainers;
