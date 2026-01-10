import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import apiService from '../../services/api';
import { Link } from 'react-router-dom';

const AdminCourses: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            await apiService.getCourses();
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                    <Link
                        to="/admin/courses/create"
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center shadow-lg shadow-indigo-100"
                    >
                        <i className="fas fa-plus mr-2 text-sm"></i> Create New Quiz
                    </Link>
                </div>
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        <i className="fas fa-book-open text-5xl mb-4"></i>
                        <p>Course creation and management features coming soon</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCourses;
