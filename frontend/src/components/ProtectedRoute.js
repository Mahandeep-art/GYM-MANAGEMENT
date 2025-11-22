import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // If token exists, render child routes
    return <Outlet />;
};

export default ProtectedRoute;
