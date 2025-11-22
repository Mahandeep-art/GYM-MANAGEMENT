import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Gyms from './pages/Gyms';
import Trainers from './pages/Trainers';
import Plans from './pages/Plans';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gyms" element={<Gyms />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/members" element={<Members />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/attendance" element={<Attendance />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
