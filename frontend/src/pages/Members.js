import React, { useEffect, useState } from 'react';
import API from '../api';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [plans, setPlans] = useState([]);

    const [form, setForm] = useState({ gym_id: '', name: '', phone: '', email: '', gender: 'male', trainer_id: '', join_date: '' });
    const [subForm, setSubForm] = useState({ member_id: null, plan_id: '', start_date: '', amount_paid: '' });

    const [showSubModal, setShowSubModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [mRes, gRes, tRes, pRes] = await Promise.all([
                API.get('/members'),
                API.get('/gyms'),
                API.get('/trainers'),
                API.get('/plans')
            ]);
            setMembers(mRes.data.members);
            setGyms(gRes.data.gyms);
            setTrainers(tRes.data.trainers);
            setPlans(pRes.data.plans);

            if (gRes.data.gyms.length > 0) setForm(f => ({ ...f, gym_id: gRes.data.gyms[0].gym_id }));
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddMember = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                trainer_id: form.trainer_id || null,
                join_date: form.join_date || null
            };
            await API.post('/members', payload);
            setForm({ ...form, name: '', phone: '', email: '', gender: 'male', trainer_id: '', join_date: '' });
            fetchData();
            alert("Member added successfully!");
        } catch (error) {
            console.error("Add Member Error:", error);
            alert(error.response?.data?.message || "Error adding member");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await API.delete(`/members/${id}`);
                fetchData();
            } catch (error) {
                alert("Error deleting member");
            }
        }
    };

    const handleAssignSubscription = async (e) => {
        e.preventDefault();
        try {
            await API.post('/subscriptions/assign', subForm);
            setShowSubModal(false);
            alert("Subscription assigned!");
            fetchData(); // Refresh to show active status if we had it in list
        } catch (error) {
            alert("Error assigning subscription");
        }
    };

    const openSubModal = (member) => {
        setSubForm({ member_id: member.member_id, plan_id: '', start_date: new Date().toISOString().split('T')[0], amount_paid: '' });
        setShowSubModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Manage Members</h1>
                <p className="mt-2 text-sm text-slate-600">Add new members and manage their subscriptions.</p>
            </div>

            {/* Add Member Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-900">Add New Member</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select
                                value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Trainer</label>
                            <select
                                value={form.trainer_id}
                                onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                            >
                                <option value="">Select Trainer (Optional)</option>
                                {trainers.map(t => <option key={t.trainer_id} value={t.trainer_id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                            <input
                                type="date"
                                value={form.join_date}
                                onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Member'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Member List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trainer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {members.map((member) => (
                                <tr key={member.member_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{member.name}</div>
                                        <div className="text-xs text-slate-500">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{member.phone || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{member.trainer_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${member.membership_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                            {member.membership_status ? member.membership_status.toUpperCase() : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => openSubModal(member)}
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                        >
                                            Assign Plan
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.member_id)}
                                            className="text-rose-600 hover:text-rose-900 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">No members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Subscription Modal */}
            {showSubModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowSubModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                                            Assign Subscription
                                        </h3>
                                        <div className="mt-4">
                                            <form onSubmit={handleAssignSubscription} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                                                    <select
                                                        value={subForm.plan_id}
                                                        onChange={(e) => setSubForm({ ...subForm, plan_id: e.target.value })}
                                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                                                        required
                                                    >
                                                        <option value="">Select Plan</option>
                                                        {plans.map(p => <option key={p.plan_id} value={p.plan_id}>{p.plan_name} - ${p.price}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={subForm.start_date}
                                                        onChange={(e) => setSubForm({ ...subForm, start_date: e.target.value })}
                                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid</label>
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={subForm.amount_paid}
                                                            onChange={(e) => setSubForm({ ...subForm, amount_paid: e.target.value })}
                                                            className="block w-full rounded-md border-slate-300 pl-7 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                                    >
                                                        Assign
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowSubModal(false)}
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
