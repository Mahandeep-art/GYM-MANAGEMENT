import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';

const Layout = () => {
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-4 text-2xl font-bold border-b border-gray-700">
                    Gym Portal
                </div>
                <div className="p-4 border-b border-gray-700 text-sm">
                    Welcome, {admin.username}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                        Dashboard
                    </Link>
                    <Link to="/gyms" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                        Gyms
                    </Link>
                    <Link to="/trainers" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                        Trainers
                    </Link>
                    <Link to="/members" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                        Members
                    </Link>
                    <Link to="/plans" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                        Plans
                    </Link>
                    <Link to="/attendance" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                        Attendance
                    </Link>
                </nav>
                <div className="p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
