import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import axios from 'axios';

const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        // Prevent duplicate processing
        if (processed) return;

        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Google authentication was cancelled or failed.');
            setLoading(false);
            setProcessed(true);
            setTimeout(() => navigate('/student/login'), 3000);
            return;
        }

        if (!code) {
            setError('No authorization code received from Google.');
            setLoading(false);
            setProcessed(true);
            setTimeout(() => navigate('/student/login'), 3000);
            return;
        }

        // Mark as processed immediately to prevent duplicate calls
        setProcessed(true);

        // Exchange code for token and login
        handleGoogleAuth(code);
    }, [searchParams, navigate, processed]);

    const handleGoogleAuth = async (code: string) => {
        try {
            console.log('🔄 Starting Google OAuth flow...');

            // Exchange authorization code for access token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code,
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
                    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json().catch(() => ({}));
                console.error('❌ Token exchange failed:', errorData);
                throw new Error(errorData.error_description || errorData.error || 'Failed to exchange code for token');
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            if (!accessToken) {
                throw new Error('No access token received from Google');
            }

            console.log('✅ Token exchange successful');

            // Get user info from Google
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json().catch(() => ({}));
                console.error('❌ User info fetch failed:', errorData);
                throw new Error('Failed to get user info from Google');
            }

            const userData = await userResponse.json();
            const email = userData.email;
            const name = userData.name || userData.given_name || email.split('@')[0];

            if (!email) {
                throw new Error('No email received from Google');
            }

            console.log('✅ User info retrieved:', { email, name });

            // Try to login first (check if account exists)
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
                console.log('🔐 Attempting Google login for:', email);

                const loginResponse = await axios.post(
                    `${API_BASE_URL}/auth/google/login`,
                    { email },
                    {
                        timeout: 10000, // 10 second timeout
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (loginResponse.data && loginResponse.data.success) {
                    // Account exists - login successful
                    console.log('✅ Login successful, storing token...');
                    localStorage.setItem('student_auth_token', loginResponse.data.data.token);
                    localStorage.setItem('user', JSON.stringify(loginResponse.data.data.user));
                    console.log('✅ Token stored, navigating to dashboard...');
                    navigate('/student/dashboard');
                    return;
                } else {
                    throw new Error('Login response was not successful');
                }
            } catch (loginError: any) {
                console.log('🔍 Login attempt result:', {
                    status: loginError?.response?.status,
                    message: loginError?.response?.data?.message,
                    error: loginError?.message
                });

                // If login fails, check if it's because account doesn't exist
                if (loginError?.response?.status === 401 &&
                    loginError?.response?.data?.message?.includes('Account not found')) {
                    // Account doesn't exist - redirect to signup
                    console.log('📝 Account not found, redirecting to signup...');
                    navigate(`/auth/google/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
                    return;
                }

                // Network errors or other issues - show retry option
                if (loginError?.code === 'ECONNABORTED' || loginError?.code === 'ERR_NETWORK') {
                    console.error('❌ Network error during login:', loginError);
                    setError('Network error. Please check your connection and try again.');
                } else {
                    // Other error - show message
                    console.error('❌ Google OAuth login error:', loginError);
                    const errorMessage = loginError?.response?.data?.message ||
                        loginError?.message ||
                        'Failed to authenticate with Google. Please try again.';
                    setError(errorMessage);
                }
                setLoading(false);
                // Don't auto-redirect on error, let user retry
                return;
            }
        } catch (err: any) {
            console.error('❌ Google auth error:', err);
            const errorMessage = err?.message || 'Failed to authenticate with Google. Please try again.';
            setError(errorMessage);
            setLoading(false);
            // Don't auto-redirect, let user see the error and retry
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-medium">Authenticating with Google...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setError('');
                                setLoading(true);
                                setProcessed(false);
                                // Retry by going back to login and trying again
                                navigate('/student/login');
                            }}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/student/login')}
                            className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default GoogleCallback;

