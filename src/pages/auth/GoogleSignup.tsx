import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const GoogleSignup: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        const nameParam = searchParams.get('name');
        
        if (emailParam && nameParam) {
            setEmail(emailParam);
            setName(nameParam);
            setLoading(false);
        } else {
            setError('Missing email or name information');
            setLoading(false);
        }
    }, [searchParams]);

    const handleSignup = async () => {
        if (!email || !name) {
            setError('Email and name are required');
            return;
        }

        setLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
            const response = await axios.post(`${API_BASE_URL}/auth/google/signup`, { email, name });
            
            if (response.data.success) {
                // Store token and user data
                localStorage.setItem('student_auth_token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                navigate('/student/dashboard');
            } else {
                throw new Error(response.data.message || 'Signup failed');
            }
        } catch (err: any) {
            console.error('Google signup error:', err);
            setError(err?.response?.data?.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    if (loading && !error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
                        SB
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Sign Up</h2>
                    <p className="text-gray-500">Create your account with Google</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <i className="fas fa-user"></i>
                            </span>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <i className="fas fa-envelope"></i>
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                                placeholder="Email"
                                readOnly
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSignup}
                        disabled={loading || !name || !email}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i> Creating Account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/student/login')}
                        className="text-blue-600 font-bold hover:underline text-sm"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoogleSignup;

