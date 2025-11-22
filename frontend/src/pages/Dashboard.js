import React, { useEffect, useState } from 'react';
import API from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_members: 0,
        total_trainers: 0,
        active_subscriptions: 0,
        monthly_revenue: 0
    });

    // Attendance Section State
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await API.get('/dashboard/stats');
                setStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchData();
    }, []);

    // Fetch attendance data when date changes
    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                // Fetch all members
                const membersRes = await API.get('/members');
                setMembers(membersRes.data.members);

                // Fetch attendance for selected date
                const attendanceRes = await API.get(`/attendance?date=${selectedDate}`);

                // Create a map of member_id -> status for quick lookup
                const attendanceMap = {};
                attendanceRes.data.attendance.forEach(record => {
                    attendanceMap[record.member_id] = record.status;
                });
                setAttendance(attendanceMap);
            } catch (error) {
                console.error("Error fetching attendance data:", error);
            }
        };
        fetchAttendanceData();
    }, [selectedDate]);

    // Calculate counts for selected date
    const presentCount = Object.values(attendance).filter(status => status === 'present').length;
    const absentCount = Object.values(attendance).filter(status => status === 'absent').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-2 text-sm text-slate-600">Overview of your gym's performance and attendance.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <dt className="text-sm font-medium text-slate-500 truncate">Total Members</dt>
                    <dd className="mt-2 text-3xl font-bold text-slate-900">{stats.total_members}</dd>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <dt className="text-sm font-medium text-slate-500 truncate">Total Trainers</dt>
                    <dd className="mt-2 text-3xl font-bold text-slate-900">{stats.total_trainers}</dd>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <dt className="text-sm font-medium text-slate-500 truncate">Active Subscriptions</dt>
                    <dd className="mt-2 text-3xl font-bold text-indigo-600">{stats.active_subscriptions}</dd>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <dt className="text-sm font-medium text-slate-500 truncate">Monthly Revenue</dt>
                    <dd className="mt-2 text-3xl font-bold text-emerald-600">${stats.monthly_revenue}</dd>
                </div>
            </div>

            {/* Daily Attendance Report Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Daily Attendance Report</h3>
                        <p className="text-sm text-slate-500 mt-1">View absentees and presentees for a specific date</p>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="dashboard-date-picker" className="text-sm font-medium text-slate-700 mr-3">
                            Select Date:
                        </label>
                        <input
                            type="date"
                            id="dashboard-date-picker"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                        />
                    </div>
                </div>

                <div className="p-6">
                    {/* Summary for Selected Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Members</span>
                            <span className="mt-1 text-2xl font-bold text-slate-900">{members.length}</span>
                        </div>
                        <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4 flex flex-col">
                            <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Present</span>
                            <span className="mt-1 text-2xl font-bold text-emerald-700">{presentCount}</span>
                        </div>
                        <div className="bg-rose-50 rounded-lg border border-rose-100 p-4 flex flex-col">
                            <span className="text-xs font-medium text-rose-700 uppercase tracking-wider">Absent</span>
                            <span className="mt-1 text-2xl font-bold text-rose-700">{absentCount}</span>
                        </div>
                    </div>

                    {/* Read-Only Attendance Table */}
                    <div className="overflow-hidden ring-1 ring-slate-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Member Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {members.map((member) => {
                                    const memberStatus = attendance[member.member_id];
                                    const isPresent = memberStatus === 'present';
                                    const isMarked = memberStatus !== undefined;

                                    return (
                                        <tr key={member.member_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">{member.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                                                {member.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isMarked ? (
                                                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${isPresent
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                        {memberStatus.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                                                        NOT MARKED
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500 text-sm">
                                            No members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
