import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import apiService from '../../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quizzesLoading, setQuizzesLoading] = useState(true);

    useEffect(() => {
        loadStats();
        loadQuizzes();
    }, []);

    const loadStats = async () => {
        try {
            const data = await apiService.getAdminDashboardStats();
            // Map API data to UI stats format
            setStats([
                { label: 'Total Students', value: data.totalStudents.toLocaleString(), icon: 'fas fa-users', color: 'blue' },
                { label: 'Active Courses', value: data.activeCourses.toString(), icon: 'fas fa-book', color: 'indigo' },
                { label: 'Average Score', value: `${data.avgQuizScore}%`, icon: 'fas fa-star', color: 'yellow' },
                { label: 'Enrollments', value: data.totalEnrollments.toLocaleString(), icon: 'fas fa-graduation-cap', color: 'green' },
            ]);
        } catch (err) {
            console.error('Error fetching admin analytics:', err);
            // Fallback to mock data
            setStats([
                { label: 'Total Students', value: '1,248', icon: 'fas fa-users', color: 'blue' },
                { label: 'Active Courses', value: '24', icon: 'fas fa-book', color: 'indigo' },
                { label: 'Average Score', value: '78%', icon: 'fas fa-star', color: 'yellow' },
                { label: 'Enrollments', value: '3,500', icon: 'fas fa-graduation-cap', color: 'green' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadQuizzes = async () => {
        try {
            const data = await apiService.getAdminQuizzes();
            setQuizzes(data);
        } catch (err) {
            console.error('Error fetching quizzes:', err);
            setQuizzes([]);
        } finally {
            setQuizzesLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Administrator</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center mb-4 text-xl`}>
                            <i className={stat.icon}></i>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Quizzes</h2>
                    <Link
                        to="/admin/courses/create"
                        className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center shadow-lg shadow-indigo-100 text-sm"
                    >
                        <i className="fas fa-plus mr-2"></i> Create Quiz
                    </Link>
                </div>

                {quizzesLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <i className="fas fa-clipboard-list text-4xl mb-4"></i>
                        <p>No quizzes created yet</p>
                        <Link
                            to="/admin/courses/create"
                            className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
                        >
                            Create Your First Quiz
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Quiz Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Course</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Questions</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Submissions</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Avg Score</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quizzes.slice(0, 10).map((quiz) => (
                                    <tr key={quiz.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-gray-900">{quiz.title}</div>
                                            {quiz.description && (
                                                <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                                    {quiz.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-gray-700">{quiz.courseTitle || 'N/A'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                                                <i className="fas fa-question-circle mr-2"></i>
                                                {quiz.totalQuestions}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-gray-600">{quiz.totalSubmissions || 0}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-sm font-bold ${quiz.averageScore >= 70 ? 'text-green-600' : quiz.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {quiz.averageScore ? `${quiz.averageScore.toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs text-gray-500">
                                                {new Date(quiz.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {quizzes.length > 10 && (
                            <div className="mt-4 text-center">
                                <Link
                                    to="/admin/quizzes"
                                    className="text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                                >
                                    View All Quizzes ({quizzes.length})
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
