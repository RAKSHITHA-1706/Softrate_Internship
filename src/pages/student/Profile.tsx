import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layouts/StudentLayout';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentProfile: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch delay
        const timer = setTimeout(() => setLoading(false), 800);
        // Real API call attempt
        apiService.getStudentDashboard().catch(() => { });
        return () => clearTimeout(timer);
    }, []);
    return (
        <StudentLayout>
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
                {loading ? (
                    <div className="py-12 flex justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                                {user?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            <i className="fas fa-user-circle text-5xl mb-4"></i>
                            <p>Profile management coming soon</p>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default StudentProfile;
