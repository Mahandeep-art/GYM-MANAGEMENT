import React, { useEffect, useState } from 'react';
import API from '../api';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [form, setForm] = useState({ gym_id: '', plan_name: '', duration: '', price: '' });
    const [loading, setLoading] = useState(false);

    const fetchPlans = async () => {
        try {
            const { data } = await API.get('/plans');
            setPlans(data.plans);
        } catch (error) {
            console.error("Error fetching plans", error);
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
        fetchPlans();
        fetchGyms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/plans', form);
            setForm({ ...form, plan_name: '', duration: '', price: '' });
            fetchPlans();
        } catch (error) {
            alert("Error adding plan");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await API.delete(`/plans/${id}`);
                fetchPlans();
            } catch (error) {
                alert("Error deleting plan");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Manage Plans</h1>
                <p className="mt-2 text-sm text-slate-600">Create and manage membership plans.</p>
            </div>

            {/* Add Plan Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-900">Add New Plan</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Monthly Gold"
                                value={form.plan_name}
                                onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Days)</label>
                            <input
                                type="number"
                                placeholder="30"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="block w-full rounded-md border-slate-300 pl-7 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                                    required
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Plan List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gym</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {plans.map((plan) => (
                                <tr key={plan.plan_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{plan.plan_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{plan.gym_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{plan.duration} days</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${plan.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(plan.plan_id)}
                                            className="text-rose-600 hover:text-rose-900 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {plans.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">No plans found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Plans;
