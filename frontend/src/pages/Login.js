import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-900">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <img
                    src="/assets/login-image.jpg"
                    alt="Gym Motivation"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-white text-center p-8">
                        <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
                        <p className="text-xl">"The only bad workout is the one that didn't happen."</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900">
                <div className="max-w-md w-full bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-700">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white">Admin Login</h2>
                        <p className="text-gray-400 mt-2">Please sign in to continue</p>
                    </div>

                    {error && <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded mb-6 text-sm text-center">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="admin@gym.com"
                                required
                            />
                        </div>
                        <div className="mb-8">
                            <label className="block text-gray-300 text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg transform hover:scale-[1.02]"
                        >
                            Sign In
                        </button>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
