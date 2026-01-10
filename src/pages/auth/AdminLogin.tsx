import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email) {
            setError('Email is required');
            setLoading(false);
            return;
        }

        if (!password) {
            setError('Password is required');
            setLoading(false);
            return;
        }

        try {
            await login({ email, password }, 'admin');
            // Only navigate on successful login
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Admin login error:', err);
            // Stay on login page and show error
            const errorMessage = err?.response?.data?.message || 
                                err?.message || 
                                'Invalid email or password. Please try again.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6 shadow-xl">
                        SB
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Administrator Panel</h2>
                    <p className="text-gray-400">Secure sign-in for platform management</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                                placeholder="Email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                                placeholder="Password"
                                minLength={1}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black active:scale-[0.98] transition disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In as Admin'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">
                            Note: Administrator access is restricted to authorized personnel only.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/role-selection')}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        ← Back to Role Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
