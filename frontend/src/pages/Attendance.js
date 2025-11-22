import React, { useEffect, useState } from 'react';
import API from '../api';

const Attendance = () => {
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
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
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const markAttendance = async (member, status) => {
        setLoading(true);
        try {
            await API.post('/attendance', {
                member_id: member.member_id,
                gym_id: member.gym_id,
                date: selectedDate,
                status: status
            });

            // Update local state
            setAttendance(prev => ({
                ...prev,
                [member.member_id]: status
            }));

            // alert(`Attendance marked as ${status} for ${member.name}`);
        } catch (error) {
            console.error("Error marking attendance:", error);
            alert(error.response?.data?.message || "Error marking attendance");
        }
        setLoading(false);
    };

    // Calculate counts
    const presentCount = Object.values(attendance).filter(status => status === 'present').length;
    const absentCount = Object.values(attendance).filter(status => status === 'absent').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
                    <p className="mt-2 text-sm text-slate-600">Mark and view daily attendance.</p>
                </div>
                <div className="flex items-center">
                    <label htmlFor="date-picker" className="text-sm font-medium text-slate-700 mr-3">
                        Select Date:
                    </label>
                    <input
                        type="date"
                        id="date-picker"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="block rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <dt className="text-sm font-medium text-slate-500 truncate">Total Members</dt>
                    <dd className="mt-2 text-3xl font-bold text-slate-900">{members.length}</dd>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <dt className="text-sm font-medium text-slate-500 truncate">Present</dt>
                    <dd className="mt-2 text-3xl font-bold text-emerald-600">{presentCount}</dd>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <dt className="text-sm font-medium text-slate-500 truncate">Absent</dt>
                    <dd className="mt-2 text-3xl font-bold text-rose-600">{absentCount}</dd>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
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
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {members.map((member) => {
                                const memberStatus = attendance[member.member_id];
                                const isPresent = memberStatus === 'present';
                                const isAbsent = memberStatus === 'absent';
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => markAttendance(member, 'present')}
                                                    disabled={loading}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isPresent
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(member, 'absent')}
                                                    disabled={loading}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${isAbsent
                                                        ? 'bg-rose-600 text-white shadow-sm'
                                                        : 'bg-white border border-rose-600 text-rose-600 hover:bg-rose-50'
                                                        }`}
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">
                                        No members found. Please add members first.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
